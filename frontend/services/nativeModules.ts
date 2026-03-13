import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { VolumeButtonModule, FlashlightModule } = NativeModules;

// Volume Button Listener
export const VolumeButton = {
  enable: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      return await VolumeButtonModule.enableVolumeButtonListener();
    } catch (error) {
      console.error('Error enabling volume button:', error);
      return false;
    }
  },

  disable: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      return await VolumeButtonModule.disableVolumeButtonListener();
    } catch (error) {
      console.error('Error disabling volume button:', error);
      return false;
    }
  },

  addListener: (callback: () => void) => {
    if (Platform.OS !== 'android') return () => {};
    
    const eventEmitter = new NativeEventEmitter(VolumeButtonModule);
    const subscription = eventEmitter.addListener('onVolumeButtonsPressed', callback);
    
    return () => subscription.remove();
  },
};

// Flashlight Control
export const Flashlight = {
  turnOn: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      return await FlashlightModule.turnOn();
    } catch (error) {
      console.error('Error turning on flashlight:', error);
      return false;
    }
  },

  turnOff: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      return await FlashlightModule.turnOff();
    } catch (error) {
      console.error('Error turning off flashlight:', error);
      return false;
    }
  },

  toggle: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      return await FlashlightModule.toggle();
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      return false;
    }
  },

  getStatus: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      return await FlashlightModule.getStatus();
    } catch (error) {
      console.error('Error getting flashlight status:', error);
      return false;
    }
  },
};
