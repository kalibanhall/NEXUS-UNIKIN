const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const htmlPath = path.resolve(__dirname, 'receipt-template.html');
  const htmlUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  
  await page.goto(htmlUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for Google Fonts to load
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));
  
  const outputPath = 'c:\\Users\\kason\\Downloads\\Receipt-2955-4198-modified.pdf';
  
  await page.pdf({
    path: outputPath,
    width: '612px',
    height: '792px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });
  
  await browser.close();
  
  const stats = fs.statSync(outputPath);
  console.log('PDF saved to:', outputPath);
  console.log('Size:', stats.size, 'bytes');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
