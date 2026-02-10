import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants'

/**
 * ============================================================================
 * NEXUS UNIKIN - Middleware de Protection des Routes
 * ============================================================================
 * 
 * Protection centralisée de toutes les routes protégées.
 * Vérifie la présence du cookie de session JWT.
 * La validation complète du JWT se fait dans les layouts serveur.
 */

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/logout',
]

// Préfixes de routes publiques
const PUBLIC_PREFIXES = [
  '/_next',
  '/favicon',
  '/images',
  '/api/auth/',
]

// Mapping des rôles vers les espaces autorisés
const ROLE_ROUTES: Record<string, string[]> = {
  'SUPER_ADMIN': ['/admin'],
  'ADMIN': ['/admin'],
  'TEACHER': ['/teacher'],
  'STUDENT': ['/student'],
  'EMPLOYEE': ['/employee'],
}

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Laisser passer les routes publiques et les assets statiques
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Vérifier la présence du cookie de session
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)

  // Gérer la page d'accueil - rediriger vers login ou dashboard
  if (pathname === '/') {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    // Utilisateur connecté - rediriger vers son dashboard
    try {
      const payloadBase64 = sessionToken.value.split('.')[1]
      if (payloadBase64) {
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())
        const allowedRoutes = ROLE_ROUTES[payload.role] || []
        const correctSpace = allowedRoutes[0]
        if (correctSpace) {
          return NextResponse.redirect(new URL(`${correctSpace}/dashboard`, request.url))
        }
      }
    } catch {
      // Token invalide, rediriger vers login
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (!sessionToken) {
    // Rediriger vers la page de login pour les pages
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Retourner 401 pour les API
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Décoder le payload JWT (sans vérifier la signature ici — 
  // la vérification complète se fait côté serveur dans les layouts/API)
  // On extrait juste le rôle pour le routing
  try {
    const payloadBase64 = sessionToken.value.split('.')[1]
    if (!payloadBase64) throw new Error('Invalid token')
    
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())
    const userRole = payload.role

    // Vérifier l'accès par rôle pour les espaces protégés
    const protectedSpaces = ['/admin', '/teacher', '/student', '/employee']
    const matchedSpace = protectedSpaces.find(space => pathname.startsWith(space))

    if (matchedSpace && userRole) {
      const allowedRoutes = ROLE_ROUTES[userRole] || []
      if (!allowedRoutes.includes(matchedSpace)) {
        // Rediriger vers l'espace approprié
        const correctSpace = allowedRoutes[0]
        if (correctSpace) {
          return NextResponse.redirect(new URL(`${correctSpace}/dashboard`, request.url))
        }
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }
  } catch {
    // Token malformé — laisser le layout serveur gérer l'erreur
  }

  // Ajouter des headers de sécurité
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/).*)',
  ],
}
