const XLSX = require('xlsx');
const wb = XLSX.readFile('c:\\Users\\kason\\Downloads\\tickets\\COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx');

wb.SheetNames.forEach(name => {
  console.log('\n' + '='.repeat(80));
  console.log('SHEET:', name);
  console.log('='.repeat(80));
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  // Print first 15 rows
  const maxRows = Math.min(data.length, 15);
  for (let i = 0; i < maxRows; i++) {
    console.log(`Row ${i}: ${JSON.stringify(data[i])}`);
  }
  if (data.length > 15) {
    console.log(`... (${data.length - 15} more rows)`);
  }
});
