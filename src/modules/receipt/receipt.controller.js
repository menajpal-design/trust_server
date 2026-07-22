const ReceiptService = require('./receipt.service');
const ApiResponse = require('../../utils/apiResponse');

class ReceiptController {
  static async create(req, res) {
    const result = await ReceiptService.createReceipt(
      req.user.active_organization_id,
      req.body
    );
    return ApiResponse.success(res, 'Receipt issued successfully', result, 201);
  }

  static async list(req, res) {
    const result = await ReceiptService.getReceipts(
      req.user.active_organization_id,
      req.query
    );
    return ApiResponse.success(res, 'Receipts retrieved', result.docs, 200, result.meta);
  }

  static async getById(req, res) {
    const result = await ReceiptService.getReceiptById(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, 'Receipt details retrieved', result, 200);
  }

  static async downloadPDF(req, res) {
    const pdfBuffer = await ReceiptService.generatePDF(
      req.user.active_organization_id,
      req.params.id
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=receipt_${req.params.id}.pdf`);
    res.send(pdfBuffer);
  }

  static async emailReceipt(req, res) {
    const result = await ReceiptService.emailReceipt(
      req.user.active_organization_id,
      req.params.id,
      req.body.target_email
    );
    return ApiResponse.success(res, result.message, null, 200);
  }

  static async verifyPublic(req, res) {
    const result = await ReceiptService.verifyReceiptPublic(req.query.token);
    return ApiResponse.success(res, 'Receipt verification status retrieved', result, 200);
  }
}

module.exports = ReceiptController;
