const crypto = require("crypto");
const qrcode = require("qrcode");
const base32 = require("hi-base32");

// Improved TOTP implementation with RFC 6238 compliance
class TOTPUtil {
  /**
   * Generate a secure TOTP secret
   * @param {string} email - User email for labeling the auth URL
   * @param {string} issuer - Service name
   * @returns {object} Secret and otpauth URL
   */
  generateSecret(email, issuer = "AuthApp") {
    // Generate secure random bytes for the secret
    const secretBytes = crypto.randomBytes(20);
    const secret = base32.encode(secretBytes).replace(/=/g, "");

    // Create a URL for the QR code (otpauth://totp/{label}?secret={secret}&issuer={issuer})
    const label = encodeURIComponent(email);
    const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(
      issuer
    )}`;

    return {
      secret,
      otpauth_url: otpauthUrl,
    };
  }

  /**
   * Generate QR code as base64 string from an otpauth URL
   * @param {string} otpauthUrl - The otpauth URL
   * @returns {Promise<string>} Data URL of QR code image
   */
  async generateQRCode(otpauthUrl) {
    try {
      // Generate QR code as data URL
      const dataUrl = await qrcode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        scale: 4,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      return dataUrl; // Return the full data URL
    } catch (error) {
      console.error("QR code generation error:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Verify a TOTP token
   * @param {string} token - Token to verify
   * @param {string} secret - User's TOTP secret
   * @param {number} window - Time window for valid codes (before and after current time)
   * @returns {boolean} Whether the token is valid
   */
  verifyToken(token, secret, window = 1) {
    if (!token || !secret) {
      return false;
    }

    // Clean the input
    token = token.replace(/\s/g, "");

    // Ensure token is a 6-digit number
    if (!/^\d{6}$/.test(token)) {
      return false;
    }

    // Current time step (30-second window)
    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const currentTimeSlice = Math.floor(now / timeStep);

    // Check current and adjacent time steps within the window
    for (let i = -window; i <= window; i++) {
      const timeSlice = currentTimeSlice + i;
      const calculatedToken = this.generateToken(secret, timeSlice);

      if (calculatedToken === token) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate a TOTP token for a specific time
   * @param {string} secret - The TOTP secret
   * @param {number} timeSlice - Time slice to use
   * @returns {string} Generated 6-digit token
   */
  generateToken(secret, timeSlice) {
    // Decode the base32 secret
    let buffer;
    try {
      // Handle padding
      let secretWithPadding = secret;
      if (secretWithPadding.length % 8 !== 0) {
        secretWithPadding += "=".repeat(8 - (secretWithPadding.length % 8));
      }
      buffer = Buffer.from(base32.decode.asBytes(secretWithPadding));
    } catch (error) {
      console.error("Secret decoding error:", error);
      return null;
    }

    // Convert time to buffer (8 bytes, big endian)
    const timeBuffer = Buffer.alloc(8);
    const timeStep = 30;
    const time = timeSlice * timeStep;

    // Fill the buffer with the time value (as a 64-bit big-endian integer)
    timeBuffer.writeBigUInt64BE(BigInt(time), 0);

    // Generate HMAC using SHA1 (as per RFC 6238)
    const hmac = crypto.createHmac("sha1", buffer);
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();

    // Dynamic truncation
    const offset = hmacResult[hmacResult.length - 1] & 0xf;

    // Extract 4 bytes from the result starting at the offset
    const binary =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    // Generate 6-digit code
    const token = binary % 1000000;
    return token.toString().padStart(6, "0");
  }

  /**
   * Generate a set of recovery codes
   * @param {number} count - Number of recovery codes to generate
   * @returns {Array<string>} Array of recovery codes
   */
  generateRecoveryCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate a secure random 8-byte value
      const randomBytes = crypto.randomBytes(8);
      // Convert to a 16-character hex string
      const code = randomBytes.toString("hex").toUpperCase();
      // Format as xxxx-xxxx-xxxx-xxxx for readability
      codes.push(
        `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(
          8,
          12
        )}-${code.slice(12, 16)}`
      );
    }
    return codes;
  }
}

module.exports = new TOTPUtil();
