import Link from 'next/link'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-red-100 dark:from-slate-950 dark:via-orange-950 dark:to-red-950 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Accès refusé
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Connexion
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
