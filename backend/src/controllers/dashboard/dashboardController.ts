import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { BookingModel } from '../../models/Booking.js';
import { UserModel } from '../../models/User.js';
import { WorkspaceModel } from '../../models/Workspace.js';

function startOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setUTCDate(1);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCMonth(x.getUTCMonth() + n);
  return x;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const branchFilter: Record<string, unknown> = {};
  if (actor.role === 'admin') {
    if (!actor.branch) {
      res.status(400).json({ error: 'Admin user has no branch assigned' });
      return;
    }
    branchFilter.branch = new Types.ObjectId(actor.branch);
  }

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = addMonths(thisMonthStart, -1);
  const todayStart = startOfDay(now);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const userFilter: Record<string, unknown> = { role: 'user' };
  if (actor.role === 'admin') userFilter.branch = new Types.ObjectId(actor.branch!);

  const [
    totalBookings,
    bookingsByStatus,
    bookingsThisMonth,
    revenueThisMonth,
    revenueLastMonth,
    totalMembers,
    newMembersThisMonth,
    totalWorkspaces,
    workspacesBookedToday,
  ] = await Promise.all([
    BookingModel.countDocuments(branchFilter),
    BookingModel.aggregate([
      { $match: branchFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    BookingModel.countDocuments({ ...branchFilter, createdAt: { $gte: thisMonthStart } }),
    BookingModel.aggregate([
      {
        $match: {
          ...branchFilter,
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: thisMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    BookingModel.aggregate([
      {
        $match: {
          ...branchFilter,
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    UserModel.countDocuments(userFilter),
    UserModel.countDocuments({ ...userFilter, createdAt: { $gte: thisMonthStart } }),
    WorkspaceModel.countDocuments(actor.role === 'admin' ? { branch: actor.branch } : {}),
    BookingModel.distinct('workspace', {
      ...branchFilter,
      date: { $gte: todayStart, $lt: todayEnd },
      status: { $in: ['pending', 'confirmed'] },
    }),
  ]);

  const statusCounts: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  };
  for (const row of bookingsByStatus as Array<{ _id: string; count: number }>) {
    statusCounts[row._id] = row.count;
  }

  const occupiedToday = workspacesBookedToday.length;
  const occupancyPercent =
    totalWorkspaces > 0 ? Math.round((occupiedToday / totalWorkspaces) * 100) : 0;

  res.json({
    scope: actor.role === 'admin' ? 'branch' : 'global',
    bookings: {
      total: totalBookings,
      thisMonth: bookingsThisMonth,
      byStatus: statusCounts,
    },
    revenue: {
      thisMonth: (revenueThisMonth[0] as { total?: number } | undefined)?.total ?? 0,
      lastMonth: (revenueLastMonth[0] as { total?: number } | undefined)?.total ?? 0,
    },
    members: {
      total: totalMembers,
      newThisMonth: newMembersThisMonth,
    },
    occupancy: {
      totalWorkspaces,
      occupiedToday,
      percent: occupancyPercent,
    },
  });
}
