const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const DocumentService = require('./document.service');

const getDocuments = asyncHandler(async (req, res) => {
  const docs = await DocumentService.getDocuments(req.organization._id, req.query);
  return apiResponse.success(res, docs, 'Documents retrieved successfully');
});

const uploadDocument = asyncHandler(async (req, res) => {
  const doc = await DocumentService.uploadDocument(req.organization._id, req.user._id, req.body);
  return apiResponse.created(res, doc, 'Document uploaded successfully');
});

const deleteDocument = asyncHandler(async (req, res) => {
  await DocumentService.deleteDocument(req.organization._id, req.params.id);
  return apiResponse.success(res, null, 'Document deleted successfully');
});

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument
};
