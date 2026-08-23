import { ActivityIndicator, View } from 'react-native'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { fontMap } from './src/theme/fonts'
import { colors, font } from './src/theme/theme'
import { Icon } from './src/components/Icon'
import { AuthProvider, useAuth } from './src/auth/AuthProvider'
import { PerfilProvider, usePerfil } from './src/perfil/PerfilProvider'
import { ProgramaProvider, usePrograma } from './src/programa/ProgramaProvider'
import { LoginScreen } from './src/screens/LoginScreen'
import { CodigoScreen } from './src/screens/CodigoScreen'
import { AnamneseScreen } from './src/screens/AnamneseScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { EvolucaoScreen } from './src/screens/EvolucaoScreen'
import { TreinoScreen } from './src/screens/TreinoScreen'
import { FimScreen } from './src/screens/FimScreen'
import { PerfilScreen } from './src/screens/PerfilScreen'
import type { RootStackParamList, TabsParamList } from './src/navigation/types'

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabsParamList>()

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

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg0 },
        tabBarStyle: { backgroundColor: colors.bg1, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: font.semibold, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Início', tabBarIcon: ({ color }) => <Icon name="house" size={17} color={color} /> }}
      />
      <Tab.Screen
        name="Evolucao"
        component={EvolucaoScreen}
        options={{ title: 'Evolução', tabBarIcon: ({ color }) => <Icon name="chart-line" size={17} color={color} /> }}
      />
    </Tab.Navigator>
  )
}

// Portão: sem sessão → Login; sem vínculo → Código; sem anamnese → Anamnese; com tudo → app.
function Root() {
  const { session, loading: authLoading } = useAuth()
  const { anamnese, loading: perfilLoading } = usePerfil()
  const { vinculado, loading: programaLoading } = usePrograma()

  if (authLoading) return <Splash />
  if (!session) return <LoginScreen />
  if (perfilLoading || programaLoading) return <Splash />
  if (!vinculado) return <CodigoScreen />

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg0 } }}
      >
        {!anamnese ? (
          // gate de first-run: a anamnese ocupa o app inteiro até estar preenchida.
          // Ao salvar, o PerfilProvider atualiza e o navigator troca pras tabs sozinho.
          <RootStack.Screen name="Anamnese" component={AnamneseScreen} />
        ) : (
          <>
            <RootStack.Screen name="Tabs" component={Tabs} />
            <RootStack.Screen name="Treino" component={TreinoScreen} options={{ animation: 'slide_from_right' }} />
            <RootStack.Screen
              name="Fim"
              component={FimScreen}
              options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
            />
            <RootStack.Screen name="Perfil" component={PerfilScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </RootStack.Navigator>
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
          <PerfilProvider>
            <ProgramaProvider>
              <Root />
            </ProgramaProvider>
          </PerfilProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
