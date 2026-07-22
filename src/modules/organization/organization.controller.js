const OrganizationService = require('./organization.service');
const ApiResponse = require('../../utils/apiResponse');

class OrganizationController {
  static async create(req, res) {
    const result = await OrganizationService.createOrganization(req.user._id, req.body);
    return ApiResponse.success(res, 'Organization created successfully', result, 201);
  }

  static async listUserOrganizations(req, res) {
    const result = await OrganizationService.getOrganizationsByUser(req.user._id);
    return ApiResponse.success(res, 'Organizations retrieved', result, 200);
  }

  static async getById(req, res) {
    const result = await OrganizationService.getOrganizationById(req.params.id);
    return ApiResponse.success(res, 'Organization details retrieved', result, 200);
  }

  static async update(req, res) {
    const result = await OrganizationService.updateOrganization(req.params.id, req.body);
    return ApiResponse.success(res, 'Organization updated successfully', result, 200);
  }

  static async updateTransparency(req, res) {
    const result = await OrganizationService.updateTransparencySettings(
      req.params.id,
      req.user._id,
      req.body.transparency_settings
    );
    return ApiResponse.success(res, 'Transparency & Visibility settings updated', result, 200);
  }

  static async delete(req, res) {
    const result = await OrganizationService.deleteOrganization(req.params.id);
    return ApiResponse.success(res, result.message, null, 200);
  }

  static async uploadMedia(req, res) {
    if (!req.file) {
      return ApiResponse.error(res, 'No image file uploaded', 400);
    }
    const result = await OrganizationService.updateMedia(req.params.id, req.body.type, req.file);
    return ApiResponse.success(res, `Organization ${req.body.type} updated successfully`, result, 200);
  }
}

module.exports = OrganizationController;
