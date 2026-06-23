export interface BookingStatusCounts {
  [status: string]: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export interface CanteenStatusCounts {
  [status: string]: number;
  requested: number;
  accepted: number;
  rejected: number;
  delivered: number;
}

export interface TrendPoint {
  month: string; // "YYYY-MM"
  count: number;
  revenue: number;
}

/** Payload of GET /api/dashboard/summary (superadmin / admin). */
export interface DashboardSummary {
  scope: "branch" | "global";
  bookings: {
    total: number;
    thisMonth: number;
    byStatus: BookingStatusCounts;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
  };
  members: {
    total: number;
    newThisMonth: number;
  };
  occupancy: {
    totalWorkspaces: number;
    occupiedToday: number;
    percent: number;
  };
  bookingsTrend: TrendPoint[];
  workspacesByType: { type: string; count: number }[];
}

/** Payload of GET /api/dashboard/my-summary (any authenticated user). */
export interface MyDashboardSummary {
  myBookings: {
    total: number;
    thisMonth: number;
    byStatus: BookingStatusCounts;
  };
  myBookingsTrend: TrendPoint[];
  myCanteenOrders: {
    total: number;
    byStatus: CanteenStatusCounts;
  };
  myCredit: {
    balance: number;
    charges: number;
    settlements: number;
  };
}
