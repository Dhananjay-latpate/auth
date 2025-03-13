import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaHome,
  FaUser,
  FaUsers,
  FaShieldAlt,
  FaKey,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const NavItem = ({ href, icon, text, active }) => {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2 rounded-md ${
        active
          ? "bg-blue-700 text-white"
          : "text-gray-300 hover:bg-blue-600 hover:text-white"
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

const DashboardSidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="bg-blue-800 text-white w-64 flex-shrink-0 min-h-screen pt-6">
      <div className="px-4 pb-6">
        <h1 className="text-2xl font-bold mb-4">Auth Platform</h1>

        {user && (
          <div className="mb-8">
            <div className="flex items-center">
              {user.profile?.avatar ? (
                <img
                  src={
                    user.profile.avatar.startsWith("http")
                      ? user.profile.avatar
                      : `/uploads/avatars/${
                          user.profile.avatar.split("/avatars/")[1] ||
                          user.profile.avatar
                        }` // Fix path
                  }
                  alt={user.name}
                  className="h-10 w-10 rounded-full mr-3"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-blue-300">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-1">
          <NavItem
            href="/dashboard"
            icon={<FaHome />}
            text="Dashboard"
            active={isActive("/dashboard")}
          />

          <div className="pt-4 pb-2">
            <h2 className="text-xs uppercase tracking-wide text-blue-300 px-4">
              Account
            </h2>
          </div>

          <NavItem
            href="/profile/edit"
            icon={<FaUser />}
            text="Profile"
            active={isActive("/profile/edit")}
          />

          <NavItem
            href="/profile/security"
            icon={<FaShieldAlt />}
            text="Security & Sessions"
            active={isActive("/profile/security")}
          />

          <NavItem
            href="/profile/api-keys"
            icon={<FaKey />}
            text="API Keys"
            active={isActive("/profile/api-keys")}
          />

          <div className="pt-4 pb-2">
            <h2 className="text-xs uppercase tracking-wide text-blue-300 px-4">
              Teams
            </h2>
          </div>

          <NavItem
            href="/organizations"
            icon={<FaUsers />}
            text="Organizations"
            active={
              isActive("/organizations") ||
              router.pathname.startsWith("/organizations/")
            }
          />

          <div className="pt-4 mt-6 border-t border-blue-700">
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-red-700 hover:text-white rounded-md w-full"
            >
              <FaSignOutAlt className="mr-3" />
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DashboardSidebar;
