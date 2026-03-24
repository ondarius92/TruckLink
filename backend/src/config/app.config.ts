import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT ?? '12'),
  vatPercent: parseFloat(process.env.VAT_PERCENT ?? '18'),
  escrowHoldHours: parseInt(process.env.ESCROW_HOLD_HOURS ?? '48', 10),
  matchingRadiusKm: parseInt(process.env.MATCHING_RADIUS_KM ?? '30', 10),
  matchingTimeoutSec: parseInt(process.env.MATCHING_TIMEOUT_SEC ?? '90', 10),
  otpExpiryMin: parseInt(process.env.OTP_EXPIRY_MIN ?? '5', 10),
}));
