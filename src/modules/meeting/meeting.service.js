const Meeting = require('./meeting.model');
const Vote = require('./vote.model');
const AuditService = require('../audit/audit.service');

class MeetingService {
  static async getMeetings(organizationId) {
    return await Meeting.find({ organization_id: organizationId })
      .populate('created_by', 'first_name last_name email')
      .sort({ scheduled_at: -1 });
  }

  static async createMeeting(organizationId, userId, data) {
    const meeting = await Meeting.create({
      organization_id: organizationId,
      created_by: userId,
      title: data.title,
      meeting_type: data.meeting_type || 'GENERAL',
      agenda: data.agenda || '',
      location: data.location || 'Main Office',
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : new Date()
    });

    await AuditService.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'MEETING_CREATED',
      entity_type: 'Meeting',
      entity_id: meeting._id.toString(),
      details: `Scheduled meeting "${meeting.title}"`
    });

    return meeting;
  }

  static async addResolution(organizationId, meetingId, userId, { title, description }) {
    const meeting = await Meeting.findOne({ _id: meetingId, organization_id: organizationId });
    if (!meeting) {
      const err = new Error('Meeting not found');
      err.statusCode = 404;
      throw err;
    }

    meeting.resolutions.push({
      title,
      description,
      approved_by: 'Executive Committee'
    });
    await meeting.save();

    return meeting;
  }

  static async getVotes(organizationId) {
    return await Vote.find({ organization_id: organizationId })
      .populate('created_by', 'first_name last_name email')
      .sort({ created_at: -1 });
  }

  static async createVote(organizationId, userId, data) {
    const options = data.options?.map((opt, idx) => ({
      option_id: `opt_${idx + 1}`,
      option_text: opt,
      votes_count: 0
    })) || [];

    const vote = await Vote.create({
      organization_id: organizationId,
      created_by: userId,
      title: data.title,
      description: data.description || '',
      category: data.category || 'COMMITTEE_ELECTION',
      options,
      end_date: data.end_date ? new Date(data.end_date) : new Date(Date.now() + 7 * 24 * 3600 * 1000)
    });

    return vote;
  }

  static async castVote(organizationId, voteId, userId, optionId) {
    const vote = await Vote.findOne({ _id: voteId, organization_id: organizationId });
    if (!vote) {
      const err = new Error('Vote election poll not found');
      err.statusCode = 404;
      throw err;
    }

    if (vote.status === 'CLOSED' || new Date() > new Date(vote.end_date)) {
      const err = new Error('This voting election has already closed');
      err.statusCode = 400;
      throw err;
    }

    const alreadyVoted = vote.voters.some(v => v.user_id.toString() === userId.toString());
    if (alreadyVoted) {
      const err = new Error('You have already cast your secret vote in this election');
      err.statusCode = 400;
      throw err;
    }

    const targetOpt = vote.options.find(o => o.option_id === optionId);
    if (!targetOpt) {
      const err = new Error('Selected option is invalid');
      err.statusCode = 400;
      throw err;
    }

    targetOpt.votes_count += 1;
    vote.voters.push({
      user_id: userId,
      option_id: optionId
    });

    await vote.save();
    return vote;
  }
}

module.exports = MeetingService;
