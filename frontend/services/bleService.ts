import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

let bleManager: BleManager | null = null;
let connectedDevice: Device | null = null;

// Heart Rate Service UUID (standard Bluetooth SIG UUID)
const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

export interface BleVitals {
  heartRate: number;
  timestamp: number;
}

export const initializeBLE = async (): Promise<boolean> => {
  try {
    if (bleManager) {
      return true;
    }

    bleManager = new BleManager();

    // Request Android permissions
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      if (
        permissions['android.permission.BLUETOOTH_SCAN'] !== 'granted' ||
        permissions['android.permission.BLUETOOTH_CONNECT'] !== 'granted'
      ) {
        console.log('Bluetooth permissions denied');
        return false;
      }
    }

    // Check Bluetooth state
    const state = await bleManager.state();
    if (state !== State.PoweredOn) {
      console.log('Bluetooth is not powered on');
      return false;
    }

    console.log('BLE initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing BLE:', error);
    return false;
  }
};

export const scanForDevices = async (
  onDeviceFound: (device: Device) => void,
  durationSeconds: number = 10
): Promise<void> => {
  try {
    if (!bleManager) {
      await initializeBLE();
    }

    if (!bleManager) {
      throw new Error('BLE Manager not initialized');
    }

    console.log('Starting BLE scan...');
    bleManager.startDeviceScan(
      [HEART_RATE_SERVICE_UUID],
      null,
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device && device.name) {
          console.log('Found device:', device.name);
          onDeviceFound(device);
        }
      }
    );

    // Stop scan after duration
    setTimeout(() => {
      bleManager?.stopDeviceScan();
      console.log('BLE scan stopped');
    }, durationSeconds * 1000);
  } catch (error) {
    console.error('Error scanning for devices:', error);
  }
};

export const connectToDevice = async (device: Device): Promise<boolean> => {
  try {
    if (!bleManager) {
      throw new Error('BLE Manager not initialized');
    }

    console.log('Connecting to device:', device.name);
    connectedDevice = await bleManager.connectToDevice(device.id);
    await connectedDevice.discoverAllServicesAndCharacteristics();
    bleManager.stopDeviceScan();
    console.log('Connected to device:', device.name);
    return true;
  } catch (error) {
    console.error('Error connecting to device:', error);
    return false;
  }
};

export const readHeartRate = async (): Promise<number | null> => {
  try {
    if (!connectedDevice) {
      console.log('No device connected');
      return null;
    }

    const characteristic = await connectedDevice.readCharacteristicForService(
      HEART_RATE_SERVICE_UUID,
      HEART_RATE_CHARACTERISTIC_UUID
    );

    if (characteristic.value) {
      // Decode heart rate from BLE characteristic
      const buffer = Buffer.from(characteristic.value, 'base64');
      const heartRate = buffer[1]; // Heart rate is typically in byte 1
      return heartRate;
    }

    return null;
  } catch (error) {
    console.error('Error reading heart rate:', error);
    return null;
  }
};

export const disconnectDevice = async (): Promise<void> => {
  try {
    if (connectedDevice) {
      await bleManager?.cancelDeviceConnection(connectedDevice.id);
      connectedDevice = null;
      console.log('Device disconnected');
    }
  } catch (error) {
    console.error('Error disconnecting device:', error);
  }
};

export const isDeviceConnected = (): boolean => {
  return connectedDevice !== null;
};

export const getConnectedDeviceName = (): string | null => {
  return connectedDevice?.name || null;
};
