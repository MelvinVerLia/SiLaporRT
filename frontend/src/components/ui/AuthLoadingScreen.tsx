import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface AuthLoadingScreenProps {
  message?: string;
}

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message = "Memuat...",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 p-8">
        {/* Logo */}
        <div className="flex items-center space-x-2 text-2xl font-bold text-primary-600 mb-4">
          <img src="/assets/logo.webp" alt="Logo" className="h-10 w-10" />
          <span>
            SiLapor<span className="text-primary-700">RT</span>
          </span>
        </div>

        {/* Spinner */}
        <LoadingSpinner size="lg" />

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-200 text-sm animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
