'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { UnikinLogo, UnikinLogoSimple } from '@/components/ui/unikin-logo'

// Composant pour les logos flottants en filigrane
function FloatingLogos() {
  const [logos, setLogos] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    duration: number
    delay: number
    opacity: number
  }>>([])

  useEffect(() => {
    // Générer des logos aléatoires
    const generateLogos = () => {
      const newLogos = []
      for (let i = 0; i < 15; i++) {
        newLogos.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 30 + Math.random() * 50,
          duration: 15 + Math.random() * 20,
          delay: Math.random() * 10,
          opacity: 0.03 + Math.random() * 0.05,
        })
      }
      setLogos(newLogos)
    }
    generateLogos()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="absolute animate-float text-blue-900/20 dark:text-blue-300/10"
          style={{
            left: `${logo.x}%`,
            top: `${logo.y}%`,
            opacity: logo.opacity,
            animation: `float ${logo.duration}s ease-in-out infinite`,
            animationDelay: `${logo.delay}s`,
          }}
        >
          <UnikinLogoSimple size={logo.size} />
        </div>
      ))}
      
      {/* Styles pour l'animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-20px) rotate(5deg) scale(1.05);
          }
          50% {
            transform: translateY(-10px) rotate(-3deg) scale(0.95);
          }
          75% {
            transform: translateY(-25px) rotate(3deg) scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      toast.success('Connexion réussie!')

      // Redirection selon le rôle
      switch (data.user.role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          router.push('/admin/dashboard')
          break
        case 'TEACHER':
          router.push('/teacher/dashboard')
          break
        case 'EMPLOYEE':
          router.push('/employee/dashboard')
          break
        case 'STUDENT':
          router.push('/student/dashboard')
          break
        default:
          router.push('/')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Connexion rapide pour démo
  const quickLogin = async (role: string) => {
    const credentials: Record<string, { email: string; password: string }> = {
      admin: { email: 'ADM-2024-001@unikin.ac.cd', password: 'Admin@2026' },
      teacher: { email: 'PROF-2020-001@unikin.ac.cd', password: 'Prof@2026' },
      student: { email: 'ETU-2025-001@unikin.ac.cd', password: 'Etudiant@2026' },
      employee: { email: 'EMP-2022-001@unikin.ac.cd', password: 'Employe@2026' },
    }

    const cred = credentials[role]
    if (cred) {
      setEmail(cred.email)
      setPassword(cred.password)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4 relative overflow-hidden">
      {/* Logos flottants en filigrane */}
      <FloatingLogos />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-4">
            <UnikinLogo size={70} />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                NEXUS UNIKIN
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Université de Kinshasa
              </p>
            </div>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre espace
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email institutionnel</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@unikin.ac.cd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-600">Se souvenir</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              {/* Quick login for demo */}
              <div className="w-full pt-4 border-t">
                <p className="text-xs text-gray-500 text-center mb-3">
                  Accès rapide (Démo)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => quickLogin('admin')}
                  >
                    🛠️ Admin
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => quickLogin('teacher')}
                  >
                    👨🏽‍🏫 Enseignant
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => quickLogin('student')}
                  >
                    🎓 Étudiant
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => quickLogin('employee')}
                  >
                    👩🏽‍💼 Employé
                  </Button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 NEXUS UNIKIN - Université de Kinshasa
        </p>
      </div>
    </div>
  )
}
