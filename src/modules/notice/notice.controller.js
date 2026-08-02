const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const NoticeService = require('./notice.service');

const getNotices = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const result = await NoticeService.getNotices(orgId, req.query);
  return ApiResponse.success(res, 'Notices retrieved successfully', result.docs, 200, result.meta);
});

const createNotice = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const notice = await NoticeService.createNotice(orgId, req.user._id, req.body);
  return ApiResponse.success(res, 'Notice published successfully', notice, 201);
});

const deleteNotice = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const result = await NoticeService.deleteNotice(orgId, req.user._id, req.params.id);
  return ApiResponse.success(res, 'Notice deleted successfully', result, 200);
});

module.exports = {
  getNotices,
  createNotice,
  deleteNotice
};
