import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  PlusCircle,
  User,
  LogIn,
  LogOut,
  Shield,
  Bell,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useAuth } from "../../hooks/useAuth";
import { Role } from "../../types/auth.types";
import { cn } from "../../utils/cn";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Navigation items berdasarkan authentication status
  const getNavigationItems = () => {
    const publicItems = [
      { path: "/", label: "Beranda", icon: Home },
      { path: "/reports", label: "Laporan", icon: FileText },
    ];

    if (!isAuthenticated) {
      return publicItems;
    }

    const authenticatedItems = [
      ...publicItems,
      { path: "/create-report", label: "Buat Laporan", icon: PlusCircle },
      { path: "/my-reports", label: "Laporan Saya", icon: User },
    ];

    // Add admin-only items
    if (user?.role === Role.RT_ADMIN) {
      authenticatedItems.push({
        path: "/admin",
        label: "Admin Panel",
        icon: Shield,
      });
    }

    return authenticatedItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <span className="hidden sm:block">SiLaporRT</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications (for authenticated users) */}
            {isAuthenticated && (
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
            )}

            {/* User Info & Actions */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Badge
                        variant={
                          user?.role === Role.RT_ADMIN ? "info" : "default"
                        }
                        size="sm"
                      >
                        {user?.role === Role.RT_ADMIN ? "Admin RT" : "Warga"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4 mr-1" />
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg :hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {/* Navigation Items */}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-200 my-2" />

            {/* User Actions */}
            {isAuthenticated ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </span>
                    <Badge
                      variant={
                        user?.role === Role.RT_ADMIN ? "info" : "default"
                      }
                      size="sm"
                    >
                      {user?.role === Role.RT_ADMIN ? "Admin RT" : "Warga"}
                    </Badge>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Masuk</span>
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Daftar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
