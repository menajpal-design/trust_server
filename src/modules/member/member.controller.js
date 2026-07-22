const MemberService = require('./member.service');
const ApiResponse = require('../../utils/apiResponse');

class MemberController {
  static async list(req, res) {
    const result = await MemberService.getMembers(
      req.user.active_organization_id,
      req.query
    );
    return ApiResponse.success(res, 'Members retrieved', result.docs, 200, result.meta);
  }

  static async getById(req, res) {
    const result = await MemberService.getMemberById(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, 'Member details retrieved', result, 200);
  }

  static async create(req, res) {
    const result = await MemberService.addMember(
      req.user.active_organization_id,
      req.user._id,
      req.body
    );
    return ApiResponse.success(res, 'Member added successfully', result, 201);
  }

  static async update(req, res) {
    const result = await MemberService.updateMember(
      req.user.active_organization_id,
      req.params.id,
      req.user._id,
      req.body
    );
    return ApiResponse.success(res, 'Member updated successfully', result, 200);
  }

  static async getHistory(req, res) {
    const result = await MemberService.getMemberHistory(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, 'Member role and position history retrieved', result, 200);
  }

  static async delete(req, res) {
    const result = await MemberService.deleteMember(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, result.message, null, 200);
  }

  static async importExcel(req, res) {
    if (!req.file) {
      return ApiResponse.error(res, 'No Excel file uploaded', 400);
    }
    const result = await MemberService.importExcel(
      req.user.active_organization_id,
      req.file.buffer
    );
    return ApiResponse.success(res, result.message, result, 200);
  }

  static async exportExcel(req, res) {
    await MemberService.exportExcel(
      req.user.active_organization_id,
      res
    );
  }
}

module.exports = MemberController;
