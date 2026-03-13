import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSettings, saveSettings, UserSettings } from '../utils/storage';

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>({
    enableAlarm: true,
    enableFlashlight: true,
    volumeButtonTrigger: true,
    edgeSwipeTrigger: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Settings</Text>
        <Text style={styles.sectionDescription}>
          Configure what happens when SOS is triggered
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="megaphone" size={24} color="#DC2626" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Alarm Sound</Text>
              <Text style={styles.settingSubtext}>
                Play loud alarm to alert nearby people
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enableAlarm}
            onValueChange={(value) => updateSetting('enableAlarm', value)}
            trackColor={{ false: '#374151', true: '#DC2626' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="flashlight" size={24} color="#F59E0B" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Flashlight Blink</Text>
              <Text style={styles.settingSubtext}>
                Blink flashlight to attract attention
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enableFlashlight}
            onValueChange={(value) => updateSetting('enableFlashlight', value)}
            trackColor={{ false: '#374151', true: '#DC2626' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trigger Methods</Text>
        <Text style={styles.sectionDescription}>
          Choose how to activate SOS
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="volume-high" size={24} color="#3B82F6" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Volume Buttons</Text>
              <Text style={styles.settingSubtext}>
                Press both volume buttons together
              </Text>
            </View>
          </View>
          <Switch
            value={settings.volumeButtonTrigger}
            onValueChange={(value) => updateSetting('volumeButtonTrigger', value)}
            trackColor={{ false: '#374151', true: '#DC2626' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="hand-left" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Edge Swipe</Text>
              <Text style={styles.settingSubtext}>
                Swipe from screen edge to trigger SOS
              </Text>
            </View>
          </View>
          <Switch
            value={settings.edgeSwipeTrigger}
            onValueChange={(value) => updateSetting('edgeSwipeTrigger', value)}
            trackColor={{ false: '#374151', true: '#DC2626' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#3B82F6" />
        <Text style={styles.infoText}>
          Lock screen features are limited in mobile apps. For best results, keep the app accessible on your home screen or use quick access shortcuts.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>App Purpose</Text>
          <Text style={styles.aboutText}>
            Emergency One-Tap Lock Screen App provides quick access to emergency services with automatic location sharing and health vitals monitoring.
          </Text>
        </View>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtext: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1E3A5F',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoText: {
    color: '#93C5FD',
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  aboutItem: {
    marginBottom: 16,
  },
  aboutLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  aboutValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
});
