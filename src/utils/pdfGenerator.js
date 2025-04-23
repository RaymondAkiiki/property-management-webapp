const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Generate PDF file
 * @param {Object} options - PDF options
 * @param {string} options.title - PDF document title
 * @param {Object} options.data - Data to include in the PDF
 * @returns {Promise<string>} - Path to generated PDF file
 */
exports.generatePdf = async (options) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${options.title.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.pdf`;
      const outputPath = path.join(uploadsDir, filename);
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: options.title,
          Author: config.appName,
          CreationDate: new Date()
        }
      });
      
      // Pipe PDF to output file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Add company logo if available
      const logoPath = path.join(__dirname, '../assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, {
          fit: [150, 100],
          align: 'right'
        });
      }
      
      // Add title
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(options.title, { align: 'center' })
         .moveDown(1);
      
      // Add current date
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' })
         .moveDown(2);
      
      // Process data based on document type
      if (options.title === 'Payment Receipt') {
        generateReceiptContent(doc, options.data);
      } else {
        // Generic document - just print data as key-value pairs
        doc.fontSize(14).font('Helvetica-Bold').text('Document Details:').moveDown(0.5);
        
        Object.entries(options.data).forEach(([key, value]) => {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(`${key.charAt(0).toUpperCase() + key.slice(1)}: `, { continued: true })
             .font('Helvetica')
             .text(`${value}`);
        });
      }
      
      // Add footer with page number
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(10)
           .text(
             `Page ${i + 1} of ${pageCount} | ${config.appName} © ${new Date().getFullYear()}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }
      
      // Finalize PDF
      doc.end();
      
      // Resolve with file path when stream is closed
      stream.on('finish', () => {
        resolve(outputPath);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate receipt-specific content
 * @param {PDFDocument} doc - PDFKit document
 * @param {Object} data - Receipt data
 */
function generateReceiptContent(doc, data) {
  // Receipt number and heading
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('RECEIPT', { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Receipt #: ${data.paymentId.substring(0, 8).toUpperCase()}`, { align: 'right' })
     .moveDown(1);
  
  // Property and tenant details
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Property:')
     .fontSize(12)
     .font('Helvetica')
     .text(data.property)
     .moveDown(0.5);
  
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Tenant:')
     .fontSize(12)
     .font('Helvetica')
     .text(data.tenant)
     .moveDown(1);
  
  // Payment details
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Payment Details')
     .moveDown(0.5);
  
  // Create a table-like structure
  const tableTop = doc.y;
  const tableLeft = 50;
  const colWidth = (doc.page.width - 100) / 2;
  
  // Draw table header
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Description', tableLeft, tableTop, { width: colWidth })
     .text('Details', tableLeft + colWidth, tableTop, { width: colWidth })
     .moveDown(0.5);
  
  const lineY = doc.y;
  doc.moveTo(tableLeft, lineY)
     .lineTo(tableLeft + colWidth * 2, lineY)
     .stroke()
     .moveDown(0.5);
  
  // Starting Y for table rows
  let rowY = doc.y;
  
  // Add payment details
  addTableRow(doc, 'Amount', `$${data.amount.toFixed(2)}`, tableLeft, rowY, colWidth);
  rowY = doc.y;
  
  addTableRow(doc, 'Payment Date', data.date, tableLeft, rowY, colWidth);
  rowY = doc.y;
  
  addTableRow(doc, 'Payment Method', data.paymentMethod, tableLeft, rowY, colWidth);
  rowY = doc.y;
  
  addTableRow(doc, 'Description', data.description, tableLeft, rowY, colWidth);
  
  // Add horizontal line at the end of the table
  const endLineY = doc.y + 10;
  doc.moveTo(tableLeft, endLineY)
     .lineTo(tableLeft + colWidth * 2, endLineY)
     .stroke()
     .moveDown(1);
  
  // Thank you message
  doc.moveDown(1)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Thank you for your payment!', { align: 'center' })
     .moveDown(0.5)
     .fontSize(10)
     .font('Helvetica')
     .text('This is an electronically generated receipt and does not require a signature.', { align: 'center' })
     .moveDown(0.5);
}
S
/**
 * Add a row to the table-like structure
 * @param {PDFDocument} doc - PDFKit document
 * @param {string} label - Row label
 * @param {string} value - Row value
 * @param {number} x - Starting X position
 * @param {number} y - Starting Y position
 * @param {number} colWidth - Column width
 */
function addTableRow(doc, label, value, x, y, colWidth) {
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text(label, x, y, { width: colWidth })
     .font('Helvetica')
     .text(value, x + colWidth, y, { width: colWidth })
     .moveDown(0.5);
}