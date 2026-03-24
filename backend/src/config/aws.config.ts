import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION ?? 'eu-west-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  s3Bucket: process.env.AWS_S3_BUCKET ?? 'trucklink-uploads',
  s3UrlExpiry: parseInt(process.env.AWS_S3_URL_EXPIRY ?? '3600', 10),
}));
