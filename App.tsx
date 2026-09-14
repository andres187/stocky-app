import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ProductsProvider } from './src/context/ProductsContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="dark" />
            </NavigationContainer>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
