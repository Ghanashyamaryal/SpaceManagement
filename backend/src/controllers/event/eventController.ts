import type { Request, Response } from 'express';
import {
  EventModel,
  EVENT_STATUSES,
  EVENT_TYPES,
  type EventStatus,
  type EventType,
} from '../../models/event/index.js';
import { BranchModel } from '../../models/branch/index.js';
import { UserModel } from '../../models/user/index.js';

function pickAllowedFields(body: Record<string, unknown>): Record<string, unknown> {
  const allowed = [
    'title',
    'description',
    'event_type',
    'branch_id',
    'branch_name',
    'date',
    'start_time',
    'end_time',
    'capacity',
    'registered_count',
    'image_url',
    'status',
    'attendees',
  ];
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const body = req.body ?? {};

  if (!body.title || !body.date) {
    res.status(400).json({ error: 'title and date are required' });
    return;
  }

  if (body.event_type && !EVENT_TYPES.includes(body.event_type as EventType)) {
    res.status(400).json({ error: `event_type must be one of ${EVENT_TYPES.join(', ')}` });
    return;
  }

  if (body.status && !EVENT_STATUSES.includes(body.status as EventStatus)) {
    res.status(400).json({ error: `status must be one of ${EVENT_STATUSES.join(', ')}` });
    return;
  }

  const branchId = actor.role === 'admin' ? actor.branch : body.branch_id;
  let branchName = body.branch_name ?? '';

  if (branchId) {
    const branch = await BranchModel.findById(branchId);
    if (!branch) {
      res.status(400).json({ error: 'branch not found' });
      return;
    }
    if (!branchName) branchName = branch.name;
  }

  const payload = pickAllowedFields(body);
  payload.branch_id = branchId ?? null;
  payload.branch_name = branchName;

  const event = await EventModel.create(payload);
  res.status(201).json({ event });
}

export async function listEvents(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const filter: Record<string, unknown> = {};

  if (actor.role === 'admin') {
    filter.branch_id = actor.branch;
  } else if (req.query.branch_id) {
    filter.branch_id = req.query.branch_id;
  }
  if (req.query.event_type) filter.event_type = req.query.event_type;
  if (req.query.status) filter.status = req.query.status;

  const events = await EventModel.find(filter)
    .populate('branch_id', 'name')
    .sort({ date: -1 });
  res.json({ events });
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  const event = await EventModel.findById(req.params.id).populate('branch_id', 'name');
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  res.json({ event });
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const event = await EventModel.findById(req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  if (
    actor.role === 'admin' &&
    event.branch_id &&
    event.branch_id.toString() !== actor.branch
  ) {
    res.status(403).json({ error: 'Cannot update event outside your branch' });
    return;
  }

  const body = req.body ?? {};
  if (body.event_type && !EVENT_TYPES.includes(body.event_type as EventType)) {
    res.status(400).json({ error: `event_type must be one of ${EVENT_TYPES.join(', ')}` });
    return;
  }
  if (body.status && !EVENT_STATUSES.includes(body.status as EventStatus)) {
    res.status(400).json({ error: `status must be one of ${EVENT_STATUSES.join(', ')}` });
    return;
  }

  const updates = pickAllowedFields(body);
  if (actor.role === 'admin') delete updates.branch_id;

  if (updates.branch_id) {
    const branch = await BranchModel.findById(updates.branch_id as string);
    if (!branch) {
      res.status(400).json({ error: 'branch not found' });
      return;
    }
    if (!updates.branch_name) updates.branch_name = branch.name;
  }

  Object.assign(event, updates);
  await event.save();
  res.json({ event });
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const event = await EventModel.findById(req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  if (
    actor.role === 'admin' &&
    event.branch_id &&
    event.branch_id.toString() !== actor.branch
  ) {
    res.status(403).json({ error: 'Cannot delete event outside your branch' });
    return;
  }
  await event.deleteOne();
  res.status(204).end();
}

export async function registerForEvent(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const event = await EventModel.findById(req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const user = await UserModel.findById(actor.sub);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (event.status !== 'upcoming' && event.status !== 'ongoing') {
    res.status(400).json({ error: `Cannot register for ${event.status} event` });
    return;
  }

  if (event.attendees.includes(user.email)) {
    res.status(409).json({ error: 'Already registered' });
    return;
  }

  if (event.capacity > 0 && event.registered_count >= event.capacity) {
    res.status(400).json({ error: 'Event is full' });
    return;
  }

  event.attendees.push(user.email);
  event.registered_count = event.attendees.length;
  await event.save();
  res.json({ event });
}

export async function unregisterFromEvent(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const event = await EventModel.findById(req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const user = await UserModel.findById(actor.sub);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const idx = event.attendees.indexOf(user.email);
  if (idx === -1) {
    res.status(404).json({ error: 'Not registered for this event' });
    return;
  }

  event.attendees.splice(idx, 1);
  event.registered_count = event.attendees.length;
  await event.save();
  res.json({ event });
}
