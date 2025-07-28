import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Layout from "./components/layout/Layout";
// import ProtectedRoute from "./components/common/ProtectedRoute";
// import { AuthProvider } from "./contexts/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ReportsPage from "./pages/reports/ReportsPage";
import CreateReportPage from "./pages/reports/CreateReportPage";
import ReportDetailPage from "./pages/reports/ReportDetailPage";
import MyReportsPage from "./pages/reports/MyReportsPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        {/* <AuthProvider> */}
        <Router>
          <div className=" bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/:id" element={<ReportDetailPage />} />

                {/* Protected routes */}
                <Route
                  path="create-report"
                  element={
                    // <ProtectedRoute>
                    <CreateReportPage />
                    // </ProtectedRoute>
                  }
                />
                <Route
                  path="my-reports"
                  element={
                    // <ProtectedRoute>
                    <MyReportsPage />
                    // </ProtectedRoute>
                  }
                />

                {/* Admin only routes */}
                <Route
                  path="admin"
                  element={
                    // <ProtectedRoute requiredRole="RT_ADMIN">
                    <AdminDashboard />
                    // </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
        {/* </AuthProvider> */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default App;
