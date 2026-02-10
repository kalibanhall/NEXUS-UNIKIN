// ============================================================
// NEXUS UNIKIN - Configuration PostgreSQL
// Connexion directe sans données mockées
// ============================================================

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Configuration de la connexion depuis les variables d'environnement
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nexus_unikin',
  user: process.env.DB_USER || 'nexus_admin',
  password: process.env.DB_PASSWORD || 'NexusUnikin2026!',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Pool de connexions PostgreSQL
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL, 
        max: 20, 
        idleTimeoutMillis: 30000, 
        connectionTimeoutMillis: 10000 
      }
    : connectionConfig
);

// Gestion des erreurs de pool
pool.on('error', (err) => {
  console.error('💥 [NEXUS DB] Erreur inattendue du pool PostgreSQL:', err);
});

// Fonction de requête principale
export async function query<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [NEXUS DB] Query:', { 
        text: text.substring(0, 100), 
        duration: `${duration}ms`, 
        rows: result.rowCount 
      });
    }
    return result;
  } catch (error: any) {
    console.error('💥 [NEXUS DB] Erreur de requête:', {
      query: text.substring(0, 200),
      error: error.message,
      code: error.code
    });
    throw error;
  }
}

// Obtenir un client pour les transactions
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

// Exécuter une transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Helper pour récupérer un seul enregistrement
export async function queryOne<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

// Helper pour récupérer plusieurs enregistrements
export async function queryMany<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

// Exécuter plusieurs requêtes en une transaction
export async function queryBatch(queries: { text: string; params?: any[] }[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const q of queries) {
      await client.query(q.text, q.params);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Vérifier la connexion à la base de données
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ [NEXUS DB] Connexion vérifiée:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('💥 [NEXUS DB] Échec de connexion:', error);
    return false;
  }
}

// Fermer le pool (utile pour les tests et le shutdown)
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('🔌 [NEXUS DB] Pool de connexions fermé');
}

// Export du pool pour cas spéciaux
export { pool };
