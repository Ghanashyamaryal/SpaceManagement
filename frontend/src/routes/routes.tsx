/* eslint-disable react-refresh/only-export-components */
import { withSuspense } from "@Components/common/withSuspense";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Dashboard = lazy(() => import("@/pages/dashboard/dashboard"));
const ManageSpace = lazy(() => import("@/pages/manage-space/manage-space"));
const ManageSpaceRead = lazy(() => import("@/pages/manage-space/read"));
const BranchManagement = lazy(() => import("@/pages/branch/branch"));
const BranchRead = lazy(() => import("@/pages/branch/read"));



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


