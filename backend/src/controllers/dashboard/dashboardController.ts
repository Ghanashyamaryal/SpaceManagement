import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { BookingModel } from '../../models/booking/index.js';
import { UserModel } from '../../models/user/index.js';
import { WorkspaceModel } from '../../models/workspace/index.js';
import { CanteenOrderModel, CreditTransactionModel } from '../../models/canteen/index.js';

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

/** The last 6 calendar months (oldest first), each as a `YYYY-MM` key. */
function lastSixMonths(thisMonthStart: Date): Array<{ key: string; y: number; m: number }> {
  const months: Array<{ key: string; y: number; m: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = addMonths(thisMonthStart, -i);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    months.push({ key: `${y}-${String(m).padStart(2, '0')}`, y, m });
  }
  return months;
}

type TrendRow = { _id: { y: number; m: number }; count: number; revenue?: number };

/** Map raw `{ year, month }` aggregation rows onto a fixed 6-month timeline. */
function buildTrend(
  thisMonthStart: Date,
  rows: TrendRow[]
): Array<{ month: string; count: number; revenue: number }> {
  const byKey = new Map<string, { count: number; revenue: number }>();
  for (const row of rows) {
    const key = `${row._id.y}-${String(row._id.m).padStart(2, '0')}`;
    byKey.set(key, { count: row.count, revenue: row.revenue ?? 0 });
  }
  return lastSixMonths(thisMonthStart).map((b) => ({
    month: b.key,
    count: byKey.get(b.key)?.count ?? 0,
    revenue: byKey.get(b.key)?.revenue ?? 0,
  }));
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

  const sixMonthsStart = addMonths(thisMonthStart, -5);
  const workspaceFilter = actor.role === 'admin' ? { branch: new Types.ObjectId(actor.branch!) } : {};

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
    bookingsTrendRaw,
    workspacesByTypeRaw,
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
    BookingModel.aggregate([
      { $match: { ...branchFilter, createdAt: { $gte: sixMonthsStart } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, '$amount', 0],
            },
          },
        },
      },
    ]),
    WorkspaceModel.aggregate([
      { $match: workspaceFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);

  const bookingsTrend = buildTrend(thisMonthStart, bookingsTrendRaw as TrendRow[]);
  const workspacesByType = (workspacesByTypeRaw as Array<{ _id: string; count: number }>).map(
    (row) => ({ type: row._id, count: row.count })
  );

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
    bookingsTrend,
    workspacesByType,
  });
}

export async function getMyDashboardSummary(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const userId = new Types.ObjectId(actor.sub);

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const sixMonthsStart = addMonths(thisMonthStart, -5);

  const [
    totalBookings,
    bookingsThisMonth,
    bookingsByStatus,
    bookingsTrendRaw,
    canteenTotal,
    canteenByStatus,
    creditAgg,
  ] = await Promise.all([
    BookingModel.countDocuments({ user: userId }),
    BookingModel.countDocuments({ user: userId, createdAt: { $gte: thisMonthStart } }),
    BookingModel.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    BookingModel.aggregate([
      { $match: { user: userId, createdAt: { $gte: sixMonthsStart } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    CanteenOrderModel.countDocuments({ user: userId }),
    CanteenOrderModel.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    CreditTransactionModel.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
  ]);

  const bookingStatusCounts: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  };
  for (const row of bookingsByStatus as Array<{ _id: string; count: number }>) {
    bookingStatusCounts[row._id] = row.count;
  }

  const canteenStatusCounts: Record<string, number> = {
    requested: 0,
    accepted: 0,
    rejected: 0,
    delivered: 0,
  };
  for (const row of canteenByStatus as Array<{ _id: string; count: number }>) {
    canteenStatusCounts[row._id] = row.count;
  }

  let charges = 0;
  let settlements = 0;
  for (const row of creditAgg as Array<{ _id: 'order_charge' | 'settlement'; total: number }>) {
    if (row._id === 'order_charge') charges = row.total;
    if (row._id === 'settlement') settlements = row.total;
  }

  res.json({
    myBookings: {
      total: totalBookings,
      thisMonth: bookingsThisMonth,
      byStatus: bookingStatusCounts,
    },
    myBookingsTrend: buildTrend(thisMonthStart, bookingsTrendRaw as TrendRow[]),
    myCanteenOrders: {
      total: canteenTotal,
      byStatus: canteenStatusCounts,
    },
    myCredit: {
      balance: charges - settlements,
      charges,
      settlements,
    },
  });
}
