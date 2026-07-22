const PDFDocument = require('pdfkit');

const generatePDFReceiptBuffer = (organization, receipt) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Section
      doc
        .fillColor('#4F46E5')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(organization.name || 'SaaS Organization', 50, 50);

      doc
        .fillColor('#64748B')
        .fontSize(10)
        .font('Helvetica')
        .text(`Official Payment Receipt`, 50, 78);

      doc
        .strokeColor('#E2E8F0')
        .lineWidth(1)
        .moveTo(50, 100)
        .lineTo(550, 100)
        .stroke();

      // Receipt Metadata Box
      doc
        .fillColor('#0F172A')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`Receipt No: ${receipt.receipt_no}`, 50, 120);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#475569')
        .text(`Issue Date: ${new Date(receipt.issue_date).toLocaleDateString()}`, 50, 140)
        .text(`Payment Method: ${receipt.payment_method}`, 50, 155);

      // Payer Info Box
      doc
        .rect(320, 115, 230, 60)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      doc
        .fillColor('#475569')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('RECEIVED FROM:', 330, 123)
        .font('Helvetica')
        .fillColor('#0F172A')
        .fontSize(11)
        .text(receipt.payer_name, 330, 137)
        .fontSize(9)
        .fillColor('#64748B')
        .text(receipt.payer_email || 'No email provided', 330, 153);

      // Amount Banner Box
      doc
        .rect(50, 195, 500, 50)
        .fill('#EEF2FF');

      doc
        .fillColor('#4F46E5')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('AMOUNT RECEIVED:', 70, 212)
        .fontSize(20)
        .text(`$${receipt.amount.toFixed(2)} USD`, 250, 208, { align: 'right', width: 280 });

      // Description & Particulars Table
      doc
        .fillColor('#334155')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Description / Particulars', 50, 270);

      doc
        .strokeColor('#CBD5E1')
        .lineWidth(1)
        .moveTo(50, 285)
        .lineTo(550, 285)
        .stroke();

      doc
        .fillColor('#1E293B')
        .fontSize(10)
        .font('Helvetica')
        .text(receipt.description, 50, 295, { width: 500 });

      // Verification Footer
      doc
        .fontSize(9)
        .fillColor('#94A3B8')
        .text(`Verification Token: ${receipt.verification_token}`, 50, 360)
        .text('This is a computer-generated digital receipt and requires no physical signature.', 50, 375);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePDFReceiptBuffer
};
