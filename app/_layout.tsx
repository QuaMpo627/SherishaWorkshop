// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AlertProvider } from '@/template';
import { OrdersProvider } from '@/contexts/OrdersContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
          <OrdersProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="order/[id]"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.textPrimary,
                  headerTitle: 'Order',
                  headerShadowVisible: false,
                }}
              />
            </Stack>
          </OrdersProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
