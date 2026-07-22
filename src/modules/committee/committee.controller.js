const CommitteeService = require('./committee.service');
const ApiResponse = require('../../utils/apiResponse');

class CommitteeController {
  static async create(req, res) {
    const result = await CommitteeService.createCommittee(
      req.user.active_organization_id,
      req.body
    );
    return ApiResponse.success(res, 'Committee created successfully', result, 201);
  }

  static async seedBD(req, res) {
    const result = await CommitteeService.seedBDCommitteeHierarchy(req.user.active_organization_id);
    return ApiResponse.success(res, result.message, result, 200);
  }

  static async list(req, res) {
    const result = await CommitteeService.getCommitteesByOrg(
      req.user.active_organization_id,
      req.query.status
    );
    return ApiResponse.success(res, 'Committees retrieved', result, 200);
  }

  static async getById(req, res) {
    const result = await CommitteeService.getCommitteeById(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, 'Committee details retrieved', result, 200);
  }

  static async update(req, res) {
    const result = await CommitteeService.updateCommittee(
      req.user.active_organization_id,
      req.params.id,
      req.body
    );
    return ApiResponse.success(res, 'Committee updated successfully', result, 200);
  }

  static async delete(req, res) {
    const result = await CommitteeService.deleteCommittee(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, result.message, null, 200);
  }

  static async addMember(req, res) {
    const result = await CommitteeService.addMemberToCommittee(
      req.user.active_organization_id,
      req.params.id,
      req.body
    );
    return ApiResponse.success(res, 'Member assigned to committee', result, 201);
  }

  static async removeMember(req, res) {
    const result = await CommitteeService.removeMemberFromCommittee(
      req.user.active_organization_id,
      req.params.id,
      req.params.memberId
    );
    return ApiResponse.success(res, result.message, null, 200);
  }
}

module.exports = CommitteeController;
