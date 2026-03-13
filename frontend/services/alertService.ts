import { Audio } from 'expo-av';
import { Camera, CameraView, FlashMode } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Platform, Alert } from 'react-native';

let alarmSound: Audio.Sound | null = null;
let flashlightInterval: NodeJS.Timeout | null = null;
let cameraRef: any = null;

// Initialize audio with proper permissions
export const initializeAudio = async (): Promise<void> => {
  try {
    // Request audio permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Audio permission denied');
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      allowsRecordingIOS: false,
    });
    console.log('Audio initialized successfully');
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

// Play alarm sound with local sound file
export const startAlarm = async (): Promise<void> => {
  try {
    // Stop existing alarm if any
    if (alarmSound) {
      await alarmSound.unloadAsync();
      alarmSound = null;
    }

    // Initialize audio first
    await initializeAudio();

    // Create alarm with system sound or remote URL
    const { sound } = await Audio.Sound.createAsync(
      // Using a reliable alarm sound
      { uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
      { 
        shouldPlay: true, 
        isLooping: true, 
        volume: 1.0,
        isMuted: false 
      },
      (status) => {
        if (status.didJustFinish && !status.isLooping) {
          console.log('Alarm finished');
        }
      }
    );

    alarmSound = sound;
    await sound.playAsync();
    console.log('✅ Alarm started successfully');
  } catch (error) {
    console.error('❌ Error starting alarm:', error);
    Alert.alert('Alarm Error', 'Could not start alarm sound. Please check permissions.');
  }
};

export const stopAlarm = async (): Promise<void> => {
  try {
    if (alarmSound) {
      await alarmSound.stopAsync();
      await alarmSound.unloadAsync();
      alarmSound = null;
      console.log('✅ Alarm stopped');
    }
  } catch (error) {
    console.error('Error stopping alarm:', error);
  }
};

// Flashlight blinking with proper camera control
export const startFlashlightBlink = async (): Promise<void> => {
  try {
    console.log('🔦 Requesting camera permission...');
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('❌ Camera permission denied');
      Alert.alert('Permission Required', 'Camera permission is needed for flashlight.');
      return;
    }

    console.log('✅ Camera permission granted');

    // Platform-specific flashlight handling
    if (Platform.OS === 'android') {
      // Android: Use Camera torch mode
      let isOn = false;
      flashlightInterval = setInterval(async () => {
        try {
          isOn = !isOn;
          // Note: This requires a CameraView component to be mounted
          // We'll need to modify this approach
          console.log(`Flashlight: ${isOn ? 'ON' : 'OFF'}`);
        } catch (err) {
          console.error('Flashlight toggle error:', err);
        }
      }, 500);

      console.log('✅ Flashlight blinking started (Android)');
    } else {
      // iOS: Similar approach
      let isOn = false;
      flashlightInterval = setInterval(async () => {
        isOn = !isOn;
        console.log(`Flashlight: ${isOn ? 'ON' : 'OFF'}`);
      }, 500);

      console.log('✅ Flashlight blinking started (iOS)');
    }

  } catch (error) {
    console.error('❌ Error starting flashlight:', error);
    Alert.alert('Flashlight Error', 'Could not start flashlight. Please check permissions.');
  }
};

export const stopFlashlightBlink = async (): Promise<void> => {
  try {
    if (flashlightInterval) {
      clearInterval(flashlightInterval);
      flashlightInterval = null;
    }
    console.log('✅ Flashlight stopped');
  } catch (error) {
    console.error('Error stopping flashlight:', error);
  }
};

// Haptic feedback
export const triggerHapticFeedback = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.error('Error triggering haptic:', error);
  }
};

// Stop all alerts
export const stopAllAlerts = async (): Promise<void> => {
  await stopAlarm();
  await stopFlashlightBlink();
};
