/**
 * ============================================================================
 * NEXUS UNIKIN - Rate Limiting
 * ============================================================================
 * 
 * Protection contre les attaques par force brute.
 * Utilise un stockage en mémoire (adapté pour un seul serveur).
 * Pour du multi-serveur, remplacer par Redis.
 */

interface RateLimitEntry {
  count: number
  firstAttempt: number
  blockedUntil: number | null
}

const attempts = new Map<string, RateLimitEntry>()

// Configuration
const MAX_ATTEMPTS = 5          // Nombre max de tentatives
const WINDOW_MS = 15 * 60 * 1000  // Fenêtre de 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000  // Blocage de 15 minutes

/**
 * Vérifie si une IP/clé est rate-limitée
 * @returns { allowed: boolean, remainingAttempts: number, retryAfterMs: number }
 */
export function checkRateLimit(key: string): { 
  allowed: boolean
  remainingAttempts: number
  retryAfterMs: number 
} {
  const now = Date.now()
  const entry = attempts.get(key)

  // Pas d'entrée = premier essai
  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterMs: 0 }
  }

  // Vérifier si le blocage est toujours actif
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      retryAfterMs: entry.blockedUntil - now 
    }
  }

  // Si la fenêtre est expirée, réinitialiser
  if (now - entry.firstAttempt > WINDOW_MS) {
    attempts.delete(key)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterMs: 0 }
  }

  const remaining = MAX_ATTEMPTS - entry.count
  return { 
    allowed: remaining > 0, 
    remainingAttempts: Math.max(0, remaining), 
    retryAfterMs: remaining <= 0 ? (entry.blockedUntil || 0) - now : 0 
  }
}

/**
 * Enregistre une tentative échouée
 */
export function recordFailedAttempt(key: string): void {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || (now - entry.firstAttempt > WINDOW_MS)) {
    attempts.set(key, {
      count: 1,
      firstAttempt: now,
      blockedUntil: null,
    })
    return
  }

  entry.count++
  
  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS
  }

  attempts.set(key, entry)
}

/**
 * Réinitialise le compteur après un login réussi
 */
export function resetRateLimit(key: string): void {
  attempts.delete(key)
}

/**
 * Nettoyage périodique des entrées expirées (toutes les 5 minutes)
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    attempts.forEach((entry, key) => {
      if (now - entry.firstAttempt > WINDOW_MS && (!entry.blockedUntil || now > entry.blockedUntil)) {
        attempts.delete(key)
      }
    })
  }, 5 * 60 * 1000)
}
