const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rauth - Authentication Microservice API",
      version: "1.0.0",
      description:
        "A feature-rich, reusable authentication microservice with JWT, 2FA, RBAC, OAuth, API keys, and session management.",
      contact: {
        name: "Rauth API Support",
        url: "https://github.com/Dhananjay-latpate/auth",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token stored in cookie",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: ["user", "editor", "admin", "superadmin"],
            },
            twoFactorEnabled: { type: "boolean" },
            active: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            lastLogin: { type: "string", format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            token: { type: "string" },
            data: { $ref: "#/components/schemas/User" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: { type: "string", minLength: 8, example: "Password1!" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: { type: "string", example: "Password1!" },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "Health check endpoints" },
      { name: "Auth", description: "Authentication endpoints" },
      { name: "2FA", description: "Two-factor authentication" },
      { name: "Sessions", description: "Session management" },
      { name: "API Keys", description: "API key management" },
      { name: "Profile", description: "User profile management" },
      { name: "Users", description: "User management (admin)" },
      { name: "Roles", description: "Role management (admin)" },
      { name: "Organizations", description: "Organization management" },
      { name: "OAuth", description: "Social OAuth authentication" },
    ],
  },
  apis: ["./routes/*.js", "./server.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
