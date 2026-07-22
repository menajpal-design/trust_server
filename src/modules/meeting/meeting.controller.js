const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const MeetingService = require('./meeting.service');

const getMeetings = asyncHandler(async (req, res) => {
  const meetings = await MeetingService.getMeetings(req.organization._id);
  return apiResponse.success(res, meetings, 'Meetings fetched');
});

const createMeeting = asyncHandler(async (req, res) => {
  const meeting = await MeetingService.createMeeting(req.organization._id, req.user._id, req.body);
  return apiResponse.created(res, meeting, 'Meeting created');
});

const addResolution = asyncHandler(async (req, res) => {
  const meeting = await MeetingService.addResolution(req.organization._id, req.params.id, req.user._id, req.body);
  return apiResponse.success(res, meeting, 'Resolution added');
});

const getVotes = asyncHandler(async (req, res) => {
  const votes = await MeetingService.getVotes(req.organization._id);
  return apiResponse.success(res, votes, 'Votes fetched');
});

const createVote = asyncHandler(async (req, res) => {
  const vote = await MeetingService.createVote(req.organization._id, req.user._id, req.body);
  return apiResponse.created(res, vote, 'Election vote created');
});

const castVote = asyncHandler(async (req, res) => {
  const vote = await MeetingService.castVote(req.organization._id, req.params.id, req.user._id, req.body.option_id);
  return apiResponse.success(res, vote, 'Vote cast successfully');
});

module.exports = {
  getMeetings,
  createMeeting,
  addResolution,
  getVotes,
  createVote,
  castVote
};
