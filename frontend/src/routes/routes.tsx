// import AuthLayout from '@/components/common/AuthLayout';
// import Error from '@/components/common/Error';
// import Loading from '@/components/common/Loading';
// import NotFound from '@/components/common/NotFound';
// // import { useAuth } from '@/providers/AuthProvider';
// import { lazy, Suspense } from 'react';
// import {
//   createBrowserRouter,
//   Navigate,
//   Outlet,
//   useLocation,
// } from 'react-router-dom';

// const withSuspense = (Component: any) => (
//   <Suspense fallback={<Loading />}>
//     <Component />
//   </Suspense>
// );

// // const LoginForm = lazy(() => import('@/auth/login'));
// // const ForgotPassword = lazy(() => import('@/auth/forgot-password'));
// // const ChangePassword = lazy(() => import('@/auth/change-password/index'));
// // const Organization = lazy(() => import('@/pages/organization/organization'));
// // const Classes = lazy(() => import('@/pages/organization/classes/classes'));
// // const ReadClass = lazy(() => import('@/pages/organization/classes/read'));
// // const ReadStream = lazy(() => import('@/pages/organization/streams/read'));
// // const Dashboard = lazy(() => import('@/pages/dashboard/dashboard'));
// // const ReadCombos = lazy(() => import('@/pages/organization/combos/combos'));
// // const ReadGroup = lazy(() => import('@/pages/organization/groups/read'));
// // const ModelQuestions = lazy(() => import('@/pages/model-questions/questions'));
// // const ReadModelQuestion = lazy(() => import('@/pages/model-questions/read'));
// // const Students = lazy(() => import('@/pages/students/students'));
// // const ReadStudent = lazy(() => import('@/pages/students/read'));

// // Guard for protected routes
// const ProtectedRouteWrapper = () => {
//   // const { user, isLoading } = useAuth();
//   const location = useLocation();

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loading className="h-8 w-8" />
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace state={{ from: location }} />;
//   }

//   return <Outlet />;
// };

// // Guard for public routes (login/forgot-password)
// const PublicRouteWrapper = () => {
//   const { user, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loading className="h-8 w-8" />
//       </div>
//     );
//   }

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <Outlet />;
// };

// export const organizationRoutes = [
//   {
//     path: '/organization',
//     element: withSuspense(Organization),
//   },
//   {
//     path: '/organization/classes',
//     element: withSuspense(Organization),
//   },
//   {
//     path: '/organization/streams',
//     element: withSuspense(Organization),
//   },
//   {
//     path: '/organization/combos',
//     element: withSuspense(Organization),
//   },
//   {
//     path: '/organization/groups',
//     element: withSuspense(Organization),
//   },
//   {
//     path: '/organization/classes/read/:id',
//     element: withSuspense(Organization),
//   },
//   {
//     path: '/organization/streams/read/:id',
//     element: withSuspense(ReadStream),
//   },
//   {
//     path: '/organization/combos/read/:id',
//     element: withSuspense(ReadCombos),
//   },
//   {
//     path: '/organization/groups/read/:id',
//     element: withSuspense(ReadGroup),
//   },
// ];
// export const modelQuestionRoutes = [
//   {
//     path: '/model-questions',
//     element: withSuspense(ModelQuestions),
//   },
//   {
//     path: '/model-questions/read/:id',
//     element: withSuspense(ReadModelQuestion),
//   },
// ];
// export const studentRoutes = [
//   {
//     path: '/students',
//     element: withSuspense(Students),
//   },
//   {
//     path: '/students/read/:id',
//     element: withSuspense(ReadStudent),
//   },
// ];

// export const router = createBrowserRouter([
//   {
//     element: <PublicRouteWrapper />,
//     children: [
//       {
//         path: '/login',
//         element: withSuspense(LoginForm),
//         errorElement: <Error />,
//       },
//       {
//         path: '/forgot-password',
//         element: withSuspense(ForgotPassword),
//         errorElement: <Error />,
//       },
//     ],
//   },
//   {
//     path: '/',
//     element: <Navigate to="/dashboard" replace />,
//   },
//   {
//     element: <ProtectedRouteWrapper />,
//     errorElement: <Error />,
//     children: [
//       {
//         element: <AuthLayout />,
//         children: [
//           {
//             path: '/change-password',
//             element: withSuspense(ChangePassword),
//           },
//           {
//             path: '/dashboard',
//             element: withSuspense(Dashboard),
//           },
//         ],
//       },
//       ...organizationRoutes,
//       ...studentRoutes,
//       ...modelQuestionRoutes,
//     ],
//   },
//   {
//     path: '*',
//     element: <NotFound />,
//   },
// ]);
