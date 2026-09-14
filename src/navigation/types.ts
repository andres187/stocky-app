import type { AuthChannel } from '../lib/types';

export type RootStackParamList = {
  Home: { categoria?: string } | undefined;
  Cart: undefined;
  Checkout: undefined;
  SizeGuide: undefined;
  ShippingReturns: undefined;
  Contact: undefined;
  SignIn: undefined;
  VerifyCode: {
    mode: 'login' | 'register';
    channel: AuthChannel;
    email?: string;
    regionCode?: string;
    phone?: string;
    fullName?: string;
    lastName?: string;
  };
  Register: undefined;
  Account: undefined;
};
