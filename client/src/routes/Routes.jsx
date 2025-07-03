import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { ProtectedRoute, PublicRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { USER_ROLES } from '../utils/shared-constants';

// Lazy load pages
const Layout = lazy(() => import('../components/Layout/Layout'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const ChangePassword = lazy(() => import('../pages/ChangePassword'));
const Profile = lazy(() => import('../pages/Profile'));

// MUI Suspense fallback
const Loader = (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// Route configuration object
export const routes = [
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "user-management",
        element: (
          <ProtectedRoute role={USER_ROLES.ADMIN}>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

// Create the router instance
const router = createBrowserRouter(routes);

const AppRoutes = () => {
  return (
    <Suspense fallback={Loader}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRoutes; 