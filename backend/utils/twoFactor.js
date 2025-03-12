const crypto = require("crypto");
const qrcode = require("qrcode");

// Try to import hi-base32 but provide fallback if not available
let base32;
try {
  base32 = require("hi-base32");
  console.log("Using hi-base32 for base32 encoding/decoding");
} catch (error) {
  console.warn(
    "Warning: hi-base32 module not found, using fallback base32 implementation"
  );
  // Simplified base32 implementation as fallback
  base32 = {
    encode: (buffer) => {
      const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      let result = "";
      let bits = 0;
      let value = 0;

      for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;

        while (bits >= 5) {
          bits -= 5;
          result += ALPHABET[(value >>> bits) & 31];
        }
      }

      if (bits > 0) {
        result += ALPHABET[(value << (5 - bits)) & 31];
      }

      return result;
    },
    decode: {
      asBytes: (encoded) => {
        const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        const CHAR_MAP = {};
        for (let i = 0; i < ALPHABET.length; i++) {
          CHAR_MAP[ALPHABET[i]] = i;
        }

        encoded = encoded.replace(/=+$/, "").toUpperCase();
        const buffer = [];
        let bits = 0;
        let value = 0;

        for (let i = 0; i < encoded.length; i++) {
          const char = encoded[i];
          if (!(char in CHAR_MAP)) continue;

          value = (value << 5) | CHAR_MAP[char];
          bits += 5;

          if (bits >= 8) {
            bits -= 8;
            buffer.push((value >>> bits) & 255);
          }
        }

        return Buffer.from(buffer);
      },
    },
  };
}

// Generate a secret key for TOTP
const generateSecret = (email) => {
  const buffer = crypto.randomBytes(15);
  const secret = base32.encode(buffer).replace(/=/g, "").substring(0, 24);

  return {
    secret,
    otpauth_url: `otpauth://totp/${encodeURIComponent(
      "SecureAuth"
    )}:${encodeURIComponent(
      email
    )}?secret=${secret}&issuer=${encodeURIComponent(
      "SecureAuth"
    )}&algorithm=SHA1&digits=6&period=30`,
  };
};

// Validate a time-based token
const verifyToken = (token, secret) => {
  if (!token || !secret) {
    console.log("Missing token or secret");
    return false;
  }

  token = token.toString().replace(/\s+/g, "");

  if (!/^\d{6}$/.test(token)) {
    console.log("Invalid token format, must be 6 digits");
    return false;
  }

  try {
    // Convert base32 secret to buffer
    let secretBuffer;
    try {
      // Make sure we're handling the secret correctly
      const formattedSecret = secret.toUpperCase().replace(/\s/g, "");
      secretBuffer = base32.decode.asBytes(formattedSecret);
    } catch (error) {
      console.error("Invalid base32 secret", error);
      return false;
    }

    // Get current time window and adjacent windows (30 sec window)
    const now = Math.floor(Date.now() / 1000);
    const timeWindows = [
      Math.floor((now - 30) / 30),
      Math.floor(now / 30),
      Math.floor((now + 30) / 30),
    ];

    // Check token against all time windows
    for (const timeWindow of timeWindows) {
      // Convert counter to buffer
      const timeBuffer = Buffer.alloc(8);
      let time = timeWindow;
      // Convert time to big-endian bytes
      for (let i = 7; i >= 0; i--) {
        timeBuffer[i] = time & 0xff;
        time = time >> 8;
      }

      // Calculate HMAC-SHA1
      const hmac = crypto.createHmac("sha1", secretBuffer);
      hmac.update(timeBuffer);
      const digest = hmac.digest();

      // Extract dynamic binary code
      const offset = digest[digest.length - 1] & 0x0f;
      const binary =
        ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);

      // Calculate 6-digit code
      const otp = (binary % 10 ** 6).toString().padStart(6, "0");

      console.log(
        `Comparing token ${token} with generated OTP ${otp} for window ${timeWindow}`
      );
      if (otp === token) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};

// Generate QR code for authenticator app
const generateQRCode = async (otpauthUrl) => {
  try {
    return await qrcode.toDataURL(otpauthUrl);
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Error generating QR code");
  }
};

module.exports = {
  generateSecret,
  verifyToken,
  generateQRCode,
};
