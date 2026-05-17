import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const WORKSPACE_TYPES = [
  'hot_desk',
  'dedicated_desk',
  'focus_pod',
  'meeting_room',
  'conference_hall',
  'private_cabin',
] as const;
export type WorkspaceType = (typeof WORKSPACE_TYPES)[number];

export const WORKSPACE_STATUSES = ['available', 'occupied', 'maintenance'] as const;
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    type: { type: String, enum: WORKSPACE_TYPES, required: true, default: 'hot_desk' },
    capacity: { type: Number, required: true, min: 1 },
    floor: { type: String, default: '' },
    status: { type: String, enum: WORKSPACE_STATUSES, default: 'available' },
    pricePerHour: { type: Number, default: 0, min: 0 },
    pricePerDay: { type: Number, default: 0, min: 0 },
    pricePerMonth: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export type Workspace = InferSchemaType<typeof workspaceSchema> & { _id: Types.ObjectId };
export const WorkspaceModel = model('Workspace', workspaceSchema);
