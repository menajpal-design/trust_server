const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const OrganizationMember = require('../auth/organizationMember.model');
const User = require('../auth/user.model');
const Role = require('../auth/role.model');
const Organization = require('../auth/organization.model');
const MemberRoleHistory = require('./memberRoleHistory.model');
const AuditService = require('../audit/audit.service');
const { hashPassword } = require('../../utils/password');
const { sendWelcomeCredentialsEmail } = require('../../utils/mailer');

class MemberService {
  static async generateQRCode(organizationId, memberCode) {
    const payload = JSON.stringify({
      org_id: organizationId,
      code: memberCode,
      ts: Date.now()
    });
    return await QRCode.toDataURL(payload, { errorCorrectionLevel: 'H' });
  }

  static async getMembers(organizationId, { search, status, role_id, page = 1, limit = 20 }) {
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = { organization_id: organizationId, is_deleted: false };

    if (status) query.status = status;
    if (role_id) query.role_id = role_id;

    let memberDocs = await OrganizationMember.find(query)
      .populate('user_id', 'first_name last_name email avatar_url phone')
      .populate('role_id', 'name permissions')
      .sort({ created_at: -1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      memberDocs = memberDocs.filter(m => {
        const u = m.user_id;
        return (
          m.member_code?.match(searchRegex) ||
          m.phone?.match(searchRegex) ||
          m.position_title?.match(searchRegex) ||
          (u && (`${u.first_name} ${u.last_name}`.match(searchRegex) || u.email.match(searchRegex)))
        );
      });
    }

    const totalDocs = memberDocs.length;
    const paginatedDocs = memberDocs.slice(skip, skip + parseInt(limit, 10));

    return {
      docs: paginatedDocs,
      meta: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalDocs,
        totalPages: Math.ceil(totalDocs / parseInt(limit, 10))
      }
    };
  }

  static async getMemberById(organizationId, memberId) {
    const member = await OrganizationMember.findOne({
      _id: memberId,
      organization_id: organizationId,
      is_deleted: false
    })
      .populate('user_id', 'first_name last_name email avatar_url is_email_verified')
      .populate('role_id', 'name permissions');

    if (!member) {
      const error = new Error('Member record not found');
      error.statusCode = 404;
      throw error;
    }

    return member;
  }

  static async addMember(organizationId, modifierUserId, data) {
    let user = await User.findOne({ email: data.email.toLowerCase() });
    const rawTempPassword = data.password || 'Member@123456';
    if (!user) {
      const defaultPasswordHash = await hashPassword(rawTempPassword);
      user = await User.create({
        email: data.email.toLowerCase(),
        first_name: data.first_name,
        last_name: data.last_name || '',
        password_hash: defaultPasswordHash
      });
    } else {
      user.first_name = data.first_name || user.first_name;
      user.last_name = data.last_name !== undefined ? data.last_name : user.last_name;
      await user.save();
    }

    const existingMember = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: user._id,
      is_deleted: false
    });

    if (existingMember) {
      const error = new Error('User is already a member of this organization');
      error.statusCode = 400;
      throw error;
    }

    let roleId = data.role_id;
    let roleDoc = null;
    if (roleId) {
      roleDoc = await Role.findById(roleId);
    } else if (data.system_role) {
      roleDoc = await Role.findOne({ organization_id: organizationId, name: data.system_role });
      if (roleDoc) roleId = roleDoc._id;
    }
    if (!roleId) {
      roleDoc = await Role.findOne({ organization_id: organizationId, name: 'MEMBER' });
      roleId = roleDoc ? roleDoc._id : null;
    }

    const count = await OrganizationMember.countDocuments({ organization_id: organizationId });
    const memberCode = data.member_code || `MEM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const qrCodeData = await this.generateQRCode(organizationId, memberCode);

    const newMember = await OrganizationMember.create({
      organization_id: organizationId,
      user_id: user._id,
      member_code: memberCode,
      role_id: roleId,
      status: data.status || 'ACTIVE',
      membership_type: data.membership_type || 'GENERAL',
      committee_level: data.committee_level || 'NONE',
      position_title: data.position_title || 'Member',
      custom_permissions: data.custom_permissions || [],
      fee_profile: data.fee_profile || {},
      phone: data.phone || '',
      address: data.address || '',
      joined_date: data.joined_date ? new Date(data.joined_date) : new Date(),
      qr_code_data: qrCodeData
    });

    if (modifierUserId) {
      await MemberRoleHistory.create({
        organization_id: organizationId,
        member_id: newMember._id,
        user_id: user._id,
        old_role_name: 'None',
        new_role_name: roleDoc ? roleDoc.name : 'MEMBER',
        old_position: 'None',
        new_position: newMember.position_title,
        committee_name: newMember.committee_level,
        reason: 'Initial Member Creation & Role Assignment',
        changed_by: modifierUserId
      });

      await AuditService.logAction({
        organization_id: organizationId,
        user_id: modifierUserId,
        action: 'MEMBER_CREATED',
        entity_type: 'OrganizationMember',
        entity_id: newMember._id.toString(),
        details: `Created member ${memberCode} with role ${roleDoc ? roleDoc.name : 'MEMBER'} and position ${newMember.position_title}`
      });
    }

    // Send Welcome Credentials Email to Member
    try {
      const orgDoc = await Organization.findById(organizationId);
      await sendWelcomeCredentialsEmail({
        email: user.email,
        firstName: user.first_name,
        tempPassword: rawTempPassword,
        orgName: orgDoc ? orgDoc.name : 'UnionDesk TRUST'
      });
    } catch (mailError) {
      console.warn('Failed to send member credentials email:', mailError.message);
    }

    return await OrganizationMember.findById(newMember._id)
      .populate('user_id', 'first_name last_name email avatar_url')
      .populate('role_id', 'name permissions');
  }

  static async updateMember(organizationId, memberId, modifierUserId, data) {
    const member = await OrganizationMember.findOne({
      _id: memberId,
      organization_id: organizationId,
      is_deleted: false
    }).populate('role_id');

    if (!member) {
      const error = new Error('Member record not found');
      error.statusCode = 404;
      throw error;
    }

    const oldRoleName = member.role_id ? member.role_id.name : 'MEMBER';
    const oldPosition = member.position_title;

    if (data.first_name || data.last_name !== undefined) {
      const user = await User.findById(member.user_id);
      if (user) {
        if (data.first_name) user.first_name = data.first_name;
        if (data.last_name !== undefined) user.last_name = data.last_name;
        await user.save();
      }
    }

    if (data.member_code && data.member_code !== member.member_code) {
      member.member_code = data.member_code;
      member.qr_code_data = await this.generateQRCode(organizationId, data.member_code);
    }

    let newRoleDoc = member.role_id;
    if (data.role_id) {
      newRoleDoc = await Role.findById(data.role_id);
      if (newRoleDoc) member.role_id = newRoleDoc._id;
    } else if (data.system_role) {
      newRoleDoc = await Role.findOne({ organization_id: organizationId, name: data.system_role });
      if (newRoleDoc) member.role_id = newRoleDoc._id;
    }

    if (data.status) member.status = data.status;
    if (data.membership_type) member.membership_type = data.membership_type;
    if (data.committee_level) member.committee_level = data.committee_level;
    if (data.position_title) member.position_title = data.position_title;
    if (data.custom_permissions) member.custom_permissions = data.custom_permissions;
    if (data.fee_profile) {
      member.fee_profile = {
        ...member.fee_profile,
        ...data.fee_profile
      };
    }
    if (data.phone !== undefined) member.phone = data.phone;
    if (data.address !== undefined) member.address = data.address;
    if (data.joined_date) member.joined_date = new Date(data.joined_date);

    await member.save();

    const newRoleName = newRoleDoc ? newRoleDoc.name : 'MEMBER';
    const newPosition = member.position_title;

    if (modifierUserId && (oldRoleName !== newRoleName || oldPosition !== newPosition)) {
      await MemberRoleHistory.create({
        organization_id: organizationId,
        member_id: member._id,
        user_id: member.user_id,
        old_role_name: oldRoleName,
        new_role_name: newRoleName,
        old_position: oldPosition,
        new_position: newPosition,
        committee_name: member.committee_level,
        reason: data.change_reason || 'Role / Position Revision',
        changed_by: modifierUserId
      });

      await AuditService.logAction({
        organization_id: organizationId,
        user_id: modifierUserId,
        action: 'MEMBER_ROLE_UPDATED',
        entity_type: 'OrganizationMember',
        entity_id: member._id.toString(),
        details: `Updated role from ${oldRoleName} to ${newRoleName}, position from ${oldPosition} to ${newPosition}`
      });
    }

    return await OrganizationMember.findById(member._id)
      .populate('user_id', 'first_name last_name email avatar_url')
      .populate('role_id', 'name permissions');
  }

  static async getMemberHistory(organizationId, memberId) {
    return await MemberRoleHistory.find({
      organization_id: organizationId,
      member_id: memberId
    })
      .populate('changed_by', 'first_name last_name email')
      .sort({ created_at: -1 });
  }

  static async deleteMember(organizationId, memberId) {
    const member = await OrganizationMember.findOne({
      _id: memberId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!member) {
      const error = new Error('Member record not found');
      error.statusCode = 404;
      throw error;
    }

    member.is_deleted = true;
    await member.save();
    return { message: 'Member deleted successfully' };
  }

  static async importExcel(organizationId, fileBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      const error = new Error('Excel file contains no worksheet');
      error.statusCode = 400;
      throw error;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const defaultRole = await Role.findOne({ organization_id: organizationId, name: 'MEMBER' });

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        rows.push({
          rowNumber,
          first_name: row.getCell(1).value?.toString() || '',
          last_name: row.getCell(2).value?.toString() || '',
          email: row.getCell(3).value?.toString() || '',
          phone: row.getCell(4).value?.toString() || '',
          position_title: row.getCell(5).value?.toString() || 'Member'
        });
      }
    });

    for (const item of rows) {
      try {
        if (!item.email || !item.first_name) {
          throw new Error('Email and First Name are required');
        }
        await this.addMember(organizationId, null, {
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          phone: item.phone,
          position_title: item.position_title,
          role_id: defaultRole ? defaultRole._id : undefined
        });
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(`Row ${item.rowNumber} (${item.email}): ${err.message}`);
      }
    }

    return {
      message: `Excel Import Completed: ${successCount} added, ${errorCount} failed`,
      successCount,
      errorCount,
      errors
    };
  }

  static async exportExcel(organizationId, res) {
    const members = await OrganizationMember.find({
      organization_id: organizationId,
      is_deleted: false
    })
      .populate('user_id', 'first_name last_name email')
      .populate('role_id', 'name')
      .sort({ created_at: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Members Directory');

    worksheet.columns = [
      { header: 'Member Code', key: 'member_code', width: 18 },
      { header: 'First Name', key: 'first_name', width: 20 },
      { header: 'Last Name', key: 'last_name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Membership Type', key: 'membership_type', width: 18 },
      { header: 'Committee Level', key: 'committee_level', width: 18 },
      { header: 'Position', key: 'position_title', width: 20 },
      { header: 'System Role', key: 'role', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Joined Date', key: 'joined_date', width: 15 }
    ];

    members.forEach(m => {
      worksheet.addRow({
        member_code: m.member_code,
        first_name: m.user_id?.first_name || '',
        last_name: m.user_id?.last_name || '',
        email: m.user_id?.email || '',
        phone: m.phone || '',
        membership_type: m.membership_type || 'GENERAL',
        committee_level: m.committee_level || 'NONE',
        position_title: m.position_title || 'Member',
        role: m.role_id?.name || 'MEMBER',
        status: m.status,
        joined_date: m.joined_date ? new Date(m.joined_date).toISOString().split('T')[0] : ''
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=members_export_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }
}

module.exports = MemberService;
