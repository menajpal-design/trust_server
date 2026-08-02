const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const MeetingService = require('./meeting.service');

const getMeetings = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const meetings = await MeetingService.getMeetings(orgId);
  return ApiResponse.success(res, 'Meetings fetched successfully', meetings, 200);
});

const createMeeting = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const meeting = await MeetingService.createMeeting(orgId, req.user._id, req.body);
  return ApiResponse.success(res, 'Meeting created successfully', meeting, 201);
});

const addResolution = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const meeting = await MeetingService.addResolution(orgId, req.params.id, req.user._id, req.body);
  return ApiResponse.success(res, 'Resolution added successfully', meeting, 200);
});

const getVotes = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const votes = await MeetingService.getVotes(orgId);
  return ApiResponse.success(res, 'Votes fetched successfully', votes, 200);
});

const createVote = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const vote = await MeetingService.createVote(orgId, req.user._id, req.body);
  return ApiResponse.success(res, 'Election vote created successfully', vote, 201);
});

const castVote = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id;
  if (!orgId) return ApiResponse.error(res, 'Active organization context required', 400);
  const vote = await MeetingService.castVote(orgId, req.params.id, req.user._id, req.body.option_id);
  return ApiResponse.success(res, 'Vote cast successfully', vote, 200);
});

module.exports = {
  getMeetings,
  createMeeting,
  addResolution,
  getVotes,
  createVote,
  castVote
};
