import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const CANTEEN_ORDER_STATUSES = [
  'requested',
  'accepted',
  'rejected',
  'delivered',
] as const;
export type CanteenOrderStatus = (typeof CANTEEN_ORDER_STATUSES)[number];

const orderItemSchema = new Schema(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const canteenOrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: CANTEEN_ORDER_STATUSES, default: 'requested' },
    rejectionReason: { type: String, default: '' },
    acceptedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type CanteenOrder = InferSchemaType<typeof canteenOrderSchema> & {
  _id: Types.ObjectId;
};
export const CanteenOrderModel = model('CanteenOrder', canteenOrderSchema);
