import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { getEmergencyContacts, getSettings } from '../utils/storage';
import { getCurrentLocation } from '../services/locationService';
import { sendEmergencySMS } from '../services/smsService';
import { initializeAudio } from '../services/alertService';
import { VolumeButton } from '../services/nativeModules';

export default function Index() {
  const router = useRouter();
  const [contactsCount, setContactsCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  // Volume button listener for SOS trigger
  useEffect(() => {
    console.log('Setting up volume button listener...');
    VolumeButton.enable();
    
    const removeListener = VolumeButton.addListener(() => {
      console.log('🔊 Volume buttons pressed together - triggering SOS!');
      handleSOSTrigger();
    });

    return () => {
      console.log('Cleaning up volume button listener...');
      removeListener();
      VolumeButton.disable();
    };
  }, []);

  const initializeApp = async () => {
    await initializeAudio();
    const contacts = await getEmergencyContacts();
    setContactsCount(contacts.length);
    setIsReady(true);
  };

  const handleSOSTrigger = async () => {
    const contacts = await getEmergencyContacts();
    
    if (contacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'Please add emergency contacts before triggering SOS.',
        [
          { text: 'Add Contacts', onPress: () => router.push('/contacts') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    Alert.alert(
      '🚨 EMERGENCY SOS',
      'Are you sure you want to trigger emergency alert?\n\nThis will send your location and health vitals to all emergency contacts.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'TRIGGER SOS',
          style: 'destructive',
          onPress: () => activateSOS(),
        },
      ]
    );
  };

  const activateSOS = () => {
    router.push('/sos-active');
  };

  // Edge swipe gesture handler
  const onGestureEvent = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Detect swipe from left edge
      if (translationX > 100 && velocityX > 500) {
        handleSOSTrigger();
      }
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <PanGestureHandler onHandlerStateChange={onGestureEvent}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Edge Swipe Indicator */}
        <View style={styles.swipeIndicator}>
          <Ionicons name="chevron-forward" size={20} color="#DC2626" />
          <Text style={styles.swipeText}>Swipe from edge to trigger SOS</Text>
        </View>

        {/* Main SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={handleSOSTrigger}
            activeOpacity={0.8}
          >
            <Ionicons name="alert-circle" size={80} color="#fff" />
            <Text style={styles.sosButtonText}>SOS</Text>
            <Text style={styles.sosButtonSubtext}>TAP FOR EMERGENCY</Text>
          </TouchableOpacity>
          
          <Text style={styles.sosDescription}>
            Press and hold the SOS button to trigger emergency alert
          </Text>
        </View>

        {/* Status Cards */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusCard, contactsCount === 0 && styles.statusCardWarning]}>
            <Ionicons 
              name="people" 
              size={24} 
              color={contactsCount === 0 ? '#DC2626' : '#10B981'} 
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Emergency Contacts</Text>
              <Text style={[styles.statusValue, contactsCount === 0 && styles.statusValueWarning]}>
                {contactsCount}/5 contacts
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/contacts')}>
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.statusCard}>
            <Ionicons name="fitness" size={24} color="#3B82F6" />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Health Monitor</Text>
              <Text style={styles.statusValue}>Track vitals</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/vitals')}>
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.statusCard}>
            <Ionicons name="settings" size={24} color="#8B5CF6" />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Settings</Text>
              <Text style={styles.statusValue}>Alerts & preferences</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Alternative Triggers Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Alternative SOS Triggers:</Text>
          <View style={styles.infoItem}>
            <Ionicons name="volume-high" size={20} color="#6B7280" />
            <Text style={styles.infoText}>Press both volume buttons together</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="hand-left" size={20} color="#6B7280" />
            <Text style={styles.infoText}>Swipe from screen edge</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="lock-open" size={20} color="#6B7280" />
            <Text style={styles.infoText}>SOS button on lock screen (limited)</Text>
          </View>
        </View>

        {/* Warning if no contacts */}
        {contactsCount === 0 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={24} color="#DC2626" />
            <Text style={styles.warningText}>
              Add emergency contacts to enable SOS alerts
            </Text>
          </View>
        )}
      </ScrollView>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  swipeText: {
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  sosContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#fff',
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sosButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  sosDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusCardWarning: {
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  statusValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  statusValueWarning: {
    color: '#DC2626',
  },
  infoContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 12,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  warningText: {
    color: '#FCA5A5',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});
