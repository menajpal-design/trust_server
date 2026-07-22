const crypto = require('crypto');
const QRCode = require('qrcode');
const User = require('./user.model');
const Organization = require('./organization.model');
const OrganizationMember = require('./organizationMember.model');
const Role = require('./role.model');
const Token = require('./token.model');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../utils/mailer');
const { DEFAULT_ROLE_PERMISSIONS } = require('../../constants/permissions');

class AuthService {
  static async register({ first_name, last_name, email, password, org_name, org_slug }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    const existingOrg = await Organization.findOne({ slug: org_slug.toLowerCase() });
    if (existingOrg) {
      const error = new Error('Organization slug is already taken');
      error.statusCode = 400;
      throw error;
    }

    // 1. Create Organization
    const organization = await Organization.create({
      name: org_name,
      slug: org_slug.toLowerCase()
    });

    // 2. Create Default ORG_OWNER Role
    const ownerRole = await Role.create({
      organization_id: organization._id,
      name: 'ORG_OWNER',
      permissions: DEFAULT_ROLE_PERMISSIONS.ORG_OWNER,
      is_system_role: true
    });

    // Also create default MEMBER role
    await Role.create({
      organization_id: organization._id,
      name: 'MEMBER',
      permissions: DEFAULT_ROLE_PERMISSIONS.MEMBER,
      is_system_role: true
    });

    // 3. Create User
    const password_hash = await hashPassword(password);
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password_hash
    });

    // 4. Create Organization Member Bridge
    const ownerMemberCode = `MEM-${new Date().getFullYear()}-0001`;
    let qrCodeData = '';
    try {
      qrCodeData = await QRCode.toDataURL(
        JSON.stringify({ org_id: organization._id, code: ownerMemberCode, ts: Date.now() }),
        { errorCorrectionLevel: 'H' }
      );
    } catch (e) {
      console.error('QR code generation warning:', e.message);
    }

    await OrganizationMember.create({
      organization_id: organization._id,
      user_id: user._id,
      role_id: ownerRole._id,
      member_code: ownerMemberCode,
      qr_code_data: qrCodeData,
      status: 'ACTIVE',
      is_default_tenant: true
    });

    // 5. Generate Email Verification Token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await Token.create({
      user_id: user._id,
      organization_id: organization._id,
      token_hash,
      type: 'EMAIL_VERIFICATION',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 Hours
    });

    // 6. Send Email
    try {
      await sendVerificationEmail(user.email, rawToken, user.first_name);
    } catch (e) {
      console.error('Verification email dispatch warning:', e.message);
    }

    return {
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_email_verified: user.is_email_verified
      },
      organization: {
        _id: organization._id,
        name: organization.name,
        slug: organization.slug
      }
    };
  }

  static async login({ email, password, org_slug }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password_hash');
    if (!user || user.is_deleted) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Find User Organizations
    const members = await OrganizationMember.find({ user_id: user._id, status: 'ACTIVE' })
      .populate('organization_id')
      .populate('role_id');

    if (!members || members.length === 0) {
      const error = new Error('User is not associated with any active organization');
      error.statusCode = 403;
      throw error;
    }

    let activeMember = null;
    if (org_slug) {
      activeMember = members.find(m => m.organization_id.slug === org_slug.toLowerCase());
      if (!activeMember) {
        const error = new Error('User does not belong to the requested organization');
        error.statusCode = 403;
        throw error;
      }
    } else {
      activeMember = members.find(m => m.is_default_tenant) || members[0];
    }

    const activeOrg = activeMember.organization_id;
    const activeRole = activeMember.role_id;

    // Issue Tokens
    const accessToken = generateAccessToken({
      sub: user._id.toString(),
      org_id: activeOrg._id.toString(),
      role: activeRole ? activeRole.name : 'MEMBER'
    });

    const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');

    await Token.create({
      user_id: user._id,
      organization_id: activeOrg._id,
      token_hash: refreshTokenHash,
      type: 'REFRESH_TOKEN',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 Days
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_email_verified: user.is_email_verified
      },
      activeOrganization: {
        _id: activeOrg._id,
        name: activeOrg.name,
        slug: activeOrg.slug,
        role: activeRole ? activeRole.name : 'MEMBER',
        permissions: activeRole ? activeRole.permissions : []
      },
      organizations: members.map(m => ({
        _id: m.organization_id._id,
        name: m.organization_id.name,
        slug: m.organization_id.slug,
        role: m.role_id ? m.role_id.name : 'MEMBER'
      }))
    };
  }

  static async refreshToken(refreshTokenRaw) {
    const tokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    const existingToken = await Token.findOne({
      token_hash: tokenHash,
      type: 'REFRESH_TOKEN',
      is_revoked: false
    });

    if (!existingToken || existingToken.expires_at < new Date()) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(existingToken.user_id);
    if (!user || !user.is_active || user.is_deleted) {
      const error = new Error('User account is invalid or inactive');
      error.statusCode = 401;
      throw error;
    }

    const member = await OrganizationMember.findOne({
      user_id: user._id,
      organization_id: existingToken.organization_id,
      status: 'ACTIVE'
    }).populate('role_id');

    const roleName = member && member.role_id ? member.role_id.name : 'MEMBER';

    const newAccessToken = generateAccessToken({
      sub: user._id.toString(),
      org_id: existingToken.organization_id.toString(),
      role: roleName
    });

    return {
      accessToken: newAccessToken
    };
  }

  static async logout(refreshTokenRaw) {
    if (!refreshTokenRaw) return;
    const tokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    await Token.updateOne({ token_hash: tokenHash }, { is_revoked: true });
  }

  static async verifyEmail(rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenDoc = await Token.findOne({
      token_hash: tokenHash,
      type: 'EMAIL_VERIFICATION',
      is_revoked: false
    });

    if (!tokenDoc || tokenDoc.expires_at < new Date()) {
      const error = new Error('Invalid or expired email verification token');
      error.statusCode = 400;
      throw error;
    }

    await User.findByIdAndUpdate(tokenDoc.user_id, { is_email_verified: true });
    tokenDoc.is_revoked = true;
    await tokenDoc.save();

    return { message: 'Email address verified successfully' };
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.is_deleted) {
      // Do not reveal user existence for security
      return { message: 'If an account exists with that email, a password reset link has been sent.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await Token.create({
      user_id: user._id,
      token_hash: tokenHash,
      type: 'PASSWORD_RESET',
      expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 Hour
    });

    await sendPasswordResetEmail(user.email, rawToken, user.first_name);

    return { message: 'If an account exists with that email, a password reset link has been sent.' };
  }

  static async resetPassword(rawToken, newPassword) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenDoc = await Token.findOne({
      token_hash: tokenHash,
      type: 'PASSWORD_RESET',
      is_revoked: false
    });

    if (!tokenDoc || tokenDoc.expires_at < new Date()) {
      const error = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      throw error;
    }

    const newHash = await hashPassword(newPassword);
    await User.findByIdAndUpdate(tokenDoc.user_id, { password_hash: newHash });

    tokenDoc.is_revoked = true;
    await tokenDoc.save();

    // Revoke all refresh tokens for user
    await Token.updateMany(
      { user_id: tokenDoc.user_id, type: 'REFRESH_TOKEN' },
      { is_revoked: true }
    );

    return { message: 'Password has been reset successfully. Please login with your new password.' };
  }

  static async getMe(userId, activeOrgId) {
    const user = await User.findById(userId);
    const members = await OrganizationMember.find({ user_id: userId, status: 'ACTIVE' })
      .populate('organization_id')
      .populate('role_id');

    let activeOrg = null;
    let permissions = [];
    let roleName = 'MEMBER';

    if (activeOrgId) {
      const currentMember = members.find(m => m.organization_id._id.toString() === activeOrgId);
      if (currentMember) {
        activeOrg = currentMember.organization_id;
        roleName = currentMember.role_id ? currentMember.role_id.name : 'MEMBER';
        permissions = currentMember.role_id ? currentMember.role_id.permissions : [];
      }
    }

    if (!activeOrg && members.length > 0) {
      activeOrg = members[0].organization_id;
      roleName = members[0].role_id ? members[0].role_id.name : 'MEMBER';
      permissions = members[0].role_id ? members[0].role_id.permissions : [];
    }

    return {
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_email_verified: user.is_email_verified,
        is_global_superadmin: user.is_global_superadmin
      },
      activeOrganization: activeOrg ? {
        _id: activeOrg._id,
        name: activeOrg.name,
        slug: activeOrg.slug,
        role: roleName,
        permissions
      } : null,
      organizations: members.map(m => ({
        _id: m.organization_id._id,
        name: m.organization_id.name,
        slug: m.organization_id.slug,
        role: m.role_id ? m.role_id.name : 'MEMBER'
      }))
    };
  }

  static async switchTenant(userId, targetOrgId) {
    const member = await OrganizationMember.findOne({
      user_id: userId,
      organization_id: targetOrgId,
      status: 'ACTIVE'
    }).populate('organization_id').populate('role_id');

    if (!member) {
      const error = new Error('You do not belong to this organization');
      error.statusCode = 403;
      throw error;
    }

    const roleName = member.role_id ? member.role_id.name : 'MEMBER';
    const newAccessToken = generateAccessToken({
      sub: userId,
      org_id: targetOrgId,
      role: roleName
    });

    return {
      accessToken: newAccessToken,
      activeOrganization: {
        _id: member.organization_id._id,
        name: member.organization_id.name,
        slug: member.organization_id.slug,
        role: roleName,
        permissions: member.role_id ? member.role_id.permissions : []
      }
    };
  }
}

module.exports = AuthService;
