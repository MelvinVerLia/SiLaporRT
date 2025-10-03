import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  LogOut,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuthContext } from "../../contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggingOut, logout } = useAuthContext();

  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
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
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-8 right-8 z-50 p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 w-64",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Header/Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link
            to="/admin"
            className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <img src="/assets/logo.png" alt="Logo" className="h-8 w-8" />
            <span>
              SiLapor<span className="text-blue-950">RT</span>
            </span>
          </Link>
        </div>

        {/* Admin Badge */}
        <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            Admin Panel
          </div>
          <div className="text-sm text-gray-600 mt-1">RT Administrator</div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Bottom Section - User & Actions */}
        <div className="p-3 space-y-2">
          {/* Profile Link */}
          <Link
            to="/admin/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <UserCircle className="h-5 w-5 flex-shrink-0" />
            <span>Profil Saya</span>
          </Link>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 overflow-hidden flex-shrink-0">
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
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut
              className={cn(
                "h-5 w-5 flex-shrink-0",
                isLoggingOut && "animate-spin"
              )}
            />
            <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
