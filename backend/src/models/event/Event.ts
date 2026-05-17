import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const EVENT_TYPES = [
  'networking',
  'workshop',
  'startup_pitch',
  'tech_meetup',
  'training',
  'other',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    event_type: { type: String, enum: EVENT_TYPES, default: 'networking' },
    branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    branch_name: { type: String, default: '' },
    date: { type: Date, required: true },
    start_time: { type: String, default: '' },
    end_time: { type: String, default: '' },
    capacity: { type: Number, default: 0, min: 0 },
    registered_count: { type: Number, default: 0, min: 0 },
    image_url: { type: String, default: '' },
    status: { type: String, enum: EVENT_STATUSES, default: 'upcoming' },
    attendees: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type Event = InferSchemaType<typeof eventSchema> & { _id: Types.ObjectId };
export const EventModel = model('Event', eventSchema);
