const AIService = require('./ai.service');
const ApiResponse = require('../../utils/apiResponse');

class AIController {
  static async getFinancialInsights(req, res) {
    const result = await AIService.generateFinancialInsights(req.user.active_organization_id);
    return ApiResponse.success(res, 'AI Financial Insights generated', result, 200);
  }

  static async draftNotice(req, res) {
    const result = await AIService.generateNoticeDraft(req.body.topic, req.body.target_audience);
    return ApiResponse.success(res, 'AI Notice Draft generated', result, 200);
  }

  static async summarizeMeeting(req, res) {
    const result = await AIService.generateMeetingSummary(req.body.notes);
    return ApiResponse.success(res, 'AI Meeting Summary generated', result, 200);
  }
}

module.exports = AIController;
