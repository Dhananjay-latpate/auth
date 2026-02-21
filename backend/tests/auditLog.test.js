/**
 * Tests for the audit log utility
 */

// Mock the AuditLog model and logger to avoid database dependency
jest.mock("../models/AuditLog", () => ({
  logEvent: jest.fn().mockResolvedValue({}),
}));

jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const { logAuditEvent, getRequestMeta } = require("../utils/auditLog");
const AuditLog = require("../models/AuditLog");
const logger = require("../utils/logger");

describe("logAuditEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls AuditLog.logEvent with correct parameters", async () => {
    await logAuditEvent({
      action: "login",
      userId: "user123",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
      details: { email: "test@example.com" },
    });

    expect(AuditLog.logEvent).toHaveBeenCalledWith({
      action: "login",
      userId: "user123",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
      details: { email: "test@example.com" },
      organizationId: undefined,
    });
  });

  test("does not throw when AuditLog.logEvent fails", async () => {
    AuditLog.logEvent.mockRejectedValueOnce(new Error("DB error"));

    await expect(
      logAuditEvent({
        action: "login",
        userId: "user123",
      })
    ).resolves.not.toThrow();

    expect(logger.error).toHaveBeenCalled();
  });
});

describe("getRequestMeta", () => {
  test("extracts ip and user-agent from request", () => {
    const req = {
      ip: "192.168.1.1",
      headers: { "user-agent": "Mozilla/5.0" },
    };

    const meta = getRequestMeta(req);
    expect(meta).toEqual({
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });
  });

  test("returns 'unknown' for missing values", () => {
    const req = { ip: null, headers: {} };
    const meta = getRequestMeta(req);
    expect(meta.ipAddress).toBe("unknown");
    expect(meta.userAgent).toBe("unknown");
  });
});
