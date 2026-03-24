import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import AuthService, {
  RegisterBusinessPayload,
  RegisterDriverPayload,
} from '../services/auth.service';
import { UserRole } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setTokens,
    setLoading,
    setError,
    clearError,
    logout: storeLogout,
    isDriver,
    isBusiness,
    isAdmin,
  } = useAuthStore();

  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async (phone: string) => {
    try {
      setLoading(true);
      clearError();
      await AuthService.sendOtp({ phone });
      setOtpSent(true);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, code: string) => {
    try {
      setLoading(true);
      clearError();
      const res = await AuthService.verifyOtp({ phone, code });

      if (res.isNewUser) {
        return { isNewUser: true };
      }

      if (res.tokens) {
        setTokens(res.tokens);
        const me = await AuthService.getMe();
        setUser(me);

        redirectByRole(me.role);
      }

      return { isNewUser: false };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerBusiness = async (
    payload: RegisterBusinessPayload,
  ) => {
    try {
      setLoading(true);
      clearError();
      const res = await AuthService.registerBusiness(payload);
      setTokens(res.tokens);
      setUser(res.user);
      navigate('/business/dashboard');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerDriver = async (payload: RegisterDriverPayload) => {
    try {
      setLoading(true);
      clearError();
      const res = await AuthService.registerDriver(payload);
      setTokens(res.tokens);
      setUser(res.user);
      navigate('/driver/dashboard');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await storeLogout();
    navigate('/login');
  };

  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case UserRole.BUSINESS:
        navigate('/business/dashboard');
        break;
      case UserRole.DRIVER:
        navigate('/driver/dashboard');
        break;
      case UserRole.ADMIN:
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    otpSent,
    sendOtp,
    verifyOtp,
    registerBusiness,
    registerDriver,
    logout,
    clearError,
    isDriver,
    isBusiness,
    isAdmin,
    redirectByRole,
  };
};
