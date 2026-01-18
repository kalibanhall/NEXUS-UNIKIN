/**
 * ============================================================================
 * NEXUS UNIKIN - Module de connexion à la base de données PostgreSQL
 * ============================================================================
 * 
 * @description Ce module gère toutes les interactions avec la base de données
 *              PostgreSQL. Il fournit un pool de connexions réutilisables et
 *              des fonctions utilitaires pour exécuter des requêtes SQL.
 * 
 * @author Chris NGOZULU KASONGO
 * @email kasongongozulu@hmail.com
 * @version 1.0.0
 * @license Proprietary - UNIKIN
 * 
 * ============================================================================
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Pool de connexions PostgreSQL
 * 
 * Configuration du pool avec les paramètres suivants:
 * - connectionString: URL de connexion depuis les variables d'environnement
 * - ssl: Activé uniquement en production pour la sécurité
 * - max: Nombre maximum de connexions simultanées (20)
 * - idleTimeoutMillis: Temps avant fermeture d'une connexion inactive (30s)
 * - connectionTimeoutMillis: Délai d'attente pour une nouvelle connexion (2s)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Exécute une requête SQL sur la base de données
 * 
 * @template T - Type des lignes retournées (doit étendre QueryResultRow)
 * @param {string} text - La requête SQL à exécuter
 * @param {any[]} params - Les paramètres de la requête (pour éviter les injections SQL)
 * @returns {Promise<QueryResult<T>>} - Le résultat de la requête
 * 
 * @example
 * // Récupérer tous les étudiants actifs
 * const result = await query<Student>('SELECT * FROM students WHERE status = $1', ['ACTIVE']);
 */
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  // Enregistrement du temps de début pour mesurer la performance
  const start = Date.now();
  try {
    // Exécution de la requête via le pool de connexions
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log des requêtes en mode développement pour le débogage
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    // Log de l'erreur pour faciliter le débogage
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Obtient un client de connexion dédié pour les opérations complexes
 * 
 * @description Utilisé principalement pour les transactions qui nécessitent
 *              plusieurs requêtes consécutives sur la même connexion.
 * 
 * @returns {Promise<PoolClient>} - Un client de connexion du pool
 * 
 * @warning N'oubliez pas d'appeler client.release() après utilisation!
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

/**
 * Exécute une série d'opérations dans une transaction
 * 
 * @description Les transactions garantissent que toutes les opérations réussissent
 *              ou aucune n'est appliquée (principe ACID). En cas d'erreur,
 *              un ROLLBACK annule toutes les modifications.
 * 
 * @template T - Type de la valeur retournée par le callback
 * @param {Function} callback - Fonction contenant les opérations à exécuter
 * @returns {Promise<T>} - Le résultat du callback
 * 
 * @example
 * // Créer un utilisateur et son profil étudiant en une seule transaction
 * await transaction(async (client) => {
 *   const user = await client.query('INSERT INTO users ...');
 *   await client.query('INSERT INTO students ...');
 *   return user;
 * });
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  // Obtenir un client dédié pour la transaction
  const client = await pool.connect();
  try {
    // Démarrer la transaction
    await client.query('BEGIN');
    // Exécuter les opérations du callback
    const result = await callback(client);
    // Valider toutes les modifications si tout s'est bien passé
    await client.query('COMMIT');
    return result;
  } catch (error) {
    // Annuler toutes les modifications en cas d'erreur
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Toujours libérer le client pour le rendre disponible au pool
    client.release();
  }
}

/**
 * Récupère un seul enregistrement de la base de données
 * 
 * @description Fonction utilitaire pour les requêtes qui doivent retourner
 *              exactement un enregistrement (ou null si non trouvé).
 * 
 * @template T - Type de l'enregistrement attendu
 * @param {string} text - La requête SQL
 * @param {any[]} params - Les paramètres de la requête
 * @returns {Promise<T | null>} - L'enregistrement ou null
 * 
 * @example
 * // Récupérer un étudiant par son matricule
 * const student = await queryOne<Student>('SELECT * FROM students WHERE matricule = $1', ['ETU001']);
 */
export async function queryOne<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await query<T>(text, params);
  // Retourner le premier enregistrement ou null si aucun résultat
  return result.rows[0] || null;
}

/**
 * Récupère plusieurs enregistrements de la base de données
 * 
 * @description Fonction utilitaire pour les requêtes qui retournent
 *              une liste d'enregistrements.
 * 
 * @template T - Type des enregistrements attendus
 * @param {string} text - La requête SQL
 * @param {any[]} params - Les paramètres de la requête
 * @returns {Promise<T[]>} - Tableau d'enregistrements (peut être vide)
 * 
 * @example
 * // Récupérer tous les cours d'une promotion
 * const courses = await queryMany<Course>('SELECT * FROM courses WHERE promotion_id = $1', [1]);
 */
export async function queryMany<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Ferme proprement le pool de connexions
 * 
 * @description À utiliser lors de l'arrêt de l'application ou dans les tests
 *              pour libérer toutes les ressources de connexion.
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

// Export du pool pour les cas nécessitant un accès direct
export { pool };
