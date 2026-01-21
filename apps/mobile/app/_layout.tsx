import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="calendar/[date]"
          options={{
            headerTitle: '日期详情',
            headerBackTitle: '返回',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
