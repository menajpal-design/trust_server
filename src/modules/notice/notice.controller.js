const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const NoticeService = require('./notice.service');

const getNotices = asyncHandler(async (req, res) => {
  const result = await NoticeService.getNotices(req.organization._id, req.query);
  return apiResponse.success(res, result, 'Notices retrieved successfully');
});

const createNotice = asyncHandler(async (req, res) => {
  const notice = await NoticeService.createNotice(req.organization._id, req.user._id, req.body);
  return apiResponse.created(res, notice, 'Notice published successfully');
});

const deleteNotice = asyncHandler(async (req, res) => {
  const result = await NoticeService.deleteNotice(req.organization._id, req.user._id, req.params.id);
  return apiResponse.success(res, result, 'Notice deleted successfully');
});

module.exports = {
  getNotices,
  createNotice,
  deleteNotice
};
