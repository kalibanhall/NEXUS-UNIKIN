const XLSX = require('xlsx');
const wb = XLSX.readFile('c:\\Users\\kason\\Downloads\\tickets\\COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx');

// Full Cours PharmD
console.log('\n=== COURS PharmD (ALL) ===');
const coursWs = wb.Sheets['Cours PharmD'];
const coursData = XLSX.utils.sheet_to_json(coursWs, { header: 1, defval: '' });
coursData.forEach((row, i) => {
  // Only print rows with actual data (code starts with PHAR)
  if (row[1] && String(row[1]).startsWith('PHAR')) {
    console.log(JSON.stringify({ code: row[1], name: row[2], theory: row[3], practical: row[4], seminar: row[5], total: row[6], credit: row[7], semester: row[8] }));
  } else if (row[1] && (String(row[1]).startsWith('B') || String(row[1]).startsWith('P'))) {
    console.log('\n--- PROMOTION: ' + row[1] + ' ---');
  }
});

// Full Enseignants
console.log('\n\n=== ENSEIGNANTS (ALL) ===');
const ensWs = wb.Sheets['Enseignants'];
const ensData = XLSX.utils.sheet_to_json(ensWs, { header: 1, defval: '' });
ensData.forEach((row, i) => {
  if (i === 0) return; // skip header
  if (row[1] && row[1] !== '') {
    console.log(JSON.stringify({ 
      num: row[0], name: row[1], matUnikin: row[2], matESU: row[3], 
      grade: row[4], email: row[5], dept: row[6], promo: row[7], cours: row[8]
    }));
  }
});

// Critères
console.log('\n\n=== CRITERES DELIBERATION ===');
const critWs = wb.Sheets['CRITÈRES DÉLIBÉRATION'];
const critData = XLSX.utils.sheet_to_json(critWs, { header: 1, defval: '' });
critData.forEach((row, i) => {
  if (row[0] && row[0] !== '') console.log(JSON.stringify(row));
});
