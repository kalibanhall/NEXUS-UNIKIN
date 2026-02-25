const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function main() {
  const originalData = fs.readFileSync('c:\\Users\\kason\\Downloads\\Receipt-2955-4198.pdf');
  const originalDoc = await PDFDocument.load(originalData);
  
  const pdfDoc = await PDFDocument.create();
  const [embeddedPage] = await pdfDoc.embedPdf(originalDoc, [0]);
  const page = pdfDoc.addPage([612, 792]);
  
  // Draw original as background
  page.drawPage(embeddedPage, { x: 0, y: 0, width: 612, height: 792 });
  
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const white = rgb(1, 1, 1);
  const black = rgb(0, 0, 0);
  const darkText = rgb(0.2, 0.2, 0.2);
  const grayText = rgb(0.42, 0.42, 0.42);
  const lightGray = rgb(0.58, 0.58, 0.58);
  const lineColor = rgb(0.92, 0.92, 0.92);
  
  // =================================================================
  // Exact position mapping from content stream analysis:
  //   page_x = 0.75 * stream_x
  //   page_y = 762 - 0.75 * stream_y
  // 
  // Key positions (stream → page):
  //   y=24  →  744   (Receipt title, 24pt bold)
  //   y=64  →  714   (Receipt#, Invoice#, 12pt)
  //   y=82  →  700.5 (Date paid, Payment method, 12pt)
  //   y=120 →  672   (Bill to / Amount paid labels)
  //   y=138 →  658.5 (Address line 1 / Amount value)
  //   y=156 →  645   (Address line 2 / Date paid info)
  //   y=174 →  631.5 (Address line 3 / Payment method)
  //   y=192 →  618   (Address line 4 / Summary)
  //   y=210 →  604.5 (Address line 5)
  //   y=263 →  564.75 ("$xxx paid on..." 18pt bold)
  //   y=312 →  528   (Table headers, 10pt)
  //   y=341 →  506.25 (Table row: Pro)
  //   y=359 →  492.75 (Date range)
  //   y=377 →  479.25 (Separator)
  //   y=398 →  463.5  (Subtotal)
  //   y=417 →  449.25 (Total)
  //   y=436 →  435    (Amount paid)
  //   y=489 →  395.25 (Payment details header)
  //   y=537 →  359.25 (Payment method row)
  //   y=566 →  337.5  (Payment detail row 2)
  //
  // x=40→30, x=138→103.5, x=334→250.5, x=408→306
  // x=590→442.5, x=601→450.75, x=647→485.25, x=652→489
  // x=693→519.75, x=735→551.25, x=739→554.25
  //
  // Logo: x=541.5 to 582, y=721.5 to 762
  // =================================================================

  // --- 1) Cover "Date paid" value (right of label at x=103.5, y=700.5) ---
  // Original date text spans from x≈103.5 to ~250
  page.drawRectangle({ x: 102, y: 694, width: 160, height: 14, color: white });
  page.drawText('February 02, 2026', {
    x: 103.5, y: 697, size: 9, font: helvetica, color: grayText
  });

  // --- 2) Cover Bill to address block (y=658 down to ~604) ---
  // Left column, lines from y=138 to y=210 in stream = 658.5 to 604.5 in page
  page.drawRectangle({ x: 28, y: 596, width: 220, height: 68, color: white });
  
  page.drawText('UNIKIN (Chris Ngozulu K)', {
    x: 30, y: 652, size: 9, font: helvetica, color: grayText
  });
  page.drawText('J1 Plateau des Résidents, UNIKIN,', {
    x: 30, y: 640, size: 9, font: helvetica, color: grayText
  });
  page.drawText('Kinshasa-Lemba', {
    x: 30, y: 628, size: 9, font: helvetica, color: grayText
  });
  page.drawText('Kinshasa', {
    x: 30, y: 616, size: 9, font: helvetica, color: grayText
  });
  page.drawText('Congo - Kinshasa', {
    x: 30, y: 604, size: 9, font: helvetica, color: grayText
  });

  // Email (below Congo - Kinshasa)
  page.drawRectangle({ x: 28, y: 584, width: 220, height: 14, color: white });
  page.drawText('kasongongozulu@gmail.com', {
    x: 30, y: 588, size: 9, font: helvetica, color: grayText
  });

  // --- 3) Cover right column (Amount paid, Date paid, Payment method, Summary) ---
  // From x=250.5 (stream 334) to ~580, y=672 down to ~604
  page.drawRectangle({ x: 248, y: 584, width: 290, height: 95, color: white });
  
  // Amount paid
  page.drawText('Amount paid', {
    x: 250.5, y: 668, size: 9, font: helveticaBold, color: darkText
  });
  page.drawText('$240.00', {
    x: 250.5, y: 654, size: 9, font: helvetica, color: grayText
  });
  
  // Date paid (right column)
  page.drawText('Date paid', {
    x: 250.5, y: 638, size: 9, font: helveticaBold, color: darkText
  });
  page.drawText('February 02, 2026', {
    x: 250.5, y: 624, size: 9, font: helvetica, color: grayText
  });
  
  // Payment method
  page.drawText('Payment method', {
    x: 250.5, y: 608, size: 9, font: helveticaBold, color: darkText
  });
  page.drawText('Visa - 4198', {
    x: 250.5, y: 594, size: 9, font: helvetica, color: grayText
  });

  // --- 4) Cover "$xxx paid on..." big text ---
  // Stream y=263, 18pt → page y≈564.75
  page.drawRectangle({ x: 28, y: 555, width: 400, height: 18, color: white });
  page.drawText('$240.00 paid on February 02, 2026', {
    x: 30, y: 559, size: 13.5, font: helveticaBold, color: black
  });

  // --- 5) Cover table rows ---
  // Table headers at y≈528 (10pt) - covering "Description", "Qty", "Unit price", "Amount"
  // These labels should stay the same, but let me cover and redraw to match user's data
  page.drawRectangle({ x: 28, y: 518, width: 555, height: 16, color: white });
  
  page.drawText('Description', {
    x: 30, y: 523, size: 7.5, font: helvetica, color: lightGray
  });
  page.drawText('Qty', {
    x: 442, y: 523, size: 7.5, font: helvetica, color: lightGray
  });
  page.drawText('Unit price', {
    x: 485, y: 523, size: 7.5, font: helvetica, color: lightGray
  });
  page.drawText('Amount', {
    x: 551, y: 523, size: 7.5, font: helvetica, color: lightGray
  });

  // Horizontal line (table header separator)
  page.drawRectangle({ x: 30, y: 517, width: 552, height: 0.75, color: lineColor });

  // Table row: "Pro" and date range
  // stream y=341 → page 506.25 (Pro name), y=359 → 492.75 (date range)
  page.drawRectangle({ x: 28, y: 484, width: 555, height: 34, color: white });
  
  page.drawText('Pro', {
    x: 30, y: 503, size: 9, font: helvetica, color: darkText
  });
  page.drawText('Feb 02, 2026  – Jan 03, 2027', {
    x: 30, y: 491, size: 8, font: helvetica, color: lightGray
  });
  page.drawText('1', {
    x: 452, y: 503, size: 9, font: helvetica, color: darkText
  });
  page.drawText('$20.00', {
    x: 485, y: 503, size: 9, font: helvetica, color: darkText
  });
  page.drawText('$240.00', {
    x: 549, y: 503, size: 9, font: helvetica, color: darkText
  });

  // --- 6) Cover summary section ---
  // Separator at y=479.25
  // Subtotal at y=463.5, Total at y=449.25, Amount paid at y=435
  page.drawRectangle({ x: 28, y: 425, width: 555, height: 58, color: white });
  
  // Separator line
  page.drawRectangle({ x: 306, y: 479.25, width: 276, height: 0.75, color: lineColor });
  
  // Subtotal
  page.drawText('Subtotal', {
    x: 306, y: 462, size: 9, font: helvetica, color: grayText
  });
  page.drawText('$240.00', {
    x: 549, y: 462, size: 9, font: helvetica, color: grayText
  });
  
  // Separator
  page.drawRectangle({ x: 306, y: 455, width: 276, height: 0.75, color: lineColor });
  
  // Total
  page.drawText('Total', {
    x: 306, y: 446, size: 9, font: helveticaBold, color: darkText
  });
  page.drawText('$240.00', {
    x: 549, y: 446, size: 9, font: helveticaBold, color: darkText
  });
  
  // Separator
  page.drawRectangle({ x: 306, y: 439, width: 276, height: 0.75, color: lineColor });
  
  // Amount paid
  page.drawText('Amount paid', {
    x: 306, y: 430, size: 9, font: helveticaBold, color: darkText
  });
  page.drawText('$240.00', {
    x: 549, y: 430, size: 9, font: helveticaBold, color: darkText
  });

  // --- 7) Cover "Payment details" section ---
  // stream y=489 (18pt) → page y≈395.25
  page.drawRectangle({ x: 28, y: 386, width: 400, height: 18, color: white });
  page.drawText('Payment details', {
    x: 30, y: 390, size: 13.5, font: helveticaBold, color: black
  });

  // --- 8) Cover payment method details row ---
  // stream y=537 (10pt) → page y≈359.25
  // Headers: "Payment method", "Date", "Amount paid", "Receipt number"
  page.drawRectangle({ x: 28, y: 349, width: 555, height: 16, color: white });
  
  page.drawText('Payment method', {
    x: 30, y: 354, size: 7.5, font: helvetica, color: lightGray
  });
  page.drawText('Date', {
    x: 315, y: 354, size: 7.5, font: helvetica, color: lightGray
  });
  page.drawText('Amount paid', {
    x: 415, y: 354, size: 7.5, font: helvetica, color: lightGray
  });
  page.drawText('Receipt number', {
    x: 525, y: 354, size: 7.5, font: helvetica, color: lightGray
  });

  // Separator
  page.drawRectangle({ x: 30, y: 348, width: 552, height: 0.75, color: lineColor });

  // --- 9) Cover payment detail values ---
  // stream y=566 → page y≈337.5
  page.drawRectangle({ x: 28, y: 327, width: 555, height: 20, color: white });
  
  page.drawText('Visa - 4198', {
    x: 30, y: 333, size: 9, font: helvetica, color: darkText
  });
  page.drawText('February 02, 2026', {
    x: 315, y: 333, size: 9, font: helvetica, color: darkText
  });
  page.drawText('$240.00', {
    x: 415, y: 333, size: 9, font: helvetica, color: darkText
  });
  page.drawText('2955-4198', {
    x: 535, y: 333, size: 9, font: helvetica, color: darkText
  });

  // Save
  const outputPath = 'c:\\Users\\kason\\Downloads\\Receipt-2955-4198-modified.pdf';
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('Modified PDF saved to:', outputPath);
  console.log('File size:', pdfBytes.length, 'bytes');
}

main().catch(console.error);
