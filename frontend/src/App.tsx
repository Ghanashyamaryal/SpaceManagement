import Error from "@Components/common/Error";
import Loading from "@Components/common/Loading";
import NotFound from "@Components/common/NotFound";
import React, { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/authcontext";
import AuthLayout from "./layout/authlayout";
import AdminProtectedRoute from "./routes/adminProtected.route";
import GlobalProtectedRoute from "./routes/globalProtected.route";
import PublicRoute from "./routes/public.route";
import { Toaster } from "@Components/ui/Sonner";
import { userRoutes } from "./routes/routes";

const LoginForm = lazy(() => import("./auth/login"));
const SignupForm = lazy(() => import("./auth/signup"));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: withSuspense(LoginForm),
      },
      {
        path: "/signup",
        element: withSuspense(SignupForm),
      },
      {
        index: true,
        element: <Navigate to="/login" replace />,
      }
    ],
  },
];

const adminOnlyRoutes: RouteObject[] = [
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      ...userRoutes,
      // ...caregiverRoutes,
      // ...visitLogRoutes,
      // ...consumerRoutes,
      // ...AssignmentcaregiverRoutes,
      // ...cityManagementRoutes,
      // ...companyManagementRoutes,
      // ...DepartmentManagementRoutes,
      // ...reportRoutes,
      // ...stateManagementRoutes,
      // ...auditLogRoutes,
      // ...insuranceProviderRoutes,
      // ...rolesRoutes,
      // ...messagingRoutes,
      // ...billedHoursRoutes,
      // ...hoursUtilizationRoutes,
    ],
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <Toaster />
        <Outlet />
      </AuthProvider>
    ),
    errorElement: <Error />,
    children: [
      {
        // Public routes branch first to avoid intercepting login by GlobalProtectedRoute
        element: <PublicRoute />,
        children: authRoutes,
      },
      {
        // Protected routes branch second
        element: <GlobalProtectedRoute />,
        children: adminOnlyRoutes,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;