import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const DEFAULT_ORIGINS = 'http://localhost:5173,http://localhost:3000';

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  MONGODB_URI: required('MONGODB_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL ?? '',
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD ?? '',
  SUPERADMIN_NAME: process.env.SUPERADMIN_NAME ?? 'Super Admin',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? '',
};
