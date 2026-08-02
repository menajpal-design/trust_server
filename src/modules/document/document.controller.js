const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const DocumentService = require('./document.service');

const getDocuments = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id || req.headers['x-tenant-id'];
  if (!orgId) {
    return ApiResponse.error(res, 'Active organization context required.', 400);
  }
  const docs = await DocumentService.getDocuments(orgId, req.query);
  return ApiResponse.success(res, 'Documents retrieved successfully', docs, 200);
});

const uploadDocument = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id || req.headers['x-tenant-id'];
  if (!orgId) {
    return ApiResponse.error(res, 'Active organization context required.', 400);
  }
  const doc = await DocumentService.uploadDocument(orgId, req.user._id, req.body);
  return ApiResponse.success(res, 'Document uploaded successfully', doc, 201);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const orgId = req.user?.active_organization_id || req.headers['x-tenant-id'];
  if (!orgId) {
    return ApiResponse.error(res, 'Active organization context required.', 400);
  }
  await DocumentService.deleteDocument(orgId, req.params.id);
  return ApiResponse.success(res, 'Document deleted successfully', null, 200);
});

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument
};

