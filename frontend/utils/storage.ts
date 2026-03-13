import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface UserSettings {
  enableAlarm: boolean;
  enableFlashlight: boolean;
  volumeButtonTrigger: boolean;
  edgeSwipeTrigger: boolean;
}

const CONTACTS_KEY = '@emergency_contacts';
const SETTINGS_KEY = '@user_settings';

// Platform-specific storage wrapper
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage error:', error);
        return null;
      }
    }
    return await AsyncStorage.getItem(key);
  },
  
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage error:', error);
      }
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage error:', error);
      }
      return;
    }
    await AsyncStorage.removeItem(key);
  }
};

// Emergency Contacts
export const getEmergencyContacts = async (): Promise<EmergencyContact[]> => {
  try {
    const data = await storage.getItem(CONTACTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading contacts:', error);
    return [];
  }
};

export const saveEmergencyContacts = async (contacts: EmergencyContact[]): Promise<void> => {
  try {
    await storage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error('Error saving contacts:', error);
  }
};

export const addEmergencyContact = async (contact: EmergencyContact): Promise<void> => {
  const contacts = await getEmergencyContacts();
  if (contacts.length >= 5) {
    throw new Error('Maximum 5 emergency contacts allowed');
  }
  contacts.push(contact);
  await saveEmergencyContacts(contacts);
};

export const deleteEmergencyContact = async (id: string): Promise<void> => {
  const contacts = await getEmergencyContacts();
  const filtered = contacts.filter(c => c.id !== id);
  await saveEmergencyContacts(filtered);
};

// User Settings
export const getSettings = async (): Promise<UserSettings> => {
  try {
    const data = await storage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      enableAlarm: true,
      enableFlashlight: true,
      volumeButtonTrigger: true,
      edgeSwipeTrigger: true,
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      enableAlarm: true,
      enableFlashlight: true,
      volumeButtonTrigger: true,
      edgeSwipeTrigger: true,
    };
  }
};

export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
