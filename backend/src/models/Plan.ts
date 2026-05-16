import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const PLAN_TYPES = ['daily', 'weekly', 'monthly', 'corporate'] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: PLAN_TYPES, required: true, default: 'monthly' },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    maxBookingsPerMonth: { type: Number, default: 0 },
    meetingRoomHours: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type Plan = InferSchemaType<typeof planSchema> & { _id: Types.ObjectId };
export const PlanModel = model('Plan', planSchema);
