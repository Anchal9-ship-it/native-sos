# 🚨 Emergency One-Tap Lock Screen App (Health + SOS)

A life-saving mobile application that provides quick access to emergency services with automatic location sharing and health vitals monitoring.

## 🎯 Key Features

### Emergency Response
- **One-Tap SOS Trigger**: Large, accessible emergency button on home screen
- **Multiple Trigger Methods**:
  - Tap the main SOS button
  - Swipe from screen edge (gesture-based)
  - Volume buttons (requires native build)
  - Lock screen button (limited functionality)

### Emergency Contacts
- Store up to **5 emergency contacts**
- Add name, phone number, and relationship
- Contacts receive alerts when SOS is triggered

### Location Sharing
- **Automatic GPS location capture** during emergency
- **Reverse geocoding** for human-readable address
- Google Maps link sent to emergency contacts
- Real-time location tracking

### Health Vitals Monitoring
- **Camera-based heart rate monitoring** (PPG simulation)
- **Bluetooth Low Energy (BLE)** wearable integration
- Monitor heart rate (BPM) and SpO2 levels
- Vitals automatically sent during emergency

### Alert Systems
- **Alarm Sound**: Loud alarm to alert nearby people
- **Flashlight Blinking**: Visual attention-grabbing signal
- **Haptic Feedback**: Vibration confirmation
- All alerts customizable in settings

### Emergency Message
When SOS is triggered, contacts receive:
```
🚨 EMERGENCY SOS ALERT 🚨

I need immediate help!

Location: [Address]
Maps: [Google Maps Link]

Health Vitals:
❤️ Heart Rate: [X] bpm
🫁 SpO2: [X]%
Source: 📱 Phone Camera / ⌚ Wearable

⏰ Time: [Timestamp]

This is an automated emergency message.
```

## 📱 App Structure

### Screens
1. **Home (index.tsx)** - Main SOS trigger screen with status dashboard
2. **Contacts (contacts.tsx)** - Manage emergency contacts
3. **Settings (settings.tsx)** - Configure alerts and triggers
4. **Vitals (vitals.tsx)** - Health monitoring (camera + wearables)
5. **SOS Active (sos-active.tsx)** - Emergency alert activation screen

### Services
- **locationService.ts** - GPS location capture and geocoding
- **smsService.ts** - Mock SMS sending (formatted emergency messages)
- **alertService.ts** - Alarm sounds and flashlight control
- **bleService.ts** - Bluetooth wearable device integration

### Storage
- **AsyncStorage** - Local data persistence
- Emergency contacts stored locally
- User settings and preferences
- No cloud dependency for privacy

## 🚀 Getting Started

### Prerequisites
- Node.js and Yarn
- Expo CLI
- iOS/Android device or emulator

### Installation
```bash
cd /app/frontend
yarn install
```

### Running the App
```bash
# Start development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

## 📋 Required Permissions

### iOS (app.json)
- **Location (When In Use)**: "Access location during emergencies to share with contacts"
- **Location (Always)**: "Always track location for emergency response"
- **Camera**: "Measure heart rate using camera flash"
- **Bluetooth**: "Connect to health wearables for vital signs"

### Android (app.json)
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- CAMERA
- BLUETOOTH
- BLUETOOTH_CONNECT
- BLUETOOTH_SCAN
- VIBRATE
- FLASHLIGHT

## 🎨 Design Features

### Mobile-First UX
- **Dark theme** optimized for emergency visibility
- **Large touch targets** (min 44px iOS / 48px Android)
- **One-handed operation** for quick access
- **Gesture-based** triggers for discreet activation
- **Red emergency branding** for immediate recognition

### Accessibility
- High contrast text and icons
- Clear visual hierarchy
- Haptic feedback for confirmation
- Audio cues (alarm) for visually impaired

## ⚙️ Technical Stack

### Frontend
- **Expo Router** - File-based navigation
- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type safety
- **Expo Location** - GPS services
- **Expo Camera** - Heart rate monitoring & flashlight
- **Expo AV** - Alarm sounds
- **React Native BLE PLX** - Bluetooth wearables
- **AsyncStorage** - Local data storage

### Backend (Minimal)
- **FastAPI** - Python web framework
- **MongoDB** - Database (for future features)
- **Motor** - Async MongoDB driver

## 🔒 Privacy & Security

- **All data stored locally** on device
- **No cloud uploads** of health data
- **Emergency contacts encrypted** in local storage
- **Location only shared during emergencies**
- **No tracking or analytics**

## 🚧 Limitations

### Lock Screen Functionality
- **True lock screen integration** requires native development
- Volume button detection needs `expo prebuild` and native modules
- **Workaround**: Keep app accessible via home screen shortcuts
- iOS/Android limit background app capabilities for battery/security

### SMS Sending
- Currently **mocked** for demonstration
- Production requires **Twilio** or similar service integration
- SMS API key needed for real message sending

### Heart Rate Monitoring
- Camera-based PPG is **simulated** in current version
- Production requires advanced image processing algorithms
- BLE wearable integration provides more accurate readings

## 🎯 Future Enhancements

### Phase 2 Features
- [ ] Real SMS/MMS sending via Twilio
- [ ] Actual camera PPG implementation
- [ ] Medical ID integration
- [ ] Emergency services (911) direct calling
- [ ] Fall detection using accelerometer
- [ ] Medication reminders
- [ ] Emergency voice recording

### Phase 3 Features
- [ ] Cloud backup of emergency contacts
- [ ] Family dashboard for monitoring
- [ ] Integration with emergency dispatch
- [ ] Multi-language support
- [ ] Wear OS / watchOS dedicated apps
- [ ] AI-powered health anomaly detection

## 📞 Emergency Workflow

1. **User triggers SOS** (button/gesture/volume)
2. **5-second countdown** with cancel option
3. **Location captured** via GPS
4. **Vitals measured** (camera or wearable)
5. **Alarm & flashlight activated** (if enabled)
6. **Emergency message sent** to all contacts
7. **Active alert screen** shows status
8. **User can deactivate** when safe

## 🏥 Use Cases

- **Elderly care** - Quick access for health emergencies
- **Heart patients** - Share vitals during cardiac events
- **Accident victims** - Share location when unable to call
- **Women's safety** - Discreet emergency alerts
- **Solo travelers** - Peace of mind in unfamiliar areas
- **Chronic conditions** - Diabetes, epilepsy, allergies

## 🛠️ Development

### Project Structure
```
/app/frontend/
├── app/                    # Screens (expo-router)
│   ├── index.tsx          # Home/SOS trigger
│   ├── contacts.tsx       # Emergency contacts
│   ├── settings.tsx       # User preferences
│   ├── vitals.tsx         # Health monitoring
│   ├── sos-active.tsx     # Emergency alert
│   └── _layout.tsx        # Navigation
├── services/              # Business logic
│   ├── locationService.ts
│   ├── smsService.ts
│   ├── alertService.ts
│   └── bleService.ts
└── utils/                 # Utilities
    └── storage.ts         # AsyncStorage helpers
```

### Testing
```bash
# Lint frontend
cd /app/frontend
yarn lint

# Backend tests
cd /app/backend
python backend_test.py
```

## 📄 License

MIT License - Feel free to use, modify, and distribute

## 🤝 Contributing

This is a life-saving application. Contributions welcome for:
- Better PPG algorithms
- Enhanced BLE integrations
- Accessibility improvements
- Translations
- Medical accuracy

## ⚠️ Disclaimer

This app is designed as an **emergency assistance tool**, not a replacement for professional medical devices or emergency services. Always call local emergency numbers (911, 112, etc.) for immediate life-threatening situations.

## 📱 Download & Setup

1. Clone repository
2. Install dependencies
3. Configure permissions in app.json
4. Add your emergency contacts
5. Test SOS flow in safe environment
6. Keep app accessible on home screen

---

**Built with ❤️ to help save lives**

*Emergency response times matter. Every second counts.*
