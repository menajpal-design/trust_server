const express = require('express');
const GeoController = require('./geo.controller');
const upload = require('../../middlewares/upload.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.get('/divisions', asyncHandler(GeoController.getDivisions));
router.get('/districts', asyncHandler(GeoController.getDistricts));
router.get('/upazilas', asyncHandler(GeoController.getUpazilas));

router.post('/sync', asyncHandler(GeoController.sync));
router.get('/export', asyncHandler(GeoController.exportExcel));
router.post('/import', upload.single('file'), asyncHandler(GeoController.importExcel));

module.exports = router;
