import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Layout from "./components/layout/Layout";

// Pages
import HomePage from "./pages/HomePage";

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
              {/* Routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
              </Route>
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
