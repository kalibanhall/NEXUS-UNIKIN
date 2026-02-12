'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle, UserCheck, KeyRound, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { UnikinLogo } from '@/components/ui/unikin-logo'

type Step = 'matricule' | 'confirm' | 'password' | 'success'

export default function ActivatePage() {
  const [step, setStep] = useState<Step>('matricule')
  const [matricule, setMatricule] = useState('')
  const [maskedName, setMaskedName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activatedEmail, setActivatedEmail] = useState('')
  const [activatedName, setActivatedName] = useState('')

  // Étape 1: Vérifier le matricule
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matricule.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule: matricule.trim(), step: 'verify' }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          // Compte déjà activé
          toast.info(data.error)
          setActivatedEmail(data.email || '')
          setStep('success')
          return
        }
        throw new Error(data.error)
      }

      setMaskedName(data.maskedName)
      setStep('confirm')
      toast.success('Matricule trouvé!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Étape 2: Confirmer identité et aller au mot de passe
  const handleConfirm = () => {
    setStep('password')
  }

  // Étape 3: Créer le mot de passe
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule: matricule.trim(), step: 'activate', password, confirmPassword }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setActivatedEmail(data.email)
      setActivatedName(data.fullName)
      setStep('success')
      toast.success('Compte activé avec succès!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Vérifier la force du mot de passe
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const allChecks = Object.values(passwordChecks).every(Boolean)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <UnikinLogo size={56} />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">NEXUS UNIKIN</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Université de Kinshasa</p>
            </div>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { key: 'matricule', label: 'Matricule', icon: UserCheck },
            { key: 'password', label: 'Mot de passe', icon: KeyRound },
            { key: 'success', label: 'Terminé', icon: CheckCircle },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step === s.key || (step === 'confirm' && s.key === 'matricule')
                  ? 'bg-blue-600 text-white'
                  : step === 'success' || (step === 'password' && s.key === 'matricule')
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
              }`}>
                {step === 'success' || (step === 'password' && s.key === 'matricule') ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${
                (step === 'password' && i === 0) || step === 'success'
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`} />}
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-0">
          {/* ÉTAPE 1: Saisir le matricule */}
          {step === 'matricule' && (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Activer mon compte</CardTitle>
                <CardDescription className="text-center">
                  Entrez votre numéro matricule pour activer votre compte étudiant
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleVerify}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricule">Numéro Matricule</Label>
                    <Input
                      id="matricule"
                      type="text"
                      placeholder="Ex: 236-308-453 ou 2103086"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      required
                      disabled={isLoading}
                      className="text-lg tracking-wider font-mono"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full gradient-primary hover:opacity-90" disabled={isLoading || !matricule.trim()}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recherche...</> : <>Vérifier mon matricule <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                  <Link href="/auth/login" className="text-sm text-blue-600 hover:underline text-center">
                    J&apos;ai déjà un compte activé
                  </Link>
                </CardFooter>
              </form>
            </>
          )}

          {/* ÉTAPE 2: Confirmer l'identité */}
          {step === 'confirm' && (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Confirmer votre identité</CardTitle>
                <CardDescription className="text-center">
                  Vérifiez que ces informations vous correspondent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Matricule</p>
                  <p className="font-mono text-lg font-semibold">{matricule.toUpperCase()}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nom de l&apos;étudiant</p>
                  <p className="text-lg font-semibold">{maskedName}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button onClick={handleConfirm} className="w-full gradient-primary hover:opacity-90">
                  C&apos;est bien moi <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => { setStep('matricule'); setMatricule(''); }} className="w-full">
                  Ce n&apos;est pas moi
                </Button>
              </CardFooter>
            </>
          )}

          {/* ÉTAPE 3: Créer le mot de passe */}
          {step === 'password' && (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Créer votre mot de passe</CardTitle>
                <CardDescription className="text-center">
                  Choisissez un mot de passe sécurisé pour votre compte
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleActivate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
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
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  {/* Password strength indicators */}
                  <div className="space-y-1.5 text-sm">
                    {[
                      { check: passwordChecks.length, label: 'Au moins 8 caractères' },
                      { check: passwordChecks.uppercase, label: 'Une lettre majuscule' },
                      { check: passwordChecks.lowercase, label: 'Une lettre minuscule' },
                      { check: passwordChecks.number, label: 'Un chiffre' },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center gap-2 ${item.check ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className={`h-3.5 w-3.5 ${item.check ? 'text-green-500' : 'text-gray-300'}`} />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-500">Les mots de passe ne correspondent pas</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full gradient-primary hover:opacity-90"
                    disabled={isLoading || !allChecks || password !== confirmPassword}
                  >
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Activation...</> : <>Activer mon compte <CheckCircle className="ml-2 h-4 w-4" /></>}
                  </Button>
                </CardFooter>
              </form>
            </>
          )}

          {/* ÉTAPE 4: Succès */}
          {step === 'success' && (
            <>
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center text-green-700 dark:text-green-400">Compte activé!</CardTitle>
                <CardDescription className="text-center">
                  {activatedName ? `Bienvenue ${activatedName}!` : 'Votre compte est prêt.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-500">Votre email de connexion</p>
                  <p className="font-mono text-sm font-semibold text-blue-600">{activatedEmail}</p>
                </div>
                <p className="text-sm text-center text-gray-500">
                  Utilisez cet email et le mot de passe que vous venez de créer pour vous connecter.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full gradient-primary hover:opacity-90">
                    Se connecter maintenant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </>
          )}
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 NEXUS UNIKIN - Université de Kinshasa
        </p>
      </div>
    </div>
  )
}
