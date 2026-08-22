import 'react-native-gesture-handler'
import { registerRootComponent } from 'expo'

import App from './App'

// registerRootComponent chama AppRegistry.registerComponent('main', () => App)
registerRootComponent(App)
