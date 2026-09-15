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
  Orders: undefined;
  OrderDetail: { orderId: number };
  MyReviews: undefined;
  ReviewForm: { productId: number; productName: string; reviewId?: number; rating?: number; body?: string | null };
  ReturnRequest: { orderId: number; reference: string };
};
