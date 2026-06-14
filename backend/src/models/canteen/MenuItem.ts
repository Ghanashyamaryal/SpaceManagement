import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    prepTimeMinutes: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type MenuItem = InferSchemaType<typeof menuItemSchema> & { _id: Types.ObjectId };
export const MenuItemModel = model('MenuItem', menuItemSchema);
