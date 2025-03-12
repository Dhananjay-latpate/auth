/**
 * API Route Classification
 *
 * This is a documentation file that provides an overview of public and protected routes
 * in the application. This file is for reference only and is not loaded by the application.
 */

// PUBLIC ROUTES (No Authentication Required)
const publicRoutes = {
  // Authentication Routes
  "POST /api/v1/auth/register": "Register a new user",
  "POST /api/v1/auth/login": "Login user",
  "POST /api/v1/auth/forgotpassword": "Request password reset",
  "GET /api/v1/auth/verifytoken/:resettoken": "Verify password reset token",
  "PUT /api/v1/auth/resetpassword/:resettoken": "Reset password with token",
  "POST /api/v1/auth/2fa/verify": "Verify 2FA token during login",
  "POST /api/v1/auth/2fa/verify-recovery": "Verify recovery code during login",
};

// PROTECTED ROUTES (Authentication Required)
const protectedRoutes = {
  // Auth-related protected routes
  "GET /api/v1/auth/logout": "Logout user (requires token)",
  "GET /api/v1/auth/me": "Get current user information",
  "PUT /api/v1/auth/updatepassword": "Update user password",
  "GET /api/v1/auth/refresh-token": "Refresh the authentication token",

  // Two-factor authentication management
  "POST /api/v1/auth/2fa/setup": "Set up 2FA",
  "POST /api/v1/auth/2fa/enable": "Enable 2FA",
  "POST /api/v1/auth/2fa/disable": "Disable 2FA",
  "GET /api/v1/auth/2fa/recovery-codes": "Generate recovery codes",

  // User management routes (protected with role-based permissions)
  "GET /api/v1/users": "Get all users (Admin/SuperAdmin only)",
  "GET /api/v1/users/:id": "Get user by ID (Admin/SuperAdmin or own profile)",
  "PUT /api/v1/users/:id": "Update user (Admin/SuperAdmin or own profile)",
  "DELETE /api/v1/users/:id": "Delete user (Admin/SuperAdmin only)",
  "PUT /api/v1/users/:id/role": "Update user role (Admin/SuperAdmin only)",

  // Role management routes (protected with role-based permissions)
  "GET /api/v1/roles": "Get all roles (Admin/SuperAdmin only)",
  "POST /api/v1/roles": "Create role (Admin/SuperAdmin only)",
  "GET /api/v1/roles/:id": "Get role by ID (Admin/SuperAdmin only)",
  "PUT /api/v1/roles/:id": "Update role (Admin/SuperAdmin only)",
  "DELETE /api/v1/roles/:id": "Delete role (SuperAdmin only)",
};

/**
 * FRONTEND ROUTES:
 *
 * Public Routes (No Authentication Required):
 * - / (home page)
 * - /login
 * - /register
 * - /forgot-password
 * - /reset-password/[token]
 * - /login/verify-2fa
 * - /login/recovery
 *
 * Protected Routes (Authentication Required):
 * - /dashboard
 * - /profile/*
 *   - /profile
 *   - /profile/two-factor
 * - /admin/* (require Admin/SuperAdmin role)
 *   - /admin
 *   - /admin/users
 *   - /admin/roles
 */

// Note: This file is for documentation purposes only
module.exports = {
  publicRoutes,
  protectedRoutes,
};
