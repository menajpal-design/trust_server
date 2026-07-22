const PERMISSIONS = {
  // Organization
  ORG_READ: 'org:read',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',

  // Members & Roles
  MEMBER_CREATE: 'member:create',
  MEMBER_READ: 'member:read',
  MEMBER_UPDATE: 'member:update',
  MEMBER_DELETE: 'member:delete',
  ROLE_MANAGE: 'role:manage',

  // Finance
  FINANCE_CREATE: 'finance:create',
  FINANCE_READ: 'finance:read',
  FINANCE_APPROVE: 'finance:approve',

  // System
  SYSTEM_MANAGE: 'system:manage'
};

const DEFAULT_ROLE_PERMISSIONS = {
  ORG_OWNER: Object.values(PERMISSIONS),
  ORG_ADMIN: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.MEMBER_CREATE,
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.MEMBER_UPDATE,
    PERMISSIONS.FINANCE_READ
  ],
  MEMBER: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.MEMBER_READ
  ]
};

module.exports = {
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS
};
