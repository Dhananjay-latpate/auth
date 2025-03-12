# Secure Authentication System - Frontend

A comprehensive authentication system frontend built with Next.js featuring role-based access control (RBAC), two-factor authentication, and a modern UI.

## Features

- Complete authentication flows (register, login, logout)
- Two-factor authentication with QR code setup
- Recovery code support
- Role-based access control
- Permission-based UI rendering
- Profile management
- Password reset flow
- Admin dashboard for user management
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Backend server running (see backend documentation)

## Setup & Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5000
     ```
   - Update the URL to match your backend server

3. Run the development server:
   ```bash
   npm run dev
   ```

Alternatively, you can use our setup script to handle the configuration and start the server:

```bash
node run.js
```

## User Roles

The application supports the following user roles:

- **User**: Basic access to the application
- **Moderator**: Can create and edit content
- **Admin**: Can manage users and content
- **Superadmin**: Full system access, including role management

## Pages

- `/login` - Login page
- `/register` - Registration page
- `/login/verify-2fa` - Two-factor authentication verification
- `/login/recovery` - Recovery code login
- `/forgot-password` - Password reset request
- `/reset-password/[token]` - Password reset form
- `/dashboard` - User dashboard
- `/profile` - User profile management
- `/profile/two-factor` - Two-factor authentication setup
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/roles` - Role management

## Development

### Building for production

```bash
npm run build
```

### Running in production mode

```bash
npm start
```

## Connecting to the Backend

The frontend expects the backend API to be available at the URL specified in `NEXT_PUBLIC_API_URL`. Make sure the backend server is running before starting the frontend application.

## Security Features

- Secure HTTP-only cookies for authentication
- Token-based authentication with JWT
- XSS protection
- CSRF protection
- Two-factor authentication
- Role-based access control
- Permission-based UI rendering
