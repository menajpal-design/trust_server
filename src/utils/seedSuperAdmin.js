const User = require('../modules/auth/user.model');
const { hashPassword } = require('./password');
const logger = require('./logger');

const seedSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ is_global_superadmin: true });
    if (!existingSuperAdmin) {
      const email = 'superadmin@saasorg.com';
      const defaultPassword = 'SuperAdmin@123456';
      const password_hash = await hashPassword(defaultPassword);

      const superadmin = await User.create({
        first_name: 'Platform',
        last_name: 'SuperAdmin',
        email,
        password_hash,
        is_email_verified: true,
        is_active: true,
        is_global_superadmin: true,
        must_change_password: false
      });

      logger.info(`System Initialized: Primary Super Admin created with email "${email}"`);
    }
  } catch (error) {
    logger.error(`Error during Super Admin seeding: ${error.message}`);
  }
};

module.exports = seedSuperAdmin;
