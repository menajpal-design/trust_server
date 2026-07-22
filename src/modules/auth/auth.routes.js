const express = require('express');
const AuthController = require('./auth.controller');
const validate = require('../../middlewares/validation.middleware');
const authenticate = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  switchTenantSchema
} = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(AuthController.register));
router.post('/login', validate(loginSchema), asyncHandler(AuthController.login));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));
router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(AuthController.verifyEmail));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(AuthController.resetPassword));

// Authenticated Routes
router.get('/me', authenticate, asyncHandler(AuthController.getMe));
router.post('/switch-tenant', authenticate, validate(switchTenantSchema), asyncHandler(AuthController.switchTenant));

module.exports = router;
