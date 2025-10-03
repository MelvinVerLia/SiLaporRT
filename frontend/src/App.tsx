import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import CitizenLayout from "./components/layout/CitizenLayout";
import AdminLayout from "./components/layout/AdminLayout";
import { ToastProvider } from "./contexts/ToastContext";

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
import ManageAnnouncementsPage from "./pages/announcements/ManageAnnouncementsPage";
import CreateAnnouncementPage from "./pages/announcements/CreateAnnouncementPage";
import EditAnnouncementPage from "./pages/announcements/EditAnnouncementPage";
import ManageReportsPage from "./pages/reports/ManageReportsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Wrapper
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

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
      <AuthProvider>
        <ToastProvider>
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
                <Route
                  path="/verify-otp/:token"
                  element={
                    <PublicOnlyRoute>
                      <OTPVerificationForm />
                    </PublicOnlyRoute>
                  }
                />

                {/* Routes with layout */}
                <Route path="/" element={<CitizenLayout />}>
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
                </Route>

                {/* Admin routes with AdminLayout */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="RT_ADMIN">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="create-report" element={<CreateReportPage />} />
                  <Route path="reports" element={<ManageReportsPage />} />
                  <Route path="reports/:id" element={<ReportDetailPage />} />
                  <Route
                    path="announcements"
                    element={<ManageAnnouncementsPage />}
                  />
                  <Route
                    path="announcements/:id"
                    element={<AnnouncementDetailPage />}
                  />
                  <Route
                    path="announcements/create"
                    element={<CreateAnnouncementPage />}
                  />
                  <Route
                    path="announcements/edit/:id"
                    element={<EditAnnouncementPage />}
                  />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
