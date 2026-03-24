import api from './api';
import { User, AuthTokens } from '../types';

export interface SendOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export interface RegisterBusinessPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName: string;
  businessNumber: string;
  industry: string;
  contactPerson: string;
  street: string;
  city: string;
  zipCode?: string;
}

export interface RegisterDriverPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  idNumber: string;
  licenseNumber: string;
  licenseTypes: string[];
  licenseExpiry: string;
}

const AuthService = {
  sendOtp: (payload: SendOtpPayload): Promise<{ message: string }> =>
    api.post('/auth/otp/send', payload),

  verifyOtp: (
    payload: VerifyOtpPayload,
  ): Promise<{ tokens: AuthTokens; isNewUser: boolean }> =>
    api.post('/auth/otp/verify', payload),

  registerBusiness: (
    payload: RegisterBusinessPayload,
  ): Promise<{ user: User; tokens: AuthTokens }> =>
    api.post('/auth/register/business', payload),

  registerDriver: (
    payload: RegisterDriverPayload,
  ): Promise<{ user: User; tokens: AuthTokens }> =>
    api.post('/auth/register/driver', payload),

  getMe: (): Promise<User> =>
    api.get('/auth/me'),

  logout: (): Promise<{ message: string }> =>
    api.post('/auth/logout'),

  saveTokens: (tokens: AuthTokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getAccessToken: (): string | null =>
    localStorage.getItem('accessToken'),

  isAuthenticated: (): boolean =>
    !!localStorage.getItem('accessToken'),
};

export default AuthService;
