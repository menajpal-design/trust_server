const Notice = require('./notice.model');
const AuditService = require('../audit/audit.service');

class NoticeService {
  static async getNotices(organizationId, { category, search, page = 1, limit = 20 }) {
    const query = { organization_id: organizationId, is_active: true };
    if (category) query.category = category;
    if (search) query.title = new RegExp(search, 'i');

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [docs, totalDocs] = await Promise.all([
      Notice.find(query)
        .populate('created_by', 'first_name last_name email avatar_url')
        .sort({ published_at: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Notice.countDocuments(query)
    ]);

    return {
      docs,
      meta: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalDocs,
        totalPages: Math.ceil(totalDocs / parseInt(limit, 10))
      }
    };
  }

  static async createNotice(organizationId, userId, data) {
    const notice = await Notice.create({
      organization_id: organizationId,
      created_by: userId,
      title: data.title,
      content: data.content,
      category: data.category || 'GENERAL',
      priority: data.priority || 'MEDIUM',
      attachment_url: data.attachment_url || '',
      broadcast_channels: data.broadcast_channels || ['EMAIL']
    });

    await AuditService.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'NOTICE_CREATED',
      entity_type: 'Notice',
      entity_id: notice._id.toString(),
      details: `Created notice "${notice.title}" with category ${notice.category}`
    });

    return await Notice.findById(notice._id).populate('created_by', 'first_name last_name email');
  }

  static async deleteNotice(organizationId, userId, noticeId) {
    const notice = await Notice.findOneAndDelete({
      _id: noticeId,
      organization_id: organizationId
    });

    if (!notice) {
      const err = new Error('Notice record not found');
      err.statusCode = 404;
      throw err;
    }

    await AuditService.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'NOTICE_DELETED',
      entity_type: 'Notice',
      entity_id: noticeId,
      details: `Deleted notice "${notice.title}"`
    });

    return { message: 'Notice deleted successfully' };
  }
}

module.exports = NoticeService;
