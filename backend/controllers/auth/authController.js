// Import all authentication related controllers
const registerController = require("./registerController");
const loginController = require("./loginController");
const passwordController = require("./passwordController");
const twoFactorController = require("./twoFactorController");
const userController = require("./userController");

// Export all controllers as a single module
module.exports = {
  // Registration
  register: registerController.register,

  // Login/Logout
  login: loginController.login,
  logout: loginController.logout,
  refreshToken: loginController.refreshToken,

  // User data
  getMe: userController.getMe,

  // Password management
  updatePassword: passwordController.updatePassword,
  forgotPassword: passwordController.forgotPassword,
  resetPassword: passwordController.resetPassword,
  verifyResetToken: passwordController.verifyResetToken,

  // Two-factor authentication
  setup2FA: twoFactorController.setup2FA,
  enable2FA: twoFactorController.enable2FA,
  disable2FA: twoFactorController.disable2FA,
  verify2FA: twoFactorController.verify2FA,
  generateRecoveryCodes: twoFactorController.generateRecoveryCodes,
  verifyRecoveryCode: twoFactorController.verifyRecoveryCode,
};
