/**
 * ============================================================================
 * NEXUS UNIKIN - JWT Authentication Module
 * ============================================================================
 * 
 * Gestion sécurisée des tokens JWT pour l'authentification.
 * Remplace le stockage JSON brut dans les cookies.
 */

import jwt from 'jsonwebtoken'

// Réexporter les constantes pour compatibilité
export { SESSION_COOKIE_NAME } from './constants'

// Clé secrète pour signer les JWT — DOIT être définie en production
function getSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET ou NEXTAUTH_SECRET doit être défini dans les variables d\'environnement')
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET doit faire au moins 32 caractères en production')
  }
  return secret
}

const TOKEN_EXPIRY = '7d' // 7 jours

export interface SessionPayload {
  userId: number
  email: string
  role: string
  firstName: string
  lastName: string
  profile: any
}

/**
 * Crée un token JWT signé contenant les données de session
 */
export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), {
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256',
    issuer: 'nexus-unikin',
    audience: 'nexus-unikin-app',
  })
}

/**
 * Vérifie et décode un token JWT
 * Retourne null si le token est invalide ou expiré
 */
export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret(), {
      algorithms: ['HS256'],
      issuer: 'nexus-unikin',
      audience: 'nexus-unikin-app',
    }) as SessionPayload & jwt.JwtPayload
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      profile: decoded.profile,
    }
  } catch (error) {
    return null
  }
}

/**
 * Options du cookie de session pour la production
 */
export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  const hasHttps = process.env.HTTPS === 'true' || process.env.NEXT_PUBLIC_HTTPS === 'true'
  
  return {
    httpOnly: true,
    secure: isProduction && hasHttps, // Only secure if HTTPS is configured
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  }
}
