import { useTheme } from "../../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Appearance
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
          Customize how the app looks on your device
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setTheme("light")}
          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
            theme === "light"
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700">
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Light Mode
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-200">
                Bright and clear
              </div>
            </div>
          </div>
          {theme === "light" && (
            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          )}
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
            theme === "dark"
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700">
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Dark Mode
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-200">
                Easy on the eyes
              </div>
            </div>
          </div>
          {theme === "dark" && (
            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-300 pt-2">
        Your preference will be saved and applied across all pages
      </p>
    </div>
  );
}
