const ApiResponse = require('../utils/apiResponse');

const requirePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 401);
    }

    if (req.user.is_global_superadmin) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = requiredPermissions.every(perm =>
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return ApiResponse.error(res, 'Forbidden: Insufficient permissions', 403);
    }

    next();
  };
};

module.exports = {
  requirePermissions
};
