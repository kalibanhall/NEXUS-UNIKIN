'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, KeyRound, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { UnikinLogo } from '@/components/ui/unikin-logo'

export default function ForgotPasswordPage() {
  const [matricule, setMatricule] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!matricule && !phone) {
      toast.error('Veuillez saisir votre matricule ou votre numéro de téléphone')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule: matricule.trim() || undefined, phone: phone.trim() || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la demande')
      }

      setSubmitted(true)
      toast.success('Demande envoyée avec succès')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <UnikinLogo size={56} />
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
          {!submitted ? (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <KeyRound className="h-6 w-6" />
                  Mot de passe oublié
                </CardTitle>
                <CardDescription className="text-center">
                  Entrez votre matricule ou numéro de téléphone pour demander une réinitialisation
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricule">Matricule</Label>
                    <Input
                      id="matricule"
                      type="text"
                      placeholder="Ex: 2201773"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-950 px-2 text-gray-500">ou</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Ex: +243 999 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    Un administrateur traitera votre demande et vous communiquera un nouveau mot de passe temporaire.
                  </p>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full gradient-primary hover:opacity-90"
                    disabled={isLoading || (!matricule && !phone)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer la demande'
                    )}
                  </Button>

                  <Link href="/auth/login" className="w-full">
                    <Button variant="ghost" className="w-full" type="button">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour à la connexion
                    </Button>
                  </Link>
                </CardFooter>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Demande envoyée</CardTitle>
                <CardDescription>
                  Votre demande de réinitialisation a été enregistrée avec succès.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Prochaines étapes :</strong>
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                    <li>• Un administrateur va traiter votre demande</li>
                    <li>• Un mot de passe temporaire vous sera communiqué</li>
                    <li>• Vous devrez le changer à votre prochaine connexion</li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la connexion
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
