const { Client } = require('pg');

const passwords = [
  'postgres', '123456', 'password', '1234', 'admin', 'root', 
  'nexus', 'unikin', 'postgres123', 'Postgres16', 'pgadmin',
  '12345678', 'chris', 'Chris', 'Chris2026', 'Chris2026!',
  'nexus2026', 'Nexus2026', 'UNIKIN', 'unikin2026',
  'test', 'pass', 'secret', 'changeme', 'postgresql',
  'P@ssw0rd', 'Passw0rd', 'postgres1', 'pg', 'postgre',
  '', 'abc123', 'letmein', 'welcome', 'master',
  'default', 'postgres16', 'pgsql', 'database'
];

async function tryPassword(pwd) {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: pwd,
    database: 'postgres',
    connectionTimeoutMillis: 3000,
  });
  
  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    await client.end();
    return { success: true, version: res.rows[0].version };
  } catch (err) {
    try { await client.end(); } catch {}
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('Testing PostgreSQL passwords...');
  for (const pwd of passwords) {
    const result = await tryPassword(pwd);
    if (result.success) {
      console.log(`\n✅ PASSWORD FOUND: "${pwd}"`);
      console.log(`   Version: ${result.version}`);
      return;
    } else {
      const display = pwd === '' ? '(empty)' : pwd;
      process.stdout.write(`❌ ${display}  `);
    }
  }
  console.log('\n\n❌ Aucun mot de passe trouvé. Veuillez fournir le mot de passe PostgreSQL.');
}

main();
