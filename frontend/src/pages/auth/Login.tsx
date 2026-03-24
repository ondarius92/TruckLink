import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, isLoading, error, otpSent, clearError } =
    useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const formatted = phone.startsWith('0')
      ? '+972' + phone.slice(1)
      : phone;
    await sendOtp(formatted);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const formatted = phone.startsWith('0')
      ? '+972' + phone.slice(1)
      : phone;
    const result = await verifyOtp(formatted, otp);

    if (result?.isNewUser) {
      navigate('/register', { state: { phone: formatted } });
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚛</div>
          <h1 className="text-3xl font-bold text-gray-900">TruckLink</h1>
          <p className="text-gray-500 mt-2">
            פלטפורמת הובלות B2B
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {otpSent ? 'הכנס קוד אימות' : 'כניסה למערכת'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="מספר טלפון"
                type="tel"
                placeholder="050-0000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                hint="נשלח אליך קוד אימות ב-SMS"
              />
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                size="lg"
              >
                שלח קוד אימות
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                קוד נשלח לטלפון {phone}
              </div>
              <Input
                label="קוד אימות (6 ספרות)"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                size="lg"
              >
                כניסה
              </Button>
              <button
                type="button"
                onClick={() => {
                  setOtp('');
                  clearError();
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                שלח קוד מחדש
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              משתמש חדש?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-medium hover:underline"
              >
                הרשמה כאן
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
