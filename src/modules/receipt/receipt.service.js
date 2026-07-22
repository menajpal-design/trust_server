const crypto = require('crypto');
const QRCode = require('qrcode');
const Receipt = require('./receipt.model');
const Organization = require('../auth/organization.model');
const env = require('../../config/env');
const { generatePDFReceiptBuffer } = require('../../utils/pdfReceiptGenerator');
const nodemailer = require('nodemailer');

class ReceiptService {
  static async createReceipt(organizationId, data) {
    const count = await Receipt.countDocuments({ organization_id: organizationId });
    const receiptNo = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const verificationToken = crypto.randomBytes(16).toString('hex');

    const verifyUrl = `${env.CLIENT_URL}/verify-receipt?token=${verificationToken}`;
    const qrCodeData = await QRCode.toDataURL(verifyUrl, { errorCorrectionLevel: 'H' });

    const receipt = await Receipt.create({
      ...data,
      organization_id: organizationId,
      receipt_no: receiptNo,
      verification_token: verificationToken,
      qr_code_data: qrCodeData
    });

    return receipt;
  }

  static async getReceipts(organizationId, { search, page = 1, limit = 20 }) {
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = { organization_id: organizationId, is_deleted: false };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { receipt_no: regex },
        { payer_name: regex },
        { payer_email: regex },
        { description: regex }
      ];
    }

    const totalDocs = await Receipt.countDocuments(query);
    const docs = await Receipt.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return {
      docs,
      meta: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalDocs,
        totalPages: Math.ceil(totalDocs / parseInt(limit, 10))
      }
    };
  }

  static async getReceiptById(organizationId, receiptId) {
    const receipt = await Receipt.findOne({
      _id: receiptId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    return receipt;
  }

  static async verifyReceiptPublic(verificationToken) {
    const receipt = await Receipt.findOne({
      verification_token: verificationToken,
      is_deleted: false
    }).populate('organization_id', 'name logo_url contact_email');

    if (!receipt) {
      const error = new Error('Invalid or unverified receipt token');
      error.statusCode = 404;
      throw error;
    }

    return {
      is_valid: true,
      receipt_no: receipt.receipt_no,
      payer_name: receipt.payer_name,
      amount: receipt.amount,
      payment_method: receipt.payment_method,
      description: receipt.description,
      issue_date: receipt.issue_date,
      organization: {
        name: receipt.organization_id.name,
        logo_url: receipt.organization_id.logo_url
      }
    };
  }

  static async generatePDF(organizationId, receiptId) {
    const receipt = await this.getReceiptById(organizationId, receiptId);
    const organization = await Organization.findById(organizationId);

    return await generatePDFReceiptBuffer(organization, receipt);
  }

  static async emailReceipt(organizationId, receiptId, targetEmail) {
    const receipt = await this.getReceiptById(organizationId, receiptId);
    const organization = await Organization.findById(organizationId);
    const pdfBuffer = await generatePDFReceiptBuffer(organization, receipt);

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: env.SMTP_USER && env.SMTP_PASS ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      } : undefined
    });

    const mailOptions = {
      from: env.EMAIL_FROM,
      to: targetEmail,
      subject: `Payment Receipt ${receipt.receipt_no} - ${organization.name}`,
      html: `
        <h2>Payment Receipt Confirmation</h2>
        <p>Dear ${receipt.payer_name},</p>
        <p>Thank you for your payment to <strong>${organization.name}</strong>.</p>
        <p>Receipt No: <strong>${receipt.receipt_no}</strong><br>Amount: <strong>$${receipt.amount.toFixed(2)} USD</strong></p>
        <p>Your official PDF receipt is attached to this email.</p>
      `,
      attachments: [
        {
          filename: `Receipt_${receipt.receipt_no}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return { message: `PDF receipt emailed successfully to ${targetEmail}` };
  }
}

module.exports = ReceiptService;
