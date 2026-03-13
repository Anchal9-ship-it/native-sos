# 🔥 Native Android Implementation Guide for Emergency SOS

## Complete setup for Android Studio build with native services

---

## **📁 File Structure**

```
android/app/src/main/java/com/anonymous/frontend/
├── MainActivity.kt (UPDATE)
├── MainApplication.kt (UPDATE)
└── modules/
    ├── VolumeButtonModule.kt (CREATED ✅)
    ├── FlashlightModule.kt (CREATE)
    ├── EmergencySOSPackage.kt (CREATE)
    └── LockScreenService.kt (CREATE)
```

---

## **1. FlashlightModule.kt** - Native Flashlight Control

Create: `/app/frontend/android/app/src/main/java/com/anonymous/frontend/modules/FlashlightModule.kt`

```kotlin
package com.anonymous.frontend.modules

import android.content.Context
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraManager
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*

class FlashlightModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val cameraManager: CameraManager = reactContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private var cameraId: String? = null
    private var isFlashlightOn = false

    init {
        try {
            cameraId = cameraManager.cameraIdList.firstOrNull()
        } catch (e: CameraAccessException) {
            e.printStackTrace()
        }
    }

    override fun getName(): String {
        return "FlashlightModule"
    }

    @ReactMethod
    fun turnOn(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && cameraId != null) {
                cameraManager.setTorchMode(cameraId!!, true)
                isFlashlightOn = true
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Flashlight not supported")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun turnOff(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && cameraId != null) {
                cameraManager.setTorchMode(cameraId!!, false)
                isFlashlightOn = false
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Flashlight not supported")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun toggle(promise: Promise) {
        if (isFlashlightOn) {
            turnOff(promise)
        } else {
            turnOn(promise)
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        promise.resolve(isFlashlightOn)
    }
}
```

---

## **2. EmergencySOSPackage.kt** - Package Registration

Create: `/app/frontend/android/app/src/main/java/com/anonymous/frontend/modules/EmergencySOSPackage.kt`

```kotlin
package com.anonymous.frontend.modules

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class EmergencySOSPackage : ReactPackage {
    
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            VolumeButtonModule(reactContext),
            FlashlightModule(reactContext)
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> {
        return emptyList()
    }
}
```

---

## **3. Update MainActivity.kt** - Handle Volume Buttons

Update: `/app/frontend/android/app/src/main/java/com/anonymous/frontend/MainActivity.kt`

```kotlin
package com.anonymous.frontend

import android.os.Bundle
import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper
import com.anonymous.frontend.modules.VolumeButtonModule

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Set the theme to AppTheme BEFORE onCreate to support 
        // coloring the background, status bar, and navigation bar.
        // This is required for expo-splash-screen.
        setTheme(R.style.AppTheme);
        super.onCreate(null)
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "main"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this,
            BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
            object : DefaultReactActivityDelegate(
                this,
                mainComponentName,
                fabricEnabled
            ) {})
    }

    /**
     * Align the back button behavior with Android S
     * where moving root activities to background instead of finishing activities.
     * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
     */
    override fun invokeDefaultOnBackPressed() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            if (!moveTaskToBack(false)) {
                // For non-root activities, use the default implementation to finish them.
                super.invokeDefaultOnBackPressed()
            }
            return
        }

        // Use the default back button implementation on Android S
        // because it's doing more than [Activity.moveTaskToBack] in fact.
        super.invokeDefaultOnBackPressed()
    }

    // ========================================
    // VOLUME BUTTON HANDLING FOR SOS TRIGGER
    // ========================================

    private var volumeButtonModule: VolumeButtonModule? = null

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            if (volumeButtonModule == null) {
                val reactInstanceManager = reactNativeHost?.reactInstanceManager
                val reactContext = reactInstanceManager?.currentReactContext
                reactContext?.let {
                    volumeButtonModule = VolumeButtonModule(it as com.facebook.react.bridge.ReactApplicationContext)
                }
            }
            volumeButtonModule?.onVolumeKeyPressed(keyCode)
            return true // Consume the event
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            volumeButtonModule?.onVolumeKeyReleased(keyCode)
            return true // Consume the event
        }
        return super.onKeyUp(keyCode, event)
    }
}
```

---

## **4. Update MainApplication.kt** - Register Package

Update: `/app/frontend/android/app/src/main/java/com/anonymous/frontend/MainApplication.kt`

Find the `getPackages()` method and add our package:

```kotlin
package com.anonymous.frontend

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

// ADD THIS IMPORT
import com.anonymous.frontend.modules.EmergencySOSPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          override fun getPackages(): List<ReactPackage> {
            val packages = PackageList(this).packages.toMutableList()
            // Packages that cannot be autolinked yet can be added manually here
            
            // ADD OUR EMERGENCY SOS PACKAGE
            packages.add(EmergencySOSPackage())
            
            return packages
          }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
```

---

## **5. Update AndroidManifest.xml** - Add Permissions

Update: `/app/frontend/android/app/src/main/AndroidManifest.xml`

Add these permissions inside `<manifest>` tag:

```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.FLASHLIGHT"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>

<uses-feature android:name="android.hardware.camera.flash" android:required="false"/>
```

---

## **6. React Native Bridge** - Use Native Modules

Create: `/app/frontend/services/nativeModules.ts`

```typescript
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
```

---

## **7. Update alertService.ts** - Use Native Modules

Update: `/app/frontend/services/alertService.ts`

```typescript
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Flashlight } from './nativeModules';

let alarmSound: Audio.Sound | null = null;
let flashlightInterval: NodeJS.Timeout | null = null;

// ... keep existing audio code ...

// UPDATED: Use native flashlight module
export const startFlashlightBlink = async (): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      // Use native Android module
      let isOn = false;
      flashlightInterval = setInterval(async () => {
        isOn = !isOn;
        if (isOn) {
          await Flashlight.turnOn();
        } else {
          await Flashlight.turnOff();
        }
      }, 500);
      console.log('✅ Native flashlight blinking started');
    } else {
      // iOS fallback (use Camera component)
      console.log('⚠️ iOS flashlight needs CameraView');
    }
  } catch (error) {
    console.error('❌ Error starting flashlight:', error);
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
```

---

## **8. Update index.tsx** - Add Volume Button Listener

Update: `/app/frontend/app/index.tsx`

```typescript
import { useEffect } from 'react';
import { VolumeButton } from '../services/nativeModules';

export default function Index() {
  // ... existing code ...

  useEffect(() => {
    // Enable volume button listener
    VolumeButton.enable();

    // Listen for volume button press
    const removeListener = VolumeButton.addListener(() => {
      console.log('🔊 Volume buttons pressed - triggering SOS!');
      activateSOS();
    });

    return () => {
      removeListener();
      VolumeButton.disable();
    };
  }, []);

  // ... rest of component ...
}
```

---

## **📦 Building in Android Studio**

### **Step 1: Open Project in Android Studio**

```bash
cd /app/frontend/android
# Open this folder in Android Studio
```

### **Step 2: Sync Gradle**

- Android Studio will automatically detect and sync
- Wait for "Gradle sync finished" message

### **Step 3: Build APK**

```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

Or via command line:
```bash
cd /app/frontend/android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## **✅ Testing Checklist**

- [ ] Volume buttons trigger SOS (press both together)
- [ ] Flashlight blinks during SOS
- [ ] Alarm plays sound
- [ ] GPS location captured
- [ ] BLE devices scan
- [ ] Contacts management works
- [ ] Settings persist

---

## **🔧 Troubleshooting**

**Volume buttons not working?**
- Check if MainActivity.kt is updated correctly
- Verify EmergencySOSPackage is registered in MainApplication.kt
- Enable volume button in app settings

**Flashlight not working?**
- Check camera/flashlight permissions in AndroidManifest.xml
- Verify device has flashlight hardware
- Test with Flashlight.turnOn() directly

**Build errors?**
- Clean project: `./gradlew clean`
- Invalidate caches in Android Studio
- Check Kotlin version compatibility

---

**All native modules are now ready for Android Studio build!** 🎉
