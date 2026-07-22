const Committee = require('./committee.model');
const CommitteeMember = require('./committeeMember.model');
const CommitteeHistory = require('./committeeHistory.model');
const User = require('../auth/user.model');

class CommitteeService {
  static async createCommittee(organizationId, data) {
    const committee = await Committee.create({
      ...data,
      organization_id: organizationId
    });
    return committee;
  }

  static async seedBDCommitteeHierarchy(organizationId) {
    const existing = await Committee.countDocuments({ organization_id: organizationId });
    if (existing > 0) return { seeded: 0, message: 'Committees already exist' };

    const c1 = await Committee.create({ organization_id: organizationId, name: 'Bangladesh National Committee', code: 'BD-NAT', committee_type: 'NATIONAL' });
    const c2 = await Committee.create({ organization_id: organizationId, name: 'Dhaka Division Committee', code: 'DHA-DIV', committee_type: 'DIVISION', parent_committee_id: c1._id });
    const c3 = await Committee.create({ organization_id: organizationId, name: 'Faridpur District Committee', code: 'FAR-DIST', committee_type: 'DISTRICT', parent_committee_id: c2._id });
    const c4 = await Committee.create({ organization_id: organizationId, name: 'Faridpur Sadar Upazila Committee', code: 'FAR-UPZ', committee_type: 'UPAZILA', parent_committee_id: c3._id });
    const c5 = await Committee.create({ organization_id: organizationId, name: 'Kanaipur Union Committee', code: 'KAN-UNI', committee_type: 'UNION', parent_committee_id: c4._id });
    const c6 = await Committee.create({ organization_id: organizationId, name: 'Ward No 5 Committee', code: 'WRD-05', committee_type: 'WARD', parent_committee_id: c5._id });

    // Specialized Localized Committees
    await Committee.create({ organization_id: organizationId, name: 'Village Committee', code: 'VIL-01', committee_type: 'VILLAGE', parent_committee_id: c6._id });
    await Committee.create({ organization_id: organizationId, name: 'School Committee', code: 'SCH-01', committee_type: 'SCHOOL', parent_committee_id: c6._id });
    await Committee.create({ organization_id: organizationId, name: 'College Committee', code: 'COL-01', committee_type: 'COLLEGE', parent_committee_id: c6._id });
    await Committee.create({ organization_id: organizationId, name: 'Mosque Committee', code: 'MSQ-01', committee_type: 'MOSQUE', parent_committee_id: c6._id });
    await Committee.create({ organization_id: organizationId, name: 'Market Committee', code: 'MKT-01', committee_type: 'MARKET', parent_committee_id: c6._id });
    await Committee.create({ organization_id: organizationId, name: 'Women\'s Committee', code: 'WMN-01', committee_type: 'WOMEN', parent_committee_id: c1._id });
    await Committee.create({ organization_id: organizationId, name: 'Youth Committee', code: 'YTH-01', committee_type: 'YOUTH', parent_committee_id: c1._id });

    return { seeded: 13, message: 'Seeded 13-Tier Bangladesh Committee Hierarchy' };
  }

  static async getCommitteesByOrg(organizationId, status) {
    const query = { organization_id: organizationId, is_deleted: false };
    if (status) query.status = status;

    const committees = await Committee.find(query)
      .populate('parent_committee_id', 'name code')
      .sort({ name: 1 });

    const committeeIds = committees.map(c => c._id);
    const memberCounts = await CommitteeMember.aggregate([
      { $match: { committee_id: { $in: committeeIds }, status: 'ACTIVE' } },
      { $group: { _id: '$committee_id', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    memberCounts.forEach(m => {
      countMap[m._id.toString()] = m.count;
    });

    return committees.map(c => ({
      ...c.toObject(),
      member_count: countMap[c._id.toString()] || 0
    }));
  }

  static async getCommitteeById(organizationId, committeeId) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    }).populate('parent_committee_id', 'name code');

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    const members = await CommitteeMember.find({
      committee_id: committeeId,
      status: 'ACTIVE'
    })
      .populate('user_id', 'first_name last_name email avatar_url')
      .sort({ position_order: 1 });

    return {
      committee,
      members
    };
  }

  static async updateCommittee(organizationId, committeeId, data) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(committee, data);
    await committee.save();
    return committee;
  }

  static async deleteCommittee(organizationId, committeeId) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    committee.is_deleted = true;
    await committee.save();
    return { message: 'Committee deleted successfully' };
  }

  static async addMemberToCommittee(organizationId, committeeId, data) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    const existing = await CommitteeMember.findOne({
      committee_id: committeeId,
      user_id: data.user_id,
      status: 'ACTIVE'
    });

    if (existing) {
      const error = new Error('User is already an active member of this committee');
      error.statusCode = 400;
      throw error;
    }

    const committeeMember = await CommitteeMember.create({
      committee_id: committeeId,
      user_id: data.user_id,
      position: data.position,
      position_order: data.position_order || 99,
      joined_date: data.joined_date ? new Date(data.joined_date) : new Date(),
      status: 'ACTIVE'
    });

    return committeeMember;
  }

  static async removeMemberFromCommittee(organizationId, committeeId, memberId) {
    const committeeMember = await CommitteeMember.findOne({
      _id: memberId,
      committee_id: committeeId
    });

    if (!committeeMember) {
      const error = new Error('Committee member record not found');
      error.statusCode = 404;
      throw error;
    }

    committeeMember.status = 'REMOVED';
    await committeeMember.save();

    await CommitteeHistory.create({
      committee_id: committeeId,
      user_id: committeeMember.user_id,
      position: committeeMember.position,
      start_date: committeeMember.joined_date,
      end_date: new Date(),
      reason: 'Removed by admin'
    });

    return { message: 'Member removed from committee' };
  }
}

module.exports = CommitteeService;
