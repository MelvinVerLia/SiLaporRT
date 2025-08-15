import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Layout from "./components/layout/Layout";

// Pages
import HomePage from "./pages/HomePage";
import LoginForm from "./components/forms/LoginForm";
import RegisterForm from "./components/forms/RegisterForm";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import OTPVerificationForm from "./components/forms/OTPVerificationForm";
import ReportsPage from "./pages/reports/ReportsPage";
import CreateReportPage from "./pages/reports/CreateReportPage";
import ReportDetailPage from "./pages/reports/ReportDetailPage";
import MyReportsPage from "./pages/reports/MyReportsPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import AnnouncementsPage from "./pages/announcements/AnnouncementsPage";
import AnnouncementDetailPage from "./pages/announcements/AnnouncementDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

// Wrapper
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="bg-gray-50">
          <Routes>
            {/* Public-only routes (redirect ke "/" jika sudah login) */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginForm />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterForm />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPasswordPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset/:token/:email"
              element={
                <PublicOnlyRoute>
                  <ResetPasswordPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <PublicOnlyRoute>
                  <OTPVerificationForm />
                </PublicOnlyRoute>
              }
            />

            {/* Routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/:id" element={<ReportDetailPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route
                path="announcements/:id"
                element={<AnnouncementDetailPage />}
              />
              {/* Protected routes */}
              <Route
                path="create-report"
                element={
                  <ProtectedRoute>
                    <CreateReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-reports"
                element={
                  <ProtectedRoute>
                    <MyReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* Admin only */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute requiredRole="RT_ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              {/* // TODO: Admin routes (next step)
              <Route
                path="admin/announcements"
                element={
                  <ProtectedRoute requiredRole="RT_ADMIN">
                    <ManageAnnouncementsPage />
                  </ProtectedRoute>
                }
              /> */}
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
