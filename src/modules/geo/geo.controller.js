const { BANGLADESH_DIVISIONS, BANGLADESH_DISTRICTS, BANGLADESH_SAMPLE_UPAZILAS } = require('./bangladeshData');
const GeoService = require('./geo.service');
const ApiResponse = require('../../utils/apiResponse');

class GeoController {
  static getDivisions(req, res) {
    return ApiResponse.success(res, 'Bangladesh Divisions retrieved', BANGLADESH_DIVISIONS, 200);
  }

  static getDistricts(req, res) {
    const { division } = req.query;
    if (division && BANGLADESH_DISTRICTS[division]) {
      return ApiResponse.success(res, `Districts for ${division} retrieved`, BANGLADESH_DISTRICTS[division], 200);
    }
    const allDistricts = Object.values(BANGLADESH_DISTRICTS).flat();
    return ApiResponse.success(res, 'All Bangladesh Districts retrieved', allDistricts, 200);
  }

  static getUpazilas(req, res) {
    const { district } = req.query;
    const sample = BANGLADESH_SAMPLE_UPAZILAS[district] || ['Sadar', 'North Upazila', 'South Upazila', 'East Upazila', 'West Upazila'];
    return ApiResponse.success(res, `Upazilas for ${district || 'sample'} retrieved`, sample, 200);
  }

  static async sync(req, res) {
    const result = await GeoService.syncBDGeoData();
    return ApiResponse.success(res, result.message, result, 200);
  }

  static async exportExcel(req, res) {
    await GeoService.exportExcel(res);
  }

  static async importExcel(req, res) {
    if (!req.file) {
      return ApiResponse.error(res, 'No Excel file uploaded', 400);
    }
    const result = await GeoService.importExcel(req.file.buffer);
    return ApiResponse.success(res, result.message, result, 200);
  }
}

module.exports = GeoController;
