'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar,
  CreditCard,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  ClipboardList,
  BarChart3,
  Shield,
  Clock,
  UserCheck,
  FolderOpen,
  MessageSquare,
  CheckCheck,
  Wallet,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UnikinLogo } from '@/components/ui/unikin-logo'
import { NotificationDropdown } from '@/components/ui/notification-dropdown'

// Types pour la configuration du menu
interface MenuItem {
  icon: LucideIcon
  label: string
  href: string
  badge?: string
  children?: { label: string; href: string }[]
}

interface MenuConfig {
  title: string
  color: string
  items: MenuItem[]
}

// Configuration des menus par rôle
const menuConfig: Record<'admin' | 'teacher' | 'student' | 'employee', MenuConfig> = {
  admin: {
    title: 'Administration',
    color: 'from-orange-500 to-red-600',
    items: [
      { icon: LayoutDashboard, label: 'Tableau de bord', href: '/admin/dashboard' },
      { icon: Users, label: 'Utilisateurs', href: '/admin/users', badge: 'Nouveau' },
      { icon: Building2, label: 'Structure académique', href: '/admin/academic', 
        children: [
          { label: 'Facultés', href: '/admin/academic/faculties' },
          { label: 'Départements', href: '/admin/academic/departments' },
          { label: 'Promotions', href: '/admin/academic/promotions' },
          { label: 'Années académiques', href: '/admin/academic/years' },
        ]
      },
      { icon: BookOpen, label: 'Cours & UE', href: '/admin/courses' },
      { icon: ClipboardList, label: 'Délibérations', href: '/admin/deliberation' },
      { icon: CreditCard, label: 'Finances', href: '/admin/finances' },
      { icon: BarChart3, label: 'Statistiques', href: '/admin/statistics' },
      { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      { icon: Bell, label: 'Annonces', href: '/admin/announcements' },
      { icon: FolderOpen, label: 'Bibliothèque', href: '/admin/library' },
      { icon: FileText, label: 'Documents', href: '/admin/documents' },
      { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
      { icon: CheckCheck, label: 'Sondages', href: '/admin/surveys' },
      { icon: BookOpen, label: 'Recherche', href: '/admin/research' },
      { icon: Wallet, label: 'Bourses', href: '/admin/scholarships' },
      { icon: Target, label: 'NEXUS Tracker', href: '/admin/tracker', badge: 'Projet',
        children: [
          { label: 'Dashboard', href: '/admin/tracker' },
          { label: 'Tâches', href: '/admin/tracker/tasks' },
          { label: 'Facultés', href: '/admin/tracker/faculties' },
        ]
      },
      { icon: Shield, label: 'Sécurité & Logs', href: '/admin/security' },
      { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
    ],
  },
  teacher: {
    title: 'Espace Enseignant',
    color: 'from-green-500 to-emerald-600',
    items: [
      { icon: LayoutDashboard, label: 'Tableau de bord', href: '/teacher/dashboard' },
      { icon: BookOpen, label: 'Mes cours', href: '/teacher/courses' },
      { icon: Users, label: 'Mes étudiants', href: '/teacher/students' },
      { icon: ClipboardList, label: 'Notes & Résultats', href: '/teacher/grades' },
      { icon: FileText, label: 'Évaluations', href: '/teacher/evaluations' },
      { icon: Calendar, label: 'Emploi du temps', href: '/teacher/timetable' },
      { icon: UserCheck, label: 'Présences', href: '/teacher/attendance' },
      { icon: FolderOpen, label: 'Ressources', href: '/teacher/resources' },
      { icon: MessageSquare, label: 'Messages', href: '/teacher/messages' },
      { icon: Settings, label: 'Paramètres', href: '/teacher/settings' },
    ],
  },
  student: {
    title: 'Espace Étudiant',
    color: 'from-blue-500 to-indigo-600',
    items: [
      { icon: LayoutDashboard, label: 'Tableau de bord', href: '/student/dashboard' },
      { icon: BookOpen, label: 'Mes cours', href: '/student/courses' },
      { icon: FileText, label: 'Évaluations', href: '/student/evaluations' },
      { icon: ClipboardList, label: 'Notes & Résultats', href: '/student/grades' },
      { icon: Calendar, label: 'Emploi du temps', href: '/student/timetable' },
      { icon: UserCheck, label: 'Présences', href: '/student/attendance' },
      { icon: Wallet, label: 'Finances', href: '/student/finances' },
      { icon: FolderOpen, label: 'Bibliothèque', href: '/student/library' },
      { icon: FileText, label: 'Documents', href: '/student/documents' },
      { icon: MessageSquare, label: 'Messages', href: '/student/messages' },
      { icon: Settings, label: 'Paramètres', href: '/student/settings' },
    ],
  },
  employee: {
    title: 'Espace Employé',
    color: 'from-purple-500 to-violet-600',
    items: [
      { icon: LayoutDashboard, label: 'Tableau de bord', href: '/employee/dashboard' },
      { icon: Users, label: 'Étudiants', href: '/employee/students' },
      { icon: CreditCard, label: 'Paiements', href: '/employee/payments' },
      { icon: FileText, label: 'Documents', href: '/employee/documents' },
      { icon: ClipboardList, label: 'Tâches', href: '/employee/tasks' },
      { icon: BarChart3, label: 'Rapports', href: '/employee/reports' },
      { icon: Settings, label: 'Paramètres', href: '/employee/settings' },
    ],
  },
}

interface DashboardLayoutProps {
  children: ReactNode
  role: 'admin' | 'teacher' | 'student' | 'employee'
  user: {
    name: string
    email: string
    avatar?: string
    role: string
    matricule?: string
  }
}

export function DashboardLayout({ children, role, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const menu = menuConfig[role]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href={`/${role}/dashboard`} className="flex items-center gap-3">
            <UnikinLogo size={sidebarOpen ? 40 : 36} />
            {sidebarOpen && (
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900 dark:text-white">NEXUS</h1>
                <p className="text-xs text-gray-500">UNIKIN</p>
              </div>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem-5rem)]">
          {sidebarOpen && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
              {menu.title}
            </p>
          )}
          {menu.items.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <div key={index}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive 
                      ? `bg-gradient-to-r ${menu.color} text-white shadow-lg` 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", !sidebarOpen && "mx-auto")} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* User profile in sidebar */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback className={cn("bg-gradient-to-br text-white", menu.color)}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.matricule || user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bienvenue, {user.name.split(' ')[0]} 👋
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <NotificationDropdown userId={user.id} role={role} />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className={cn("bg-gradient-to-br text-white text-xs", menu.color)}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${role}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
