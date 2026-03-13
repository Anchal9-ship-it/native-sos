import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';

let alarmSound: Audio.Sound | null = null;
let flashlightInterval: NodeJS.Timeout | null = null;

// Initialize audio
export const initializeAudio = async (): Promise<void> => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

// Play alarm sound
export const startAlarm = async (): Promise<void> => {
  try {
    if (alarmSound) {
      await alarmSound.unloadAsync();
    }

    // Create a simple beep tone using Audio
    // In production, you'd load an actual alarm sound file
    alarmSound = await Audio.Sound.createAsync(
      // Using a system sound for now
      { uri: 'https://www.soundjay.com/button/sounds/beep-07a.mp3' },
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );

    await alarmSound.playAsync();
    console.log('Alarm started');
  } catch (error) {
    console.error('Error starting alarm:', error);
  }
};

export const stopAlarm = async (): Promise<void> => {
  try {
    if (alarmSound) {
      await alarmSound.stopAsync();
      await alarmSound.unloadAsync();
      alarmSound = null;
      console.log('Alarm stopped');
    }
  } catch (error) {
    console.error('Error stopping alarm:', error);
  }
};

// Flashlight blinking
export const startFlashlightBlink = async (): Promise<void> => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      console.log('Camera permission denied');
      return;
    }

    let isOn = false;
    flashlightInterval = setInterval(async () => {
      try {
        isOn = !isOn;
        await Camera.setFlashModeAsync(isOn ? 'torch' : 'off');
      } catch (err) {
        console.error('Flashlight toggle error:', err);
      }
    }, 500); // Blink every 500ms

    console.log('Flashlight blinking started');
  } catch (error) {
    console.error('Error starting flashlight:', error);
  }
};

export const stopFlashlightBlink = async (): Promise<void> => {
  try {
    if (flashlightInterval) {
      clearInterval(flashlightInterval);
      flashlightInterval = null;
    }
    await Camera.setFlashModeAsync('off');
    console.log('Flashlight stopped');
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
