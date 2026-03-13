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

// Platform-specific storage wrapper that works on web and native
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        return localStorage.getItem(key);
      } else {
        // Dynamically import AsyncStorage only for native platforms
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.default.getItem(key);
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.setItem(key, value);
      } else {
        // Dynamically import AsyncStorage only for native platforms
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.removeItem(key);
      } else {
        // Dynamically import AsyncStorage only for native platforms
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
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
