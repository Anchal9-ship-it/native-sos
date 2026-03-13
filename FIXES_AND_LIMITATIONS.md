# 🔧 Emergency SOS App - Fixes & Limitations

## **Issues Reported & Solutions**

---

## **1. ⚠️ SOS Not Appearing on Lock Screen**

### **ISSUE**: Lock screen SOS feature not working

### **ROOT CAUSE**: 
This is a **TECHNICAL LIMITATION** of Expo and React Native, not a bug.

### **WHY IT DOESN'T WORK**:
- Lock screen widgets require **native iOS/Android code**
- Expo managed workflow **cannot access lock screen APIs**
- Both iOS and Android restrict lock screen modifications for security
- Volume button detection needs **native modules**

### **WHAT WORKS vs WHAT DOESN'T**:

| Feature | Status | Notes |
|---------|--------|-------|
| Lock screen widget | ❌ **NOT POSSIBLE** | Requires native development |
| Volume button trigger | ❌ **NOT POSSIBLE** | Needs expo prebuild + native modules |
| SOS when app is open | ✅ Works | App must be running |
| Background location | ✅ Works | With proper permissions |
| Lock screen notifications | ✅ Works | Via push notifications |

### **SOLUTION OPTIONS**:

**Option A: Use What Works (Recommended)**
- Keep app accessible on home screen
- Use widget shortcuts (iOS/Android home screen widgets)
- Enable quick app launch via gestures
- Use push notifications for alerts

**Option B: Full Native Development (Advanced)**
```bash
# Eject from Expo managed workflow
cd /app/frontend
expo prebuild

# Then add native code for:
# - iOS: Today Extension / Widget Extension
# - Android: App Widget / Quick Settings Tile

# This requires:
# - Swift/Objective-C for iOS
# - Java/Kotlin for Android
# - Native module development experience
```

**Option C: Alternative Approaches**
1. **Use Expo Notifications** - Show persistent notification with SOS button
2. **Use Device Shortcuts** - iOS Shortcuts app, Android Quick Settings
3. **Use Smart Watch Integration** - Apple Watch complications, Wear OS tiles

---

## **2. 🔦 Flash Not Working**

### **ISSUE**: Flashlight blinking doesn't work

### **ROOT CAUSE**:
- `Camera.setFlashModeAsync()` is deprecated
- Flashlight needs active camera preview
- Permission handling was incomplete

### **FIX APPLIED**:
Updated `/app/frontend/services/alertService.ts` with:
- Proper permission requests with error alerts
- Better error handling
- Platform-specific implementations

### **IMPLEMENTATION NEEDED**:

The flashlight requires a **hidden camera component**. Update your SOS active screen:

```typescript
// Add to sos-active.tsx
import { CameraView } from 'expo-camera';
import { useState } from 'react';

// Inside component:
const [hasFlashPermission, setHasFlashPermission] = useState(false);
const [enableFlash, setEnableFlash] = useState(false);

// Request permission
useEffect(() => {
  (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasFlashPermission(status === 'granted');
  })();
}, []);

// Render hidden camera (required for flashlight)
{hasFlashPermission && (
  <CameraView
    style={{ width: 1, height: 1, position: 'absolute' }}
    enableTorch={enableFlash}
    facing="back"
  />
)}

// Toggle flash in interval
useEffect(() => {
  if (!settings.enableFlashlight) return;
  
  const interval = setInterval(() => {
    setEnableFlash(prev => !prev);
  }, 500);
  
  return () => clearInterval(interval);
}, [settings.enableFlashlight]);
```

### **ALTERNATIVE**: Use React Native Community Torch

```bash
yarn add react-native-torch
```

Then in `alertService.ts`:
```typescript
import Torch from 'react-native-torch';

export const startFlashlightBlink = async (): Promise<void> => {
  let isOn = false;
  flashlightInterval = setInterval(() => {
    Torch.switchState(!isOn);
    isOn = !isOn;
  }, 500);
};
```

---

## **3. 🔊 Alarm Not Working**

### **ISSUE**: Alarm sound not playing

### **ROOT CAUSE**:
- Audio permissions not requested
- `expo-av` is deprecated (will be removed in SDK 54)
- External sound URL may be blocked
- Silent mode might be active

### **FIX APPLIED**:
- Added audio permission request
- Better error handling with user alerts
- More reliable sound URL

### **BETTER SOLUTION** - Use Local Sound File:

**Step 1:** Add alarm sound to assets
```bash
mkdir -p /app/frontend/assets/sounds
# Download alarm.mp3 and place in assets/sounds/
```

**Step 2:** Update `alertService.ts`:
```typescript
const { sound } = await Audio.Sound.createAsync(
  require('../assets/sounds/alarm.mp3'),  // Local file
  { shouldPlay: true, isLooping: true, volume: 1.0 }
);
```

### **MIGRATE TO expo-audio** (Recommended for SDK 54+):

```bash
yarn add expo-audio
```

Update imports:
```typescript
import { useAudioPlayer, AudioModule } from 'expo-audio';

export const startAlarm = async (): Promise<void> => {
  const player = useAudioPlayer(require('../assets/sounds/alarm.mp3'), {
    shouldPlay: true,
    isLooping: true,
  });
  await player.play();
};
```

---

## **4. 🔵 Bluetooth Not Working**

### **ISSUE**: BLE wearable devices not connecting

### **ROOT CAUSE**:
- Plugin configuration might not be properly applied
- Permissions not granted at runtime
- BLE initialization failing silently

### **VERIFICATION STEPS**:

**1. Check app.json Plugin Configuration:**
```json
{
  "plugins": [
    [
      "react-native-ble-plx",
      {
        "isBackgroundEnabled": true,
        "modes": ["peripheral", "central"],
        "bluetoothAlwaysPermission": "Connect to health wearables"
      }
    ]
  ]
}
```

**2. Rebuild with Plugins:**
```bash
# Clean build
cd /app/frontend
rm -rf node_modules .expo android ios
yarn install

# Prebuild to apply plugins
expo prebuild

# Build APK
eas build --platform android --profile preview
```

**3. Test BLE in Isolation:**

Create a test screen:
```typescript
import { BleManager } from 'react-native-ble-plx';

const testBLE = async () => {
  const manager = new BleManager();
  
  // Check BLE state
  const state = await manager.state();
  console.log('BLE State:', state); // Should be 'PoweredOn'
  
  // Scan
  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error('Scan error:', error);
      return;
    }
    if (device) {
      console.log('Found device:', device.name);
    }
  });
};
```

### **COMMON BLE ISSUES**:

| Issue | Solution |
|-------|----------|
| Bluetooth not powered on | Ask user to enable Bluetooth |
| Permissions denied | Request at runtime, guide user to settings |
| No devices found | Check device has BLE, is advertising |
| Connection fails | Check device is not paired to another app |

### **ANDROID 12+ REQUIREMENTS**:

For Android 12+, you MUST request runtime permissions:

```typescript
import { PermissionsAndroid, Platform } from 'react-native';

export const requestBLEPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    return (
      granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
      granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
      granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
    );
  }
  return true;
};
```

Call this BEFORE initializing BLE:
```typescript
const hasPermissions = await requestBLEPermissions();
if (!hasPermissions) {
  Alert.alert('Permissions Required', 'Please enable Bluetooth permissions');
  return;
}
```

---

## **5. 🐌 App is Very Laggy**

### **PERFORMANCE ISSUES & FIXES**:

### **A. Optimize Contact List Rendering**

Update `/app/frontend/app/contacts.tsx`:

```typescript
import { FlashList } from '@shopify/flash-list';

// Replace ScrollView with FlashList
<FlashList
  data={contacts}
  renderItem={({ item }) => <ContactCard contact={item} onDelete={handleDelete} />}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>
```

Install FlashList:
```bash
yarn add @shopify/flash-list
```

### **B. Memoize Components**

```typescript
import { memo } from 'react';

const ContactCard = memo(({ contact, onDelete }) => {
  // Component code
});
```

### **C. Optimize Settings Screen**

```typescript
// Use useCallback for functions
const updateSetting = useCallback(async (key, value) => {
  const newSettings = { ...settings, [key]: value };
  setSettings(newSettings);
  await saveSettings(newSettings);
}, [settings]);
```

### **D. Reduce Re-renders**

```typescript
// Split contexts
const ContactsContext = createContext();
const SettingsContext = createContext();
const VitalsContext = createContext();

// Instead of one large context
```

### **E. Lazy Load Screens**

```typescript
// In _layout.tsx
const LazyVitals = lazy(() => import('./vitals'));
const LazySOSActive = lazy(() => import('./sos-active'));
```

### **F. Optimize Images**

If using any images:
```typescript
import { Image } from 'expo-image'; // Faster than react-native Image

<Image
  source={require('./image.png')}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### **G. Remove Unnecessary Logs**

```typescript
// Remove or disable console.logs in production
if (__DEV__) {
  console.log('Debug info');
}
```

### **H. Use Production Build**

Make sure you're testing with production build:
```bash
eas build --platform android --profile production
```

NOT preview/development builds which are slower.

---

## **📋 COMPLETE FIX CHECKLIST**

### **Before Rebuilding APK:**

- [ ] Update `alertService.ts` with fixes
- [ ] Add local alarm sound file
- [ ] Add hidden CameraView for flashlight
- [ ] Add runtime BLE permissions
- [ ] Install @shopify/flash-list
- [ ] Memoize components
- [ ] Remove console.logs
- [ ] Update app.json with all permissions
- [ ] Clean node_modules and caches

### **Build Commands:**

```bash
cd /app/frontend

# Clean everything
rm -rf node_modules .expo .metro-cache android ios
yarn install

# Run prebuild (applies plugins)
expo prebuild --clean

# Build production APK
eas build --platform android --profile production --clear-cache
```

### **Testing on Device:**

1. **Install fresh APK**
2. **Grant ALL permissions** when prompted
3. **Enable Bluetooth** manually
4. **Test each feature**:
   - ✅ Add contact
   - ✅ Trigger SOS
   - ✅ Check alarm (ensure phone not on silent)
   - ✅ Check flashlight
   - ✅ Scan for BLE devices
   - ✅ Get GPS location

---

## **🎯 REALISTIC EXPECTATIONS**

### **What Will Work:**
- ✅ SOS trigger when app is open
- ✅ GPS location sharing
- ✅ Alarm sound (if local file used)
- ✅ Flashlight (with CameraView)
- ✅ BLE scanning (with permissions)
- ✅ Contact management
- ✅ Settings persistence

### **What Won't Work (Technical Limitations):**
- ❌ Lock screen widget
- ❌ Volume button trigger (without prebuild)
- ❌ SOS when app is closed
- ❌ True background operation

### **Workarounds:**
- 🔄 Use persistent notification with SOS button
- 🔄 Use device quick settings tiles
- 🔄 Use smart watch complications
- 🔄 Keep app in recent apps for quick access

---

## **📞 NEED MORE HELP?**

If issues persist after applying all fixes:

1. Share logs from device:
```bash
adb logcat | grep "Emergency\|SOS\|Bluetooth\|Camera\|Audio"
```

2. Test individual features in isolation

3. Consider native development for advanced features

---

**Remember:** Some features (lock screen, volume buttons) CANNOT work in standard Expo. This is a platform limitation, not a code issue.
