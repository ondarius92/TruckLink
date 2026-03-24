import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'trucklink-secret-change-in-prod',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'trucklink-refresh-secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '30d',
}));
