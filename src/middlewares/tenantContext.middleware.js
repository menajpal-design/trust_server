const { runWithTenantContext } = require('../utils/tenantContext');

const tenantContextMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.query.tenant_id || (req.user ? req.user.active_organization_id : null);
  
  if (tenantId) {
    req.tenantId = tenantId;
    runWithTenantContext(tenantId, () => {
      next();
    });
  } else {
    next();
  }
};

module.exports = tenantContextMiddleware;
