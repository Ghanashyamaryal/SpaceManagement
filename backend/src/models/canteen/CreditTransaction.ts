import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const CREDIT_TRANSACTION_TYPES = ['order_charge', 'settlement'] as const;
export type CreditTransactionType = (typeof CREDIT_TRANSACTION_TYPES)[number];

const creditTransactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: CREDIT_TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    order: { type: Schema.Types.ObjectId, ref: 'CanteenOrder', default: null },
    note: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export type CreditTransaction = InferSchemaType<typeof creditTransactionSchema> & {
  _id: Types.ObjectId;
};
export const CreditTransactionModel = model('CreditTransaction', creditTransactionSchema);
