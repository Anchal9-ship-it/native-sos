import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import {
  initializeBLE,
  scanForDevices,
  connectToDevice,
  disconnectDevice,
  isDeviceConnected,
  getConnectedDeviceName,
} from '../services/bleService';
import { Device } from 'react-native-ble-plx';

export default function Vitals() {
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [spO2, setSpO2] = useState<number | null>(null);
  const [source, setSource] = useState<'camera' | 'wearable'>('camera');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [foundDevices, setFoundDevices] = useState<Device[]>([]);

  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopMonitoring();
    };
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
  };

  // Mock camera-based heart rate monitoring
  const startCameraMonitoring = async () => {
    if (!hasCameraPermission) {
      Alert.alert('Permission Required', 'Camera permission is needed to measure heart rate');
      return;
    }

    setIsCameraActive(true);
    setIsMonitoring(true);
    setSource('camera');

    // Simulate PPG measurement
    // In production, this would analyze camera frames for blood flow changes
    const interval = setInterval(() => {
      // Generate realistic vital signs
      const hr = 60 + Math.floor(Math.random() * 40); // 60-100 bpm
      const oxygen = 95 + Math.floor(Math.random() * 5); // 95-100%
      setHeartRate(hr);
      setSpO2(oxygen);
    }, 2000);

    // Store interval ID for cleanup
    (global as any).vitalMonitorInterval = interval;
  };

  const stopCameraMonitoring = () => {
    setIsCameraActive(false);
    setIsMonitoring(false);
    if ((global as any).vitalMonitorInterval) {
      clearInterval((global as any).vitalMonitorInterval);
    }
  };

  const startBLEMonitoring = async () => {
    setIsScanning(true);
    setFoundDevices([]);

    const initialized = await initializeBLE();
    if (!initialized) {
      Alert.alert('Bluetooth Error', 'Could not initialize Bluetooth. Please enable Bluetooth and try again.');
      setIsScanning(false);
      return;
    }

    await scanForDevices(
      (device) => {
        setFoundDevices((prev) => {
          const exists = prev.find((d) => d.id === device.id);
          if (!exists) {
            return [...prev, device];
          }
          return prev;
        });
      },
      10
    );

    setTimeout(() => {
      setIsScanning(false);
    }, 10000);
  };

  const handleDeviceConnect = async (device: Device) => {
    const connected = await connectToDevice(device);
    if (connected) {
      setConnectedDevice(device.name || device.id);
      setSource('wearable');
      setIsMonitoring(true);
      Alert.alert('Connected', `Connected to ${device.name || 'device'}`);
      
      // Start monitoring vitals from wearable
      startWearableMonitoring();
    } else {
      Alert.alert('Connection Failed', 'Could not connect to device');
    }
  };

  const startWearableMonitoring = () => {
    // Simulate reading from BLE device
    const interval = setInterval(() => {
      const hr = 65 + Math.floor(Math.random() * 35); // 65-100 bpm
      const oxygen = 96 + Math.floor(Math.random() * 4); // 96-100%
      setHeartRate(hr);
      setSpO2(oxygen);
    }, 3000);

    (global as any).vitalMonitorInterval = interval;
  };

  const stopMonitoring = async () => {
    if (isCameraActive) {
      stopCameraMonitoring();
    }
    
    if (connectedDevice) {
      await disconnectDevice();
      setConnectedDevice(null);
    }

    setIsMonitoring(false);
    if ((global as any).vitalMonitorInterval) {
      clearInterval((global as any).vitalMonitorInterval);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Monitor your health vitals using camera or wearable devices
        </Text>
      </View>

      {/* Current Vitals Display */}
      <View style={styles.vitalsContainer}>
        <View style={styles.vitalCard}>
          <Ionicons name="heart" size={32} color="#DC2626" />
          <Text style={styles.vitalValue}>
            {heartRate ? `${heartRate}` : '--'}
          </Text>
          <Text style={styles.vitalUnit}>BPM</Text>
          <Text style={styles.vitalLabel}>Heart Rate</Text>
        </View>

        <View style={styles.vitalCard}>
          <Ionicons name="water" size={32} color="#3B82F6" />
          <Text style={styles.vitalValue}>
            {spO2 ? `${spO2}` : '--'}
          </Text>
          <Text style={styles.vitalUnit}>%</Text>
          <Text style={styles.vitalLabel}>SpO2</Text>
        </View>
      </View>

      {isMonitoring && (
        <View style={styles.statusBanner}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>
            Monitoring via {source === 'camera' ? 'Camera' : 'Wearable'}
          </Text>
        </View>
      )}

      {/* Camera Monitoring */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Camera Monitor</Text>
        <Text style={styles.sectionDescription}>
          Place your finger over the camera flash to measure heart rate
        </Text>

        {isCameraActive ? (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="finger-print" size={48} color="#DC2626" />
              <Text style={styles.cameraText}>Place finger on camera</Text>
              <ActivityIndicator size="large" color="#DC2626" style={{ marginTop: 16 }} />
            </View>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopCameraMonitoring}
            >
              <Text style={styles.buttonText}>Stop Monitoring</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startCameraMonitoring}
            disabled={isMonitoring}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.buttonText}>Start Camera Monitor</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* BLE Wearable */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⌚ Wearable Device</Text>
        <Text style={styles.sectionDescription}>
          Connect to fitness trackers or smartwatches for continuous monitoring
        </Text>

        {connectedDevice ? (
          <View>
            <View style={styles.connectedBanner}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.connectedText}>Connected to {connectedDevice}</Text>
            </View>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={stopMonitoring}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startBLEMonitoring}
              disabled={isScanning || isMonitoring}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="bluetooth" size={20} color="#fff" />
              )}
              <Text style={styles.buttonText}>
                {isScanning ? 'Scanning...' : 'Scan for Devices'}
              </Text>
            </TouchableOpacity>

            {foundDevices.length > 0 && (
              <View style={styles.devicesList}>
                <Text style={styles.devicesTitle}>Found Devices:</Text>
                {foundDevices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.deviceItem}
                    onPress={() => handleDeviceConnect(device)}
                  >
                    <Ionicons name="watch" size={24} color="#3B82F6" />
                    <Text style={styles.deviceName}>
                      {device.name || 'Unknown Device'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#3B82F6" />
        <Text style={styles.infoText}>
          These vitals will be automatically sent to emergency contacts when SOS is triggered.
        </Text>
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
  header: {
    marginBottom: 24,
  },
  headerText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  vitalsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  vitalValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 12,
  },
  vitalUnit: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  vitalLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F46',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    color: '#6EE7B7',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  cameraContainer: {
    marginTop: 8,
  },
  cameraPlaceholder: {
    backgroundColor: '#1F2937',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  stopButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  connectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    padding: 16,
    borderRadius: 8,
  },
  connectedText: {
    color: '#6EE7B7',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  devicesList: {
    marginTop: 16,
  },
  devicesTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
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
});
