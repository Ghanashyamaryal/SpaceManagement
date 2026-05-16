import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

const branchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    operatingHours: { type: String, default: '8 AM - 10 PM' },
    imageUrl: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export type Branch = InferSchemaType<typeof branchSchema> & { _id: Types.ObjectId };
export const BranchModel = model('Branch', branchSchema);
