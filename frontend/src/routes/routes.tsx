/* eslint-disable react-refresh/only-export-components */
import { withSuspense } from "@Components/common/withSuspense";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Dashboard = lazy(() => import("@/pages/dashboard/dashboard"));
const ManageSpace = lazy(() => import("@/pages/manage-space/manage-space"));
const ManageSpaceRead = lazy(() => import("@/pages/manage-space/read"));
const BranchManagement = lazy(() => import("@/pages/branch/branch"));
const BranchRead = lazy(() => import("@/pages/branch/read"));
const UserManagement = lazy(() => import("@/pages/users/user"));
const UserRead = lazy(() => import("@/pages/users/read"));
const Plans = lazy(() => import("@/pages/plans/plans"));
const PlanRead = lazy(() => import("@/pages/plans/read"));
const Events = lazy(() => import("@/pages/events/events"));
const EventRead = lazy(() => import("@/pages/events/read"));
const Bookings = lazy(() => import("@/pages/bookings/bookings"));
const BookingRead = lazy(() => import("@/pages/bookings/read"));


export const userRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: withSuspense(Dashboard),
  },
];
export const manageSpaceRoutes: RouteObject[] = [
  {
    path: "/manage-space",
    element: withSuspense(ManageSpace),
  },
  {
    path: "/manage-space/read/:id",
    element: withSuspense(ManageSpaceRead),
  },
  // {
  //   path: "/manage-space/create",
  //   element: withSuspense(ManageSpaceCreate),
  // },
  // {
  //   path: "/manage-space/update/:id",
  //   element: withSuspense(ManageSpaceUpdate),
  // },
];

export const branchRoutes: RouteObject[] = [
  {
    path: "/branches",
    element: withSuspense(BranchManagement),
  },
  {
    path: "/branches/read/:id",
    element: withSuspense(BranchRead),
  },
];

export const adminUserRoutes: RouteObject[] = [
  {
    path: "/users",
    element: withSuspense(UserManagement),
  },
  {
    path: "/users/read/:id",
    element: withSuspense(UserRead),
  },
];

export const planRoutes: RouteObject[] = [
  {
    path: "/plans",
    element: withSuspense(Plans),
  },
  {
    path: "/plans/read/:id",
    element: withSuspense(PlanRead),
  },
];

export const eventRoutes: RouteObject[] = [
  {
    path: "/events",
    element: withSuspense(Events),
  },
  {
    path: "/events/read/:id",
    element: withSuspense(EventRead),
  },
];

export const bookingRoutes: RouteObject[] = [
  {
    path: "/bookings",
    element: withSuspense(Bookings),
  },
  {
    path: "/bookings/read/:id",
    element: withSuspense(BookingRead),
  },
];
