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

// Flashlight blinking with NATIVE Android module
export const startFlashlightBlink = async (): Promise<void> => {
  try {
    console.log('🔦 Starting native flashlight...');

    if (Platform.OS === 'android') {
      // Use native Android flashlight module
      let isOn = false;
      flashlightInterval = setInterval(async () => {
        try {
          isOn = !isOn;
          if (isOn) {
            await Flashlight.turnOn();
          } else {
            await Flashlight.turnOff();
          }
          console.log(`Flashlight: ${isOn ? 'ON' : 'OFF'}`);
        } catch (err) {
          console.error('Flashlight toggle error:', err);
        }
      }, 500);

      console.log('✅ Native flashlight blinking started');
    } else {
      // iOS: Fallback (requires CameraView component)
      console.log('⚠️ iOS flashlight needs CameraView component');
      Alert.alert('iOS Notice', 'Flashlight requires camera component on iOS');
    }

  } catch (error) {
    console.error('❌ Error starting flashlight:', error);
    Alert.alert('Flashlight Error', 'Could not start flashlight.');
  }
};

export const stopFlashlightBlink = async (): Promise<void> => {
  try {
    if (flashlightInterval) {
      clearInterval(flashlightInterval);
      flashlightInterval = null;
    }
    if (Platform.OS === 'android') {
      await Flashlight.turnOff();
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
