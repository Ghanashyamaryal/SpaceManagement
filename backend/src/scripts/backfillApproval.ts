import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { UserModel } from '../models/user/index.js';

// One-time backfill: existing accounts predate the approval gate. Mark every
// current user as approved so the new `isApproved: false` default (which only
// applies to fresh self-signups) doesn't lock anyone out.
async function backfill(): Promise<void> {
  await connectDB();

  const result = await UserModel.updateMany(
    { isApproved: { $ne: true } },
    { $set: { isApproved: true } }
  );

  console.log(`Backfilled approval: ${result.modifiedCount} user(s) marked approved.`);
  await mongoose.disconnect();
}

backfill().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
