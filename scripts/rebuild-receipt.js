const { PDFDocument, PDFName, rgb, decodePDFRawStream, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function main() {
  // ============================================
  // STEP 1: Extract logo image from original PDF
  // ============================================
  const originalData = fs.readFileSync('c:\\Users\\kason\\Downloads\\Receipt-2955-4198.pdf');
  const originalDoc = await PDFDocument.load(originalData);
  const originalPage = originalDoc.getPage(0);
  const originalNode = originalPage.node;
  
  // Get XObject image
  const resources = originalDoc.context.lookup(originalNode.get(PDFName.of('Resources')));
  const xobjDict = originalDoc.context.lookup(resources.get(PDFName.of('XObject')));
  const imageRef = xobjDict.get(PDFName.of('X7'));
  
  // ============================================
  // STEP 2: Create new PDF from scratch
  // ============================================
  const pdfDoc = await PDFDocument.create();
  
  // Copy the image from the original document
  const [copiedPage] = await pdfDoc.copyPages(originalDoc, [0]);
  // Extract the image by embedding from original
  // Actually, let's just embed the original page's image
  
  // A better approach: embed the original PDF just to grab the logo portion
  const [embeddedOriginal] = await pdfDoc.embedPdf(originalDoc, [0]);
  
  const page = pdfDoc.addPage([612, 792]);
  
  // Embed standard fonts (closest match to Inter)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // ============================================
  // COLORS matching Stripe receipt exactly
  // ============================================
  const black = rgb(0, 0, 0);
  const darkText = rgb(0.26, 0.26, 0.26);       // #424242 - main text
  const grayText = rgb(0.45, 0.45, 0.45);       // #737373 - secondary text
  const lightLabel = rgb(0.58, 0.58, 0.58);     // #949494 - light labels 
  const lineColor = rgb(0.922, 0.922, 0.922);   // #EBEBEB - lines/separators
  const bgWhite = rgb(1, 1, 1);
  
  // ============================================
  // LAYOUT CONSTANTS (matching Stripe receipt)
  // ============================================
  const pageW = 612;
  const pageH = 792;
  const marginLeft = 30;
  const marginRight = 582;
  const contentWidth = marginRight - marginLeft;
  
  // ============================================
  // DRAW WHITE BACKGROUND
  // ============================================
  page.drawRectangle({
    x: 0, y: 0, width: pageW, height: pageH,
    color: bgWhite,
  });
  
  // ============================================
  // STRIPE LOGO (top-right) - clip from original  
  // Draw only the logo portion of the original page
  // Logo is at approximately top-right corner
  // In original: logo image drawn at x=541.5→582 (40.5px), y=745→785
  // Using drawPage with clip to show only the logo
  // ============================================
  // Draw the original page clipped to logo area only
  // The logo in the original is an image XObject placed at stream coords
  // q 168.75 0 0 -168.75 2256.25 293.75 cm /X7 Do Q
  // This means: logo at x=2256.25*0.24=541.5, y=792-293.75*0.24=792-70.5=721.5
  // Size: 168.75*0.24 = 40.5 x 40.5
  page.drawPage(embeddedOriginal, {
    x: 0, y: 0, width: 612, height: 792
  });
  
  // Now cover everything EXCEPT the logo with white
  // Logo position: approximately x=541 to x=582, y=750 to y=790 (pdf-lib coords, bottom-left origin)
  // Actually from the stream: the logo is drawn with transform that puts it at ~x=541.5, y=721.5 (top of logo)
  // In pdf-lib (origin bottom-left): logo bottom y = 792 - 721.5 - 40.5 ≈ top-right
  // Let me compute properly:
  // Content stream transform: .23999999 0 0 -.23999999 0 792 cm
  // Then in the logo section: 168.75 0 0 -168.75 2256.25 293.75 cm
  // Final page coords: x = 0.24 * 2256.25 = 541.5
  //                    y = 792 - 0.24 * 293.75 = 792 - 70.5 = 721.5 (this is TOP of logo in pdf-lib)
  // Logo height in page: 0.24 * 168.75 = 40.5
  // So logo spans: x: 541.5 to 582, y: 721.5 to 762 (in pdf-lib y from bottom)
  // Wait, with negative y scale and -.23999999 in the transform:
  // y_page = 792 + (-.24) * y_stream 
  // But then inner transform has -168.75 for height
  // Let me think differently. The logo appears at top-right of the receipt.
  // In a 612x792 page, top-right means high y in pdf-lib coords.
  // Logo area: roughly x=540-585, y=750-790
  
  // Cover LEFT side (everything left of logo)
  page.drawRectangle({ x: 0, y: 0, width: 540, height: pageH, color: bgWhite });
  // Cover BELOW logo on right
  page.drawRectangle({ x: 540, y: 0, width: 72, height: 748, color: bgWhite });
  // Cover above logo
  page.drawRectangle({ x: 540, y: 790, width: 72, height: 2, color: bgWhite });
  
  // ============================================
  // STRIPE bottom black bar
  // Original has a thin black bar at very top of content stream
  // "0 0 612 4 re f" -> 4pt tall black bar at bottom of page
  // In pdf-lib coords (y from bottom): y=0, height=4, but with the transform it's different
  // Actually with .24 scale: 0 0 612*4.1666=2550 4*4.1666≈16.67 then scaled by .24
  // The bar is at the very top of the page (stream y=0 with inverted y)
  // = page y = 792 - 0 = 792, height = 0.24 * 4 * 4.1666 ≈ 4
  // It's a thin line at the very top
  // ============================================
  page.drawRectangle({
    x: 0, y: pageH - 3, width: pageW, height: 3,
    color: black,
  });
  
  // ============================================
  // RECEIPT CONTENT - All positioning from top
  // ============================================
  const topY = 762; // Starting Y (from bottom, pdf-lib coords)
  let y;
  
  // ----- "Receipt" title (24pt semibold) -----
  y = topY - 18;
  page.drawText('Receipt', {
    x: marginLeft, y: y, size: 18, font: helveticaBold, color: black
  });
  
  // ----- Receipt info block -----
  const labelX = marginLeft;
  const valueX = 134;
  const infoSize = 9;
  const lineH = 14;
  
  // Row 1: Receipt number / Invoice number
  y -= 30;
  page.drawText('Receipt number', {
    x: labelX, y: y, size: infoSize, font: helveticaBold, color: darkText
  });
  page.drawText('INV-BD6E-4198', {
    x: valueX, y: y, size: infoSize, font: helvetica, color: grayText
  });
  
  y -= lineH;
  page.drawText('Invoice number', {
    x: labelX, y: y, size: infoSize, font: helveticaBold, color: darkText
  });
  page.drawText('2955-4198', {
    x: valueX, y: y, size: infoSize, font: helvetica, color: grayText
  });
  
  y -= lineH;
  page.drawText('Date paid', {
    x: labelX, y: y, size: infoSize, font: helveticaBold, color: darkText
  });
  page.drawText('February 02, 2026', {
    x: valueX, y: y, size: infoSize, font: helvetica, color: grayText
  });
  
  y -= lineH;
  page.drawText('Payment method', {
    x: labelX, y: y, size: infoSize, font: helveticaBold, color: darkText
  });
  page.drawText('Visa - 4198', {
    x: valueX, y: y, size: infoSize, font: helvetica, color: grayText
  });
  
  // ----- Bill to + Amount paid (two columns) -----
  const rightColX = 310;
  
  y -= 24;
  const billToY = y;
  
  // Left: Bill to
  page.drawText('Bill to', {
    x: labelX, y: billToY, size: infoSize, font: helveticaBold, color: darkText
  });
  
  let bty = billToY - lineH;
  page.drawText('UNIKIN (Chris Ngozulu K)', {
    x: labelX, y: bty, size: infoSize, font: helvetica, color: grayText
  });
  bty -= 12;
  page.drawText('J1 Plateau des Résidents, UNIKIN,', {
    x: labelX, y: bty, size: infoSize, font: helvetica, color: grayText
  });
  bty -= 12;
  page.drawText('Kinshasa-Lemba', {
    x: labelX, y: bty, size: infoSize, font: helvetica, color: grayText
  });
  bty -= 12;
  page.drawText('Kinshasa', {
    x: labelX, y: bty, size: infoSize, font: helvetica, color: grayText
  });
  bty -= 12;
  page.drawText('Congo - Kinshasa', {
    x: labelX, y: bty, size: infoSize, font: helvetica, color: grayText
  });
  bty -= 12;
  page.drawText('kasongongozulu@gmail.com', {
    x: labelX, y: bty, size: infoSize, font: helvetica, color: grayText
  });
  
  // Right: Amount paid / Date / Payment method / Summary
  let rty = billToY;
  page.drawText('Amount paid', {
    x: rightColX, y: rty, size: infoSize, font: helveticaBold, color: darkText
  });
  rty -= lineH;
  page.drawText('$240.00', {
    x: rightColX, y: rty, size: infoSize, font: helvetica, color: grayText
  });
  rty -= 18;
  page.drawText('Date', {
    x: rightColX, y: rty, size: infoSize, font: helveticaBold, color: darkText
  });
  rty -= lineH;
  page.drawText('February 02, 2026', {
    x: rightColX, y: rty, size: infoSize, font: helvetica, color: grayText
  });
  rty -= 18;
  page.drawText('Payment method', {
    x: rightColX, y: rty, size: infoSize, font: helveticaBold, color: darkText
  });
  rty -= lineH;
  page.drawText('Visa - 4198', {
    x: rightColX, y: rty, size: infoSize, font: helvetica, color: grayText
  });
  rty -= 18;
  page.drawText('Summary', {
    x: rightColX, y: rty, size: infoSize, font: helveticaBold, color: darkText
  });
  
  // ----- Horizontal separator -----
  y = Math.min(bty, rty) - 20;
  page.drawRectangle({ x: marginLeft, y: y, width: contentWidth, height: 0.75, color: lineColor });
  
  // ----- "$240.00 paid on February 02, 2026" -----
  y -= 22;
  page.drawText('$240.00 paid on February 02, 2026', {
    x: marginLeft, y: y, size: 13.5, font: helveticaBold, color: black
  });
  
  // ----- Horizontal separator -----
  y -= 18;
  page.drawRectangle({ x: marginLeft, y: y, width: contentWidth, height: 0.75, color: lineColor });
  
  // ----- TABLE HEADER -----
  y -= 14;
  const descX = marginLeft;
  const qtyX = 430;
  const unitPriceX = 477;
  const amountX = 545;
  
  page.drawText('Description', {
    x: descX, y: y, size: 7.5, font: helvetica, color: lightLabel
  });
  page.drawText('Qty', {
    x: qtyX, y: y, size: 7.5, font: helvetica, color: lightLabel
  });
  page.drawText('Unit price', {
    x: unitPriceX, y: y, size: 7.5, font: helvetica, color: lightLabel
  });
  page.drawText('Amount', {
    x: amountX, y: y, size: 7.5, font: helvetica, color: lightLabel
  });
  
  // Header separator
  y -= 8;
  page.drawRectangle({ x: marginLeft, y: y, width: contentWidth, height: 0.75, color: lineColor });
  
  // ----- TABLE ROW -----
  y -= 16;
  page.drawText('Pro', {
    x: descX, y: y, size: 9, font: helvetica, color: darkText
  });
  page.drawText('1', {
    x: qtyX + 4, y: y, size: 9, font: helvetica, color: darkText
  });
  page.drawText('$20.00', {
    x: unitPriceX, y: y, size: 9, font: helvetica, color: darkText
  });
  page.drawText('$240.00', {
    x: amountX, y: y, size: 9, font: helvetica, color: darkText
  });
  
  // Date range below "Pro"
  y -= 12;
  page.drawText('Feb 02, 2026  – Jan 03, 2027', {
    x: descX, y: y, size: 8, font: helvetica, color: lightLabel
  });
  
  // ----- SUMMARY SECTION -----
  y -= 16;
  
  // White space/invisible separator
  y -= 4;
  
  // Subtotal separator
  page.drawRectangle({ x: qtyX - 20, y: y, width: marginRight - qtyX + 20, height: 0.75, color: lineColor });
  
  y -= 14;
  page.drawText('Subtotal', {
    x: qtyX - 20, y: y, size: 9, font: helvetica, color: grayText
  });
  // Right-align $240.00
  const subtotalW = helvetica.widthOfTextAtSize('$240.00', 9);
  page.drawText('$240.00', {
    x: marginRight - subtotalW, y: y, size: 9, font: helvetica, color: darkText
  });
  
  y -= 6;
  page.drawRectangle({ x: qtyX - 20, y: y, width: marginRight - qtyX + 20, height: 0.75, color: lineColor });
  
  y -= 14;
  page.drawText('Total', {
    x: qtyX - 20, y: y, size: 9, font: helveticaBold, color: darkText
  });
  const totalW = helveticaBold.widthOfTextAtSize('$240.00', 9);
  page.drawText('$240.00', {
    x: marginRight - totalW, y: y, size: 9, font: helveticaBold, color: darkText
  });
  
  y -= 6;
  page.drawRectangle({ x: qtyX - 20, y: y, width: marginRight - qtyX + 20, height: 0.75, color: lineColor });
  
  y -= 14;
  page.drawText('Amount paid', {
    x: qtyX - 20, y: y, size: 9, font: helveticaBold, color: darkText
  });
  const apW = helveticaBold.widthOfTextAtSize('$240.00', 9);
  page.drawText('$240.00', {
    x: marginRight - apW, y: y, size: 9, font: helveticaBold, color: darkText
  });
  
  // ----- PAYMENT DETAILS SECTION -----
  y -= 36;
  page.drawRectangle({ x: marginLeft, y: y + 6, width: contentWidth, height: 0.75, color: lineColor });
  
  y -= 8;
  page.drawText('Payment details', {
    x: marginLeft, y: y, size: 13.5, font: helveticaBold, color: black
  });
  
  // Payment details table
  y -= 24;
  const pmColX = marginLeft;
  const dateColX = 295;
  const amtPaidColX = 420;
  const rcptColX = 520;
  
  page.drawText('Payment method', {
    x: pmColX, y: y, size: 7.5, font: helvetica, color: lightLabel
  });
  page.drawText('Date', {
    x: dateColX, y: y, size: 7.5, font: helvetica, color: lightLabel
  });
  page.drawText('Amount paid', {
    x: amtPaidColX, y: y, size: 7.5, font: helvetica, color: lightLabel
  });
  page.drawText('Receipt number', {
    x: rcptColX, y: y, size: 7.5, font: helvetica, color: lightLabel
  });
  
  y -= 8;
  page.drawRectangle({ x: marginLeft, y: y, width: contentWidth, height: 0.75, color: lineColor });
  
  y -= 14;
  page.drawText('Visa - 4198', {
    x: pmColX, y: y, size: 9, font: helvetica, color: darkText
  });
  page.drawText('February 02, 2026', {
    x: dateColX, y: y, size: 9, font: helvetica, color: darkText
  });
  page.drawText('$240.00', {
    x: amtPaidColX, y: y, size: 9, font: helvetica, color: darkText
  });
  page.drawText('2955-4198', {
    x: rcptColX, y: y, size: 9, font: helvetica, color: darkText
  });
  
  // ----- FOOTER -----
  y -= 36;
  page.drawRectangle({ x: marginLeft, y: y + 6, width: contentWidth, height: 0.75, color: lineColor });
  
  y -= 10;
  const footerSize = 8;
  page.drawText('No items on this invoice are subject to your subscription, your invoice amount is being', {
    x: marginLeft, y: y, size: footerSize, font: helvetica, color: grayText
  });
  y -= 11;
  page.drawText('processed via https://billing.stripe.com/p/login/cN2bKK1oP0UU4eY3cc, please visit', {
    x: marginLeft, y: y, size: footerSize, font: helvetica, color: grayText
  });
  y -= 11;
  page.drawText('https://billing.stripe.com/p/login/cN2bKK1oP0UU4eY3cc to manage your subscription.', {
    x: marginLeft, y: y, size: footerSize, font: helvetica, color: grayText
  });
  
  // ----- Bottom line -----
  y -= 20;
  page.drawRectangle({ x: marginLeft, y: y, width: contentWidth, height: 0.75, color: lineColor });
  
  // Save
  const outputPath = 'c:\\Users\\kason\\Downloads\\Receipt-2955-4198-modified.pdf';
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('PDF saved to:', outputPath);
  console.log('Size:', pdfBytes.length, 'bytes');
}

main().catch(console.error);
