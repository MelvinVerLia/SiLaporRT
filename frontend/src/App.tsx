import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import CitizenLayout from "./components/layout/CitizenLayout";
import AdminLayout from "./components/layout/AdminLayout";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeWrapper from "./components/ThemeWrapper";

// Pages
import HomePage from "./pages/home/HomePage";
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
import ProfilePage from "./pages/profile/ProfilePage";
import AnnouncementsPage from "./pages/announcements/AnnouncementsPage";
import AnnouncementDetailPage from "./pages/announcements/AnnouncementDetailPage";
import ManageAnnouncementsPage from "./pages/announcements/ManageAnnouncementsPage";
import CreateAnnouncementPage from "./pages/announcements/CreateAnnouncementPage";
import EditAnnouncementPage from "./pages/announcements/EditAnnouncementPage";
import ManageReportsPage from "./pages/reports/ManageReportsPage";
import ManageCitizensPage from "./pages/citizens/ManageCitizensPage";
import ChatPage from "./pages/chat/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";

import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import RequireCompleteProfile from "./routes/RequireCompleteProfile";
import RequireVerification from "./routes/RequireVerification";
import AdminRedirect from "./routes/AdminRedirect";

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
        <ThemeProvider>
          <ThemeWrapper>
            <ToastProvider>
              <Router>
                <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                  <Routes>
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
                    <Route
                      path="/"
                      element={
                        <AdminRedirect>
                          <CitizenLayout />
                        </AdminRedirect>
                      }
                    >
                      <Route
                        index
                        element={
                          <RequireCompleteProfile>
                            <HomePage />
                          </RequireCompleteProfile>
                        }
                      />
                      <Route
                        path="reports"
                        element={
                          <ProtectedRoute>
                            <RequireCompleteProfile>
                              <RequireVerification>
                                <ReportsPage />
                              </RequireVerification>
                            </RequireCompleteProfile>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="reports/:id"
                        element={
                          <ProtectedRoute>
                            <RequireCompleteProfile>
                              <RequireVerification>
                                <ReportDetailPage />
                              </RequireVerification>
                            </RequireCompleteProfile>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="announcements"
                        element={
                          <ProtectedRoute>
                            <RequireCompleteProfile>
                              <RequireVerification>
                                <AnnouncementsPage />
                              </RequireVerification>
                            </RequireCompleteProfile>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="announcements/:id"
                        element={
                          <ProtectedRoute>
                            <RequireCompleteProfile>
                              <RequireVerification>
                                <AnnouncementDetailPage />
                              </RequireVerification>
                            </RequireCompleteProfile>
                          </ProtectedRoute>
                        }
                      />
                      {/* Protected routes */}
                      <Route
                        path="create-report"
                        element={
                          <ProtectedRoute>
                            <RequireCompleteProfile>
                              <RequireVerification>
                                <CreateReportPage />
                              </RequireVerification>
                            </RequireCompleteProfile>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="my-reports"
                        element={
                          <ProtectedRoute>
                            <RequireCompleteProfile>
                              <RequireVerification>
                                <MyReportsPage />
                              </RequireVerification>
                            </RequireCompleteProfile>
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
                      <Route
                        path="chat"
                        element={
                          <ProtectedRoute>
                            <RequireCompleteProfile>
                              <RequireVerification>
                                <ChatPage />
                              </RequireVerification>
                            </RequireCompleteProfile>
                          </ProtectedRoute>
                        }
                      />
                    </Route>

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
                      <Route path="reports" element={<ManageReportsPage />} />
                      <Route
                        path="reports/:id"
                        element={<ReportDetailPage />}
                      />
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
                      <Route path="citizens" element={<ManageCitizensPage />} />
                      <Route path="chat" element={<ChatPage />} />
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </div>
              </Router>
              <ReactQueryDevtools initialIsOpen={false} />
            </ToastProvider>
          </ThemeWrapper>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
