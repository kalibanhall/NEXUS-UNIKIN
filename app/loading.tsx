import { GraduationCap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6 animate-pulse">
        <GraduationCap className="w-8 h-8 text-white" />
      </div>
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Chargement...
        </p>
      </div>
    </div>
  )
}
