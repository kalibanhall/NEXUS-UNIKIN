const { PDFDocument, PDFName, PDFDict, PDFArray } = require('pdf-lib');
const fs = require('fs');

async function main() {
  const data = fs.readFileSync('c:\\Users\\kason\\Downloads\\Receipt-2955-4198.pdf');
  const pdfDoc = await PDFDocument.load(data);
  const page = pdfDoc.getPage(0);
  const node = page.node;
  
  // Get Resources
  const resources = node.get(PDFName.of('Resources'));
  const resDict = pdfDoc.context.lookup(resources);
  
  // Get XObject (images)
  const xobject = resDict.get(PDFName.of('XObject'));
  if (xobject) {
    const xobjDict = pdfDoc.context.lookup(xobject);
    console.log('XObject keys:');
    const entries = xobjDict.entries();
    for (const [key, value] of entries) {
      const obj = pdfDoc.context.lookup(value);
      console.log(`  ${key.toString()}: type=${obj.constructor.name}`);
      if (obj.dict) {
        const subtype = obj.dict.get(PDFName.of('Subtype'));
        const width = obj.dict.get(PDFName.of('Width'));
        const height = obj.dict.get(PDFName.of('Height'));
        const colorSpace = obj.dict.get(PDFName.of('ColorSpace'));
        const bitsPerComponent = obj.dict.get(PDFName.of('BitsPerComponent'));
        const filter = obj.dict.get(PDFName.of('Filter'));
        console.log(`    Subtype: ${subtype}`);
        console.log(`    Size: ${width}x${height}`);
        console.log(`    ColorSpace: ${colorSpace}`);
        console.log(`    BitsPerComponent: ${bitsPerComponent}`);
        console.log(`    Filter: ${filter}`);
        
        // Check for SMask (alpha channel)
        const smask = obj.dict.get(PDFName.of('SMask'));
        if (smask) console.log(`    Has SMask (transparency)`);
      }
    }
  }
  
  // Get Fonts
  const fonts = resDict.get(PDFName.of('Font'));
  if (fonts) {
    const fontDict = pdfDoc.context.lookup(fonts);
    console.log('\nFont keys:');
    const entries = fontDict.entries();
    for (const [key, value] of entries) {
      const obj = pdfDoc.context.lookup(value);
      const baseFont = obj.get(PDFName.of('BaseFont'));
      const subtype = obj.get(PDFName.of('Subtype'));
      console.log(`  ${key.toString()}: BaseFont=${baseFont}, Subtype=${subtype}`);
    }
  }

  // Get graphics states
  const extGState = resDict.get(PDFName.of('ExtGState'));
  if (extGState) {
    const gsDict = pdfDoc.context.lookup(extGState);
    console.log('\nGraphics States:');
    const entries = gsDict.entries();
    for (const [key, value] of entries) {
      const obj = pdfDoc.context.lookup(value);
      console.log(`  ${key.toString()}:`, obj.toString().substring(0, 100));
    }
  }
}

main().catch(console.error);
