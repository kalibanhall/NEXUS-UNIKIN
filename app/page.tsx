import Link from 'next/link'
import { GraduationCap, Users, BookOpen, Shield, ArrowRight, CheckCircle2, Calendar, BarChart3, UserCheck, FileText, Wallet, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UnikinLogo } from '@/components/ui/unikin-logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UnikinLogo size={48} />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                NEXUS UNIKIN
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Université de Kinshasa
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#spaces" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Espaces
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Contact
            </Link>
          </nav>

          <Link href="/auth/login">
            <Button className="gradient-primary hover:opacity-90">
              Se connecter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Système actif - Année académique 2025-2026
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-heading animate-fade-in">
            Le cœur numérique de
            <span className="block gradient-primary bg-clip-text text-transparent">
              l'Université de Kinshasa
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 animate-fade-in">
            NEXUS UNIKIN centralise la gestion académique, administrative et financière 
            pour une expérience universitaire moderne et efficace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link href="/auth/login">
              <Button size="lg" className="gradient-primary hover:opacity-90 text-lg px-8">
                Accéder à mon espace
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Découvrir les fonctionnalités
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { value: '30,000+', label: 'Étudiants' },
              { value: '2,000+', label: 'Enseignants' },
              { value: '12', label: 'Facultés' },
              { value: '100+', label: 'Départements' },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl glass card-hover">
                <div className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spaces Section */}
      <section id="spaces" className="py-20 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              Quatre espaces dédiés
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Chaque utilisateur accède à un espace personnalisé selon son rôle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Espace Étudiant',
                color: 'from-blue-500 to-blue-700',
                features: ['Consultation des notes', 'Emploi du temps', 'Inscription aux cours', 'Documents officiels'],
              },
              {
                icon: BookOpen,
                title: 'Espace Enseignant',
                color: 'from-green-500 to-green-700',
                features: ['Gestion des cours', 'Encodage des notes', 'Présences étudiants', 'Support pédagogique'],
              },
              {
                icon: Users,
                title: 'Espace Employé',
                color: 'from-purple-500 to-purple-700',
                features: ['Gestion administrative', 'Dossiers étudiants', 'Suivi présence', 'Documents internes'],
              },
              {
                icon: Shield,
                title: 'Espace Admin',
                color: 'from-orange-500 to-orange-700',
                features: ['Configuration système', 'Gestion utilisateurs', 'Statistiques', 'Délibérations'],
              },
            ].map((space, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg card-hover">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${space.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <space.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {space.title}
                </h4>
                <ul className="space-y-2">
                  {space.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              Fonctionnalités avancées
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Un système complet pour répondre à tous les besoins de la communauté universitaire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Emploi du temps interactif',
                description: 'Visualisez votre planning avec tous les détails : salle, professeur, horaires. Synchronisez avec votre calendrier.',
                icon: Calendar,
              },
              {
                title: 'Système de délibération',
                description: 'Délibérations automatisées par département avec calcul des moyennes et attribution des mentions.',
                icon: BarChart3,
              },
              {
                title: 'Gestion des présences',
                description: 'Code de validation unique généré par le professeur. Suivi en temps réel des présences.',
                icon: UserCheck,
              },
              {
                title: 'Documents numériques',
                description: 'Générez attestations, relevés de notes et cartes étudiantes avec QR code de validation.',
                icon: FileText,
              },
              {
                title: 'Suivi financier',
                description: 'Consultez vos frais académiques, effectuez des paiements et téléchargez vos reçus.',
                icon: Wallet,
              },
              {
                title: 'Notifications temps réel',
                description: 'Restez informé des annonces, résultats et échéances importantes.',
                icon: Bell,
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg card-hover">
                <feature.icon className="w-10 h-10 mb-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="rounded-3xl gradient-primary p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4 font-heading">
              Prêt à commencer ?
            </h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Connectez-vous à votre espace personnel pour accéder à toutes les fonctionnalités de NEXUS UNIKIN.
            </p>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Se connecter maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <UnikinLogo size={40} />
                <span className="font-bold text-white font-heading">NEXUS UNIKIN</span>
              </div>
              <p className="text-sm">
                Le système de gestion universitaire intégré de l'Université de Kinshasa.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Liens rapides</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Se connecter</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#spaces" className="hover:text-white transition-colors">Espaces</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact IT</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Contact</h5>
              <ul className="space-y-2 text-sm">
                <li>Avenue de l'Université</li>
                <li>Kinshasa, RDC</li>
                <li>contact@unikin.ac.cd</li>
                <li>+243 99 999 9999</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 NEXUS UNIKIN - Université de Kinshasa. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
