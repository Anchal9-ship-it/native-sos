import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#DC2626',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Emergency SOS',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="contacts" 
          options={{ title: 'Emergency Contacts' }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ title: 'Settings' }} 
        />
        <Stack.Screen 
          name="vitals" 
          options={{ title: 'Health Monitor' }} 
        />
        <Stack.Screen 
          name="sos-active" 
          options={{ 
            title: 'SOS ACTIVE',
            headerStyle: { backgroundColor: '#DC2626' },
            gestureEnabled: false 
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
