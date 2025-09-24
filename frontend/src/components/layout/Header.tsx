import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  Megaphone,
  PlusCircle,
  User,
  LogIn,
  LogOut,
  Shield,
  Bell,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Role } from "../../types/auth.types";
import { cn } from "../../utils/cn";
import { useAuthContext } from "../../contexts/AuthContext";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, isLoading, isLoggingOut, logout } =
    useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    closeUserDropdown();
    closeMobileMenu();
    // Trigger logout tanpa await supaya loading muncul
    logout();
    // Navigate ke login agar PublicOnlyRoute bisa show loading
    navigate("/login");
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeUserDropdown = () => {
    setIsUserDropdownOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeUserDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation items berdasarkan authentication status
  const getNavigationItems = () => {
    const publicItems = [
      { path: "/", label: "Beranda", icon: Home },
      { path: "/reports", label: "Forum", icon: FileText },
      { path: "/announcements", label: "Pengumuman", icon: Megaphone },
    ];

    if (!isAuthenticated) {
      return publicItems;
    }

    const authenticatedItems = [
      ...publicItems,
      { path: "/create-report", label: "Buat Laporan", icon: PlusCircle },
    ];

    return authenticatedItems;
  };

  const navigationItems = getNavigationItems();

  // User dropdown menu items
  const userDropdownItems = [
    { path: "/profile", label: "Profil Saya", icon: UserCircle },
    { path: "/my-reports", label: "Laporan Saya", icon: User },
    ...(user?.role === Role.RT_ADMIN
      ? [
          {
            path: "/admin/reports",
            label: "Kelola Laporan",
            icon: FileText,
          },
          {
            path: "/admin/announcements",
            label: "Kelola Pengumuman",
            icon: Megaphone,
          },
          {
            path: "/admin",
            label: "Admin Panel",
            icon: Shield,
          },
        ]
      : []),
  ];

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
              <img src="/assets/logo.png" alt="Logo" className="h-8 w-8" />
              <span>
                SiLapor<span className="text-blue-950">RT</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {!isLoading &&
              navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
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
            {isLoading && (
              <div className="flex items-center space-x-2 rounded-md px-3 py-2">
                <div className="h-4 w-4 animate-pulse bg-gray-300 rounded"></div>
                <div className="h-4 w-16 animate-pulse bg-gray-300 rounded"></div>
              </div>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications (for authenticated users) */}
            {isAuthenticated && (
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
            )}

            {/* User Info & Actions */}
            {isLoading ? (
              <div className="hidden lg:flex items-center space-x-3 rounded-md px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="hidden lg:block relative" ref={dropdownRef}>
                {/* User Dropdown Trigger */}
                <button
                  onClick={toggleUserDropdown}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 overflow-hidden">
                    {user?.profile ? (
                      <img
                        src={user?.profile}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 truncate max-w-[120px]">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.role === Role.RT_ADMIN ? "Admin RT" : "Warga"}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-400 transition-transform",
                      isUserDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 overflow-hidden">
                            {user?.profile ? (
                              <img
                                src={user?.profile}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              user?.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user?.email}
                            </p>
                            <Badge
                              variant={
                                user?.role === Role.RT_ADMIN
                                  ? "info"
                                  : "default"
                              }
                              size="sm"
                              className="mt-1"
                            >
                              {user?.role === Role.RT_ADMIN
                                ? "Admin RT"
                                : "Warga"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      {userDropdownItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeUserDropdown}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            {item.label}
                          </Link>
                        );
                      })}

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-1" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LogOut
                          className={cn(
                            "h-4 w-4 mr-3",
                            isLoggingOut && "animate-spin"
                          )}
                        />
                        {isLoggingOut ? "Keluar..." : "Keluar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" disabled={isLoading}>
                    <LogIn className="h-4 w-4 mr-1" />
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" disabled={isLoading}>
                    Daftar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
        <div className="lg:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 space-y-1">
            {/* Navigation Items */}
            {!isLoading &&
              navigationItems.map((item) => {
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

            {/* Loading state for navigation */}
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 rounded-md px-3 py-2"
                  >
                    <div className="h-5 w-5 animate-pulse bg-gray-300 rounded"></div>
                    <div className="h-4 w-20 animate-pulse bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-2" />

            {/* User Actions */}
            {!isLoading && isAuthenticated ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-base font-medium text-blue-600 overflow-hidden">
                    {user?.profile ? (
                      <img
                        src={user?.profile}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <Badge
                      variant={
                        user?.role === Role.RT_ADMIN ? "info" : "default"
                      }
                      size="sm"
                      className="mt-1"
                    >
                      {user?.role === Role.RT_ADMIN ? "Admin RT" : "Warga"}
                    </Badge>
                  </div>
                </div>

                {/* User Menu Items */}
                {userDropdownItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut
                    className={cn("h-5 w-5", isLoggingOut && "animate-spin")}
                  />
                  <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
                </button>
              </div>
            ) : !isLoading ? (
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
            ) : (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 rounded-md px-3 py-2"
                  >
                    <div className="h-5 w-5 animate-pulse bg-gray-300 rounded"></div>
                    <div className="h-4 w-16 animate-pulse bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
