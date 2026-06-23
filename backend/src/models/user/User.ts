import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const ROLES = ['superadmin', 'admin', 'user'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, default: 'user' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', default: null },
    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.passwordHash;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpires;
    return ret;
  },
});

export type User = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};
export const UserModel = model('User', userSchema);
