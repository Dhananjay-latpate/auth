// IMPROVED TOTP IMPLEMENTATION WITH FALLBACKS
const crypto = require("crypto");
const qrcode = require("qrcode");

// Try to require otplib, but provide fallback implementation if not available
let authenticator;
try {
  const otplib = require("otplib");
  authenticator = otplib.authenticator;

  // Configure authenticator with settings compatible with Authy
  authenticator.options = {
    window: 2, // Increase window to account for time skew (2 steps before and after)
    digits: 6, // 6 digit code
    algorithm: "sha1", // SHA1 algorithm
    step: 30, // 30-second window
  };
  console.log("Using otplib for TOTP implementation");
} catch (error) {
  console.log("otplib not found, using fallback TOTP implementation");
  authenticator = null;
}

// Generate a secret key for TOTP
const generateSecret = (email) => {
  if (authenticator) {
    // Use otplib if available
    const secret = authenticator.generateSecret();
    const otpauth_url = authenticator.keyuri(
      email,
      "SecureAuth", // This will appear in the authenticator app
      secret
    );
    return { secret, otpauth_url };
  } else {
    // Fallback implementation
    const buffer = crypto.randomBytes(15);
    const secret = base32Encode(buffer).replace(/=/g, "").substring(0, 24);

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
  }
};

// Validate a time-based token
const verifyToken = (token, secret) => {
  if (!token || !secret) {
    console.log("Missing token or secret");
    return false;
  }

  // Clean the token and secret
  token = token.toString().replace(/\s+/g, "");
  const cleanSecret = secret.trim().replace(/\s+/g, "").toUpperCase();

  if (!/^\d{6}$/.test(token)) {
    console.log("Invalid token format, must be 6 digits");
    return false;
  }

  try {
    console.log(`Verifying token ${token} with secret ${cleanSecret}`);

    if (authenticator) {
      // Try with otplib if available
      try {
        const isValid = authenticator.verify({ token, secret: cleanSecret });
        console.log(`otplib verification result: ${isValid}`);
        return isValid;
      } catch (e) {
        console.log(`otplib verification failed: ${e.message}`);
      }
    }

    // Fallback to manual TOTP implementation
    return manualVerifyToken(token, cleanSecret);
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};

// Manual TOTP verification with wider time windows for better compatibility
const manualVerifyToken = (token, secret) => {
  try {
    // Decode base32 secret to buffer
    const secretBuffer = base32Decode(secret);

    // Get current time in seconds
    const now = Math.floor(Date.now() / 1000);

    // Try multiple time windows (wider range for compatibility)
    // Checking -2, -1, 0, +1, +2 windows (30 seconds each)
    for (let i = -2; i <= 2; i++) {
      const time = Math.floor((now + i * 30) / 30);
      const calculatedToken = calculateTOTP(secretBuffer, time);

      console.log(
        `Manual comparison: Input ${token} vs Generated ${calculatedToken} for window offset ${i}`
      );

      if (token === calculatedToken) {
        console.log(`Manual verification successful with offset ${i}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Manual verification error:", error);
    return false;
  }
};

// Calculate TOTP token
const calculateTOTP = (secretBuffer, timeCounter) => {
  // Convert counter to buffer
  const counterBuffer = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    counterBuffer[7 - i] = (timeCounter >>> (i * 8)) & 0xff;
  }

  // Calculate HMAC-SHA1
  const hmac = crypto.createHmac("sha1", secretBuffer);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Get offset based on last nibble
  const offset = digest[digest.length - 1] & 0x0f;

  // Get 4 bytes starting at offset
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  // Calculate 6-digit code
  const token = binary % 1000000;

  // Pad with leading zeros if necessary
  return token.toString().padStart(6, "0");
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

// Base32 Encoding function (fallback)
function base32Encode(buffer) {
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

  // Add padding
  while (result.length % 8 !== 0) {
    result += "=";
  }

  return result;
}

// Base32 Decoding function (fallback)
function base32Decode(base32String) {
  // Base32 character set
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const CHAR_MAP = {};
  for (let i = 0; i < ALPHABET.length; i++) {
    CHAR_MAP[ALPHABET[i]] = i;
  }

  // Remove padding and normalize case
  base32String = base32String.toUpperCase().replace(/=+$/, "");

  let bits = 0;
  let value = 0;
  let index = 0;
  const output = new Uint8Array(Math.ceil((base32String.length * 5) / 8));

  for (let i = 0; i < base32String.length; i++) {
    const char = base32String[i];
    const charValue = CHAR_MAP[char];

    if (charValue === undefined) {
      throw new Error(`Invalid character in base32 string: ${char}`);
    }

    value = (value << 5) | charValue;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }

  return Buffer.from(output.buffer.slice(0, index));
}

module.exports = {
  generateSecret,
  verifyToken,
  generateQRCode,
};
