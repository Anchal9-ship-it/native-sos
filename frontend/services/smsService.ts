import { EmergencyContact } from '../utils/storage';
import { LocationData } from './locationService';

export interface VitalsData {
  heartRate: number;
  spO2: number;
  source: 'camera' | 'wearable';
}

export interface EmergencyMessage {
  message: string;
  location: LocationData;
  vitals?: VitalsData;
  timestamp: number;
}

// Mock SMS sending - in production, this would integrate with Twilio or similar
export const sendEmergencySMS = async (
  contacts: EmergencyContact[],
  location: LocationData | null,
  vitals?: VitalsData
): Promise<boolean> => {
  try {
    const mapsLink = location 
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';

    const vitalsText = vitals 
      ? `\nVitals: HR ${vitals.heartRate} bpm, SpO2 ${vitals.spO2}%`
      : '';

    const message = `🚨 EMERGENCY SOS ALERT 🚨\n\nI need immediate help!\n\nLocation: ${location?.address || 'Unknown'}\nMaps: ${mapsLink}${vitalsText}\n\nTime: ${new Date().toLocaleString()}\n\nThis is an automated emergency message.`;

    // Mock sending - log to console
    console.log('=== EMERGENCY SMS SENT ===');
    console.log('Recipients:', contacts.length);
    contacts.forEach(contact => {
      console.log(`→ ${contact.name} (${contact.phone})`);
    });
    console.log('Message:', message);
    console.log('========================');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return true;
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    return false;
  }
};

export const formatEmergencyMessage = (
  location: LocationData | null,
  vitals?: VitalsData
): string => {
  let message = '🚨 EMERGENCY SOS ALERT 🚨\n\n';
  message += 'I need immediate help!\n\n';
  
  if (location) {
    message += `Location: ${location.address || 'Address unavailable'}\n`;
    message += `Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}\n`;
  } else {
    message += 'Location: Unable to determine\n';
  }
  
  if (vitals) {
    message += `\nHealth Vitals:\n`;
    message += `❤️ Heart Rate: ${vitals.heartRate} bpm\n`;
    message += `🫁 SpO2: ${vitals.spO2}%\n`;
    message += `Source: ${vitals.source === 'camera' ? '📱 Phone Camera' : '⌚ Wearable'}\n`;
  }
  
  message += `\n⏰ Time: ${new Date().toLocaleString()}\n`;
  message += '\nThis is an automated emergency message.';
  
  return message;
};
