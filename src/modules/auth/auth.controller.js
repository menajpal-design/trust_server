const AuthService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');

class AuthController {
  static async register(req, res) {
    const result = await AuthService.register(req.body);
    return ApiResponse.success(
      res,
      'Registration successful. Please check your email to verify your account.',
      result,
      201
    );
  }

  static async login(req, res) {
    const result = await AuthService.login(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
    });

    delete result.refreshToken;
    return ApiResponse.success(res, 'Logged in successfully', result, 200);
  }

  static async refresh(req, res) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token required', 401);
    }

    const result = await AuthService.refreshToken(refreshToken);
    return ApiResponse.success(res, 'Access token refreshed', result, 200);
  }

  static async logout(req, res) {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    await AuthService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return ApiResponse.success(res, 'Logged out successfully', null, 200);
  }

  static async verifyEmail(req, res) {
    const result = await AuthService.verifyEmail(req.body.token);
    return ApiResponse.success(res, result.message, null, 200);
  }

  static async forgotPassword(req, res) {
    const result = await AuthService.forgotPassword(req.body.email);
    return ApiResponse.success(res, result.message, null, 200);
  }

  static async resetPassword(req, res) {
    const result = await AuthService.resetPassword(req.body.token, req.body.new_password);
    return ApiResponse.success(res, result.message, null, 200);
  }

  static async getMe(req, res) {
    const result = await AuthService.getMe(req.user._id, req.user.active_organization_id);
    return ApiResponse.success(res, 'Current user context retrieved', result, 200);
  }

  static async switchTenant(req, res) {
    const result = await AuthService.switchTenant(req.user._id, req.body.organization_id);
    return ApiResponse.success(res, 'Organization switched successfully', result, 200);
  }
}

module.exports = AuthController;
