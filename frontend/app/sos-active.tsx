import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getEmergencyContacts, getSettings } from '../utils/storage';
import { getCurrentLocation, LocationData } from '../services/locationService';
import { sendEmergencySMS, formatEmergencyMessage } from '../services/smsService';
import {
  initializeAudio,
  startAlarm,
  stopAlarm,
  startFlashlightBlink,
  stopFlashlightBlink,
  triggerHapticFeedback,
  stopAllAlerts,
} from '../services/alertService';

export default function SOSActive() {
  const router = useRouter();
  const [status, setStatus] = useState<'activating' | 'active' | 'sent' | 'error'>('activating');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [contactsCount, setContactsCount] = useState(0);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [isCancellable, setIsCancellable] = useState(true);

  useEffect(() => {
    activateEmergencyMode();

    return () => {
      // Cleanup when component unmounts
      stopAllAlerts();
    };
  }, []);

  const activateEmergencyMode = async () => {
    try {
      // Start countdown before sending
      let count = 5;
      setIsCancellable(true);
      
      const countdownInterval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        
        if (count === 0) {
          clearInterval(countdownInterval);
          setIsCancellable(false);
          sendEmergencyAlert();
        }
      }, 1000);

      // Store interval for cleanup
      (global as any).sosCountdownInterval = countdownInterval;

      // Trigger haptic feedback
      await triggerHapticFeedback();

    } catch (error) {
      console.error('Error activating emergency mode:', error);
      setStatus('error');
    }
  };

  const sendEmergencyAlert = async () => {
    try {
      setStatus('active');

      // Get user settings
      const settings = await getSettings();

      // Start alerts based on settings
      await initializeAudio();
      
      if (settings.enableAlarm) {
        await startAlarm();
      }
      
      if (settings.enableFlashlight) {
        await startFlashlightBlink();
      }

      // Get emergency contacts
      const contacts = await getEmergencyContacts();
      setContactsCount(contacts.length);

      if (contacts.length === 0) {
        setStatus('error');
        Alert.alert('No Contacts', 'No emergency contacts found');
        return;
      }

      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Mock vitals (in production, read from camera or wearable)
      const mockVitals = {
        heartRate: 75,
        spO2: 98,
        source: 'camera' as const,
      };

      // Format emergency message
      const emergencyMsg = formatEmergencyMessage(currentLocation, mockVitals);
      setMessage(emergencyMsg);

      // Send SMS to all contacts
      const sent = await sendEmergencySMS(contacts, currentLocation, mockVitals);

      if (sent) {
        setStatus('sent');
        // Vibrate to confirm
        await triggerHapticFeedback();
      } else {
        setStatus('error');
      }

    } catch (error) {
      console.error('Error sending emergency alert:', error);
      setStatus('error');
    }
  };

  const handleCancel = () => {
    if (!isCancellable) return;

    Alert.alert(
      'Cancel SOS',
      'Are you sure you want to cancel the emergency alert?',
      [
        { text: 'No, Continue', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if ((global as any).sosCountdownInterval) {
              clearInterval((global as any).sosCountdownInterval);
            }
            await stopAllAlerts();
            router.back();
          },
        },
      ]
    );
  };

  const handleDeactivate = async () => {
    Alert.alert(
      'Deactivate SOS',
      'Are you sure you want to stop the emergency alert?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Stop',
          onPress: async () => {
            await stopAllAlerts();
            router.back();
          },
        },
      ]
    );
  };

  const openMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          {status === 'activating' && (
            <>
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
              <Text style={styles.statusTitle}>Activating Emergency SOS</Text>
              <Text style={styles.statusSubtitle}>
                Alert will be sent in {countdown} seconds
              </Text>
            </>
          )}

          {status === 'active' && (
            <>
              <View style={styles.pulseContainer}>
                <View style={[styles.pulse, styles.pulse1]} />
                <View style={[styles.pulse, styles.pulse2]} />
                <View style={[styles.pulse, styles.pulse3]} />
                <Ionicons name="alert-circle" size={64} color="#fff" />
              </View>
              <Text style={styles.statusTitle}>🚨 SOS ACTIVE</Text>
              <Text style={styles.statusSubtitle}>Sending emergency alerts...</Text>
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 16 }} />
            </>
          )}

          {status === 'sent' && (
            <>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              <Text style={styles.statusTitle}>Alert Sent Successfully</Text>
              <Text style={styles.statusSubtitle}>
                Emergency message sent to {contactsCount} contacts
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <Ionicons name="close-circle" size={80} color="#DC2626" />
              <Text style={styles.statusTitle}>Alert Failed</Text>
              <Text style={styles.statusSubtitle}>
                Could not send emergency alert
              </Text>
            </>
          )}
        </View>

        {/* Location Info */}
        {location && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="location" size={24} color="#3B82F6" />
              <Text style={styles.infoTitle}>Your Location</Text>
            </View>
            <Text style={styles.infoText}>
              {location.address || 'Address unavailable'}
            </Text>
            <Text style={styles.infoCoords}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
              <Ionicons name="map" size={16} color="#fff" />
              <Text style={styles.mapButtonText}>View on Maps</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Message Preview */}
        {message && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="mail" size={24} color="#8B5CF6" />
              <Text style={styles.infoTitle}>Message Sent</Text>
            </View>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {/* Alert Status */}
        <View style={styles.alertStatusCard}>
          <View style={styles.alertItem}>
            <Ionicons name="megaphone" size={20} color="#DC2626" />
            <Text style={styles.alertText}>Alarm: Active</Text>
          </View>
          <View style={styles.alertItem}>
            <Ionicons name="flashlight" size={20} color="#F59E0B" />
            <Text style={styles.alertText}>Flashlight: Blinking</Text>
          </View>
          <View style={styles.alertItem}>
            <Ionicons name="people" size={20} color="#10B981" />
            <Text style={styles.alertText}>{contactsCount} contacts notified</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>What happens next?</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.instructionText}>
              Your emergency contacts have received your location and vitals
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.instructionText}>
              Alarm and flashlight are active to alert nearby people
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.instructionText}>
              Stay calm and wait for help to arrive
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isCancellable && status === 'activating' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.actionButtonText}>Cancel Alert</Text>
          </TouchableOpacity>
        )}

        {(status === 'active' || status === 'sent') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deactivateButton]}
            onPress={handleDeactivate}
          >
            <Text style={styles.actionButtonText}>Stop Alerts</Text>
          </TouchableOpacity>
        )}

        {status === 'error' && (
          <View>
            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={sendEmergencyAlert}
            >
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.backButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.actionButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7F1D1D',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  statusHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  countdownContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  pulseContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pulse1: {
    transform: [{ scale: 1 }],
  },
  pulse2: {
    transform: [{ scale: 1.2 }],
  },
  pulse3: {
    transform: [{ scale: 1.4 }],
  },
  statusTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusSubtitle: {
    color: '#FCA5A5',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#991B1B',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoText: {
    color: '#FCA5A5',
    fontSize: 16,
    lineHeight: 24,
  },
  infoCoords: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  messageText: {
    color: '#FCA5A5',
    fontSize: 14,
    lineHeight: 20,
  },
  alertStatusCard: {
    backgroundColor: '#991B1B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  instructionsCard: {
    backgroundColor: '#991B1B',
    padding: 20,
    borderRadius: 12,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletPoint: {
    color: '#FCA5A5',
    fontSize: 20,
    marginRight: 12,
  },
  instructionText: {
    color: '#FCA5A5',
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#7F1D1D',
    borderTopWidth: 1,
    borderTopColor: '#991B1B',
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#fff',
  },
  deactivateButton: {
    backgroundColor: '#374151',
  },
  retryButton: {
    backgroundColor: '#DC2626',
  },
  backButton: {
    backgroundColor: '#374151',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
