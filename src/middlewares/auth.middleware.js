const { verifyAccessToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');
const User = require('../modules/auth/user.model');
const OrganizationMember = require('../modules/auth/organizationMember.model');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub);
    if (!user || !user.is_active || user.is_deleted) {
      return ApiResponse.error(res, 'User account is inactive or deleted', 401);
    }

    const activeTenantId = req.headers['x-tenant-id'] || decoded.org_id;
    let permissions = [];
    let roleName = null;

    if (activeTenantId) {
      const member = await OrganizationMember.findOne({
        organization_id: activeTenantId,
        user_id: user._id,
        status: 'ACTIVE'
      }).populate('role_id');

      if (member && member.role_id) {
        permissions = member.role_id.permissions || [];
        roleName = member.role_id.name;
      }
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_global_superadmin: user.is_global_superadmin,
      is_email_verified: user.is_email_verified,
      active_organization_id: activeTenantId,
      role: roleName,
      permissions
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token has expired', 401);
    }
    return ApiResponse.error(res, 'Invalid authentication token', 401);
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_global_superadmin) {
    return ApiResponse.error(res, 'Access Denied: Super Admin privilege required', 403);
  }
  next();
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.requireSuperAdmin = requireSuperAdmin;
