# Secure Authentication System - Backend

A robust authentication system with role-based access control (RBAC), two-factor authentication, and other security features.

## Features

- JWT-based authentication
- Role-based access control (RBAC)
- Two-factor authentication (2FA) with QR code support
- Recovery codes for 2FA backup
- Password reset functionality
- Account lockout after multiple failed login attempts
- Email notifications
- Secure password hashing
- API rate limiting and security headers
- MongoDB integration

## Prerequisites

- Node.js (v14+)
- MongoDB (running locally or accessible via connection string)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` file
4. Run the setup script to create default roles and admin user:
   ```bash
   node setup.js
   ```

## Running the server

### Development mode:

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatepassword` - Update password

### Password Reset

- `POST /api/v1/auth/forgotpassword` - Request password reset
- `GET /api/v1/auth/verifytoken/:resettoken` - Verify password reset token
- `PUT /api/v1/auth/resetpassword/:resettoken` - Reset password with token

### Two-Factor Authentication

- `POST /api/v1/auth/2fa/setup` - Set up 2FA
- `POST /api/v1/auth/2fa/enable` - Enable 2FA
- `POST /api/v1/auth/2fa/disable` - Disable 2FA
- `POST /api/v1/auth/2fa/verify` - Verify 2FA token
- `GET /api/v1/auth/2fa/recovery-codes` - Generate recovery codes
- `POST /api/v1/auth/2fa/verify-recovery` - Verify recovery code

### User Management

- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PUT /api/v1/users/:id/role` - Update user role

### Role Management

- `GET /api/v1/roles` - Get all roles
- `POST /api/v1/roles` - Create role
- `GET /api/v1/roles/:id` - Get role by ID
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role

## Security

This project implements several security best practices:

- Password hashing with bcrypt
- JWT tokens for authentication
- HTTP-only cookies
- XSS protection
- NoSQL injection prevention
- Rate limiting
- Security headers with Helmet
