import type { Request, Response } from 'express';
import { BookingModel, BOOKING_STATUSES, type BookingStatus } from '../models/Booking.js';
import { WorkspaceModel } from '../models/Workspace.js';

export async function createBooking(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { workspace, date, startTime, endTime, amount, notes } = req.body ?? {};

  if (!workspace || !date || !startTime || !endTime || amount == null) {
    res.status(400).json({ error: 'workspace, date, startTime, endTime, amount required' });
    return;
  }

  const ws = await WorkspaceModel.findById(workspace);
  if (!ws) {
    res.status(400).json({ error: 'workspace not found' });
    return;
  }

  const booking = await BookingModel.create({
    user: actor.sub,
    workspace: ws._id,
    branch: ws.branch,
    date,
    startTime,
    endTime,
    amount,
    notes: notes ?? '',
    status: 'pending',
  });
  res.status(201).json({ booking });
}

export async function listBookings(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const filter: Record<string, unknown> = {};

  if (actor.role === 'user') {
    filter.user = actor.sub;
  } else if (actor.role === 'admin') {
    filter.branch = actor.branch;
  }
  if (req.query.status) filter.status = req.query.status;

  const bookings = await BookingModel.find(filter)
    .populate('user', 'name email')
    .populate('workspace', 'name type')
    .populate('branch', 'name')
    .sort({ date: -1 });
  res.json({ bookings });
}

export async function updateBookingStatus(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { status } = req.body ?? {};

  if (!status || !BOOKING_STATUSES.includes(status as BookingStatus)) {
    res.status(400).json({ error: `status must be one of ${BOOKING_STATUSES.join(', ')}` });
    return;
  }

  const booking = await BookingModel.findById(req.params.id);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }
  if (actor.role === 'admin' && booking.branch.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot update booking outside your branch' });
    return;
  }

  booking.status = status as BookingStatus;
  await booking.save();
  res.json({ booking });
}

export async function deleteBooking(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const booking = await BookingModel.findById(req.params.id);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }
  if (actor.role === 'admin' && booking.branch.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot delete booking outside your branch' });
    return;
  }
  if (actor.role === 'user' && booking.user.toString() !== actor.sub) {
    res.status(403).json({ error: 'Cannot delete other users\' bookings' });
    return;
  }
  await booking.deleteOne();
  res.status(204).end();
}
