import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { UserModel } from './models/User.js';
import { hashPassword } from './utils/hash.js';

async function seed(): Promise<void> {
  if (!env.SUPERADMIN_EMAIL || !env.SUPERADMIN_PASSWORD) {
    throw new Error('SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env');
  }

  await connectDB();

  const existing = await UserModel.findOne({ role: 'superadmin' });
  if (existing) {
    console.log(`Superadmin already exists: ${existing.email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword(env.SUPERADMIN_PASSWORD);
  const user = await UserModel.create({
    name: env.SUPERADMIN_NAME,
    email: env.SUPERADMIN_EMAIL,
    passwordHash,
    role: 'superadmin',
    branch: null,
  });

  console.log(`Superadmin created: ${user.email}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
