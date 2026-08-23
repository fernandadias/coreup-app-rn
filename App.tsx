import { ActivityIndicator, View } from 'react-native'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { fontMap } from './src/theme/fonts'
import { colors } from './src/theme/theme'
import { AuthProvider, useAuth } from './src/auth/AuthProvider'
import { LoginScreen } from './src/screens/LoginScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { TreinoScreen } from './src/screens/TreinoScreen'
import { FimScreen } from './src/screens/FimScreen'
import type { RootStackParamList } from './src/navigation/types'

const Stack = createNativeStackNavigator<RootStackParamList>()

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg0,
    card: colors.bg0,
    text: colors.text,
    primary: colors.accent,
    border: colors.border,
  },
}

function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  )
}

// Portão: sem sessão → Login; com sessão → app.
function Root() {
  const { session, loading } = useAuth()

  if (loading) return <Splash />
  if (!session) return <LoginScreen />

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg0 },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Treino" component={TreinoScreen} />
        <Stack.Screen
          name="Fim"
          component={FimScreen}
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  const [loaded] = useFonts(fontMap)

  if (!loaded) return <Splash />

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <Root />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
