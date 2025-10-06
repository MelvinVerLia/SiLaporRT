import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const CitizenLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-gray-50">
      <Header />
      <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CitizenLayout;
