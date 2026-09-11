import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header from '../components/Header';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ContactScreen from '../screens/ContactScreen';
import HomeScreen from '../screens/HomeScreen';
import ShippingReturnsScreen from '../screens/ShippingReturnsScreen';
import SizeGuideScreen from '../screens/SizeGuideScreen';
import { colors } from '../theme/tokens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ header: () => <Header /> }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Tu bolsa', presentation: 'modal' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Finalizar compra' }} />
      <Stack.Screen name="SizeGuide" component={SizeGuideScreen} options={{ title: 'Guía de tallas' }} />
      <Stack.Screen
        name="ShippingReturns"
        component={ShippingReturnsScreen}
        options={{ title: 'Envíos y cambios' }}
      />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contacto' }} />
    </Stack.Navigator>
  );
}
