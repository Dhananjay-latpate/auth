/**
 * Tests for authentication utility functions
 * These test pure functions without requiring a database connection.
 */

const { isStrongPassword, sanitizeInput, isValidEmail } = require("../controllers/auth/helpers");

describe("isStrongPassword", () => {
  test("returns false for password less than 8 chars", () => {
    expect(isStrongPassword("Abc1!")).toBe(false);
  });

  test("returns false for password without uppercase", () => {
    expect(isStrongPassword("password1!")).toBe(false);
  });

  test("returns false for password without lowercase", () => {
    expect(isStrongPassword("PASSWORD1!")).toBe(false);
  });

  test("returns false for password without number", () => {
    expect(isStrongPassword("Password!")).toBe(false);
  });

  test("returns false for password without special character", () => {
    expect(isStrongPassword("Password1")).toBe(false);
  });

  test("returns true for strong password", () => {
    expect(isStrongPassword("Password1!")).toBe(true);
  });

  test("returns false for null/undefined", () => {
    expect(isStrongPassword(null)).toBe(false);
    expect(isStrongPassword(undefined)).toBe(false);
  });
});

describe("sanitizeInput", () => {
  test("removes < and > characters", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
      "scriptalert('xss')/script"
    );
  });

  test("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  test("returns non-string input as-is", () => {
    expect(sanitizeInput(123)).toBe(123);
    expect(sanitizeInput(null)).toBe(null);
  });
});

describe("isValidEmail", () => {
  test("returns true for valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  test("returns false for invalid email", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
  });
});
