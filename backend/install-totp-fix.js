const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing improved TOTP packages...');

try {
  // Install a well-tested TOTP library
  execSync('npm install otplib --save', { stdio: 'inherit' });
  
  console.log('\nCreating improved TOTP implementation file...');
  
  const totpUtilContent = `
// IMPROVED TOTP IMPLEMENTATION
const { authenticator } = require('otplib');
const crypto = require('crypto');
const qrcode = require('qrcode');

// Configure authenticator
authenticator.options = { 
  window: 1,        // Allow 1 step before and after current step
  digits: 6,        // 6 digit code
  algorithm: 'sha1' // SHA1 algorithm
};

// Generate a secret key for TOTP
const generateSecret = (email) => {
  const secret = authenticator.generateSecret();
  const otpauth_url = authenticator.keyuri(
    email, 
    'SecureAuth',
    secret
  );

  return {
    secret,
    otpauth_url,
  };
};

// Validate a time-based token
const verifyToken = (token, secret) => {
  if (!token || !secret) {
    console.log("Missing token or secret");
    return false;
  }
  
  token = token.toString().replace(/\\s+/g, "");
  
  try {
    console.log(\`Verifying token \${token} with secret \${secret}\`);
    const isValid = authenticator.verify({ token, secret });
    console.log(\`Token verification result: \${isValid}\`);
    return isValid;
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
`;

  // Save the new implementation
  const filePath = path.join(__dirname, 'utils', 'twoFactorImproved.js');
  fs.writeFileSync(filePath, totpUtilContent.trim());
  
  console.log(`Created ${filePath}`);
  console.log('\nTo use the improved implementation, update your imports to: const twoFactor = require("../utils/twoFactorImproved");');
  console.log('All dependencies installed successfully!');
} catch (error) {
  console.error(`\nError during installation: ${error.message}`);
  process.exit(1);
}


