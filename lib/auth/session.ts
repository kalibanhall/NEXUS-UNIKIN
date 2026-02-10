/**
 * ============================================================================
 * NEXUS UNIKIN - Server-side Session Helper
 * ============================================================================
 * 
 * Fonction helper pour récupérer la session JWT dans les API routes
 * et les composants serveur. Remplace getServerSession de next-auth.
 */

import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE_NAME, SessionPayload } from './jwt'

/**
 * Récupère et vérifie la session depuis les cookies.
 * À utiliser dans les API routes et les Server Components.
 * 
 * @returns La session décodée ou null si non authentifié
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie) {
      return null
    }

    return verifySession(sessionCookie.value)
  } catch {
    return null
  }
}

/**
 * Récupère la session et vérifie que l'utilisateur a le rôle requis.
 * 
 * @param allowedRoles - Liste des rôles autorisés
 * @returns La session ou null si le rôle n'est pas autorisé
 */
export async function getSessionWithRole(allowedRoles: string[]): Promise<SessionPayload | null> {
  const session = await getSession()
  
  if (!session) return null
  if (!allowedRoles.includes(session.role)) return null
  
  return session
}
