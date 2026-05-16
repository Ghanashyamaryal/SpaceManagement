/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { withSuspense } from "@Components/common/withSuspense";

const Dashboard = lazy(() => import("@/pages/dashboard/dashboard"));
// const profile = lazy(() => import("@/pages/profile/profile"));
// const ChangePassword = lazy(() => import("@/auth/changePassword"));
// const CreateUser = lazy(() => import("@/pages/users/create"));
// // const UpdateUser = lazy(() => import("@/pages/users/update"));
// const ReadUser = lazy(() => import("@/pages/users/read"));
// const Users = lazy(() => import("@/pages/users/users"));
// const Caregivers = lazy(() => import("@/pages/caregiver/caregiver"));
// const CaregiverRead = lazy(() => import("@/pages/caregiver/read"));
// const CityManagement = lazy(
//   () => import("@/pages/city-management/city-management"),
// );
// const StateManagement = lazy(
//   () => import("@/pages/state-management/state-management"),
// );
// const CompanyManagement = lazy(
//   () => import("@/pages/company-management/company-management"),
// );
// const DepartmentManagement = lazy(
//   () => import("@/pages/department-management/department-management"),
// );
// const Visit = lazy(() => import("@/pages/visit/visit"));
// const VisitDetails = lazy(() => import("@/pages/visit/read"));
// const InsuranceProviders = lazy(
//   () => import("@/pages/insurance-provider/insurance-provider"),
// );
// const InsuranceProviderRead = lazy(
//   () => import("@/pages/insurance-provider/read"),
// );

// const Consumers = lazy(() => import("@/pages/consumers/consumer"));
// const ConsumerRead = lazy(() => import("@/pages/consumers/read"));
// const Assignments = lazy(() => import("@/pages/assign-caregiver/assign-caregiver"));
// const AssignmentRead = lazy(
//   () => import("@/pages/assign-caregiver/read"),
// );

// const Report = lazy(() => import("@/pages/reports/report"));
// const AuditLog = lazy(() => import("@/pages/audit-log/audit-log"));
// const Messaging = lazy(() => import("@/pages/messaging/message"));
// const BilledHours = lazy(() => import("@/pages/billed-hours/billed-hours"));
// const BilledHoursRead = lazy(() => import("@/pages/billed-hours/read"));

// const ReadRole = lazy(() => import("@/pages/role-management/read"));
// const Roles = lazy(() => import("@/pages/role-management/roles"));

// const HoursUtilization = lazy(() => import("@/pages/hours-utilization/index"));



export const userRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: withSuspense(Dashboard),
  },
];

// export const visitLogRoutes: RouteObject[] = [
//   {
//     path: "/visit",
//     element: withSuspense(Visit),
//   },
//   {
//     path: "/visit/read/:id",
//     element: withSuspense(VisitDetails),
//   },
// ];


