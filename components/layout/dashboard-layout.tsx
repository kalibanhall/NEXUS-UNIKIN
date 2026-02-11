'use client'

import { ReactNode, useState, useEffect, useCallback } from 'react'
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
  ChevronRight,
  Building2,
  ClipboardList,
  BarChart3,
  Shield,
  UserCheck,
  FolderOpen,
  MessageSquare,
  CheckCheck,
  Wallet,
  AlertTriangle,
  Hand,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
      { icon: ClipboardList, label: 'Délibérations', href: '/admin/deliberations' },
      { icon: CreditCard, label: 'Finances', href: '/admin/finances',
        children: [
          { label: 'Vue d\'ensemble', href: '/admin/finances' },
          { label: 'Importer des données', href: '/admin/finances/import' },
        ]
      },
      { icon: BarChart3, label: 'Statistiques', href: '/admin/statistics' },
      { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      { icon: Bell, label: 'Annonces', href: '/admin/announcements' },
      { icon: FolderOpen, label: 'Bibliothèque', href: '/admin/library' },
      { icon: FileText, label: 'Documents', href: '/admin/documents' },
      { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
      { icon: CheckCheck, label: 'Sondages', href: '/admin/surveys' },
      { icon: BookOpen, label: 'Recherche', href: '/admin/research' },
      { icon: Wallet, label: 'Bourses', href: '/admin/scholarships' },
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
    id?: number | string
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const menu = menuConfig[role]

  // Avertissement avant de quitter/recharger la page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Êtes-vous sûr de vouloir quitter cette page ? Les modifications non enregistrées seront perdues.'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Fermer le menu mobile lors de la navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth/login'
  }

  const toggleSubmenu = useCallback((label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }, [])

  // Générer le fil d'Ariane
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean)
    const crumbs: { label: string; href: string }[] = []
    
    let currentPath = ''
    for (const part of parts) {
      currentPath += `/${part}`
      const menuItem = menu.items.find(item => item.href === currentPath)
      crumbs.push({
        label: menuItem?.label || part.charAt(0).toUpperCase() + part.slice(1),
        href: currentPath,
      })
    }
    
    return crumbs
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
          <Link href={`/${role}/dashboard`} className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
              <UnikinLogo size={36} />
            </div>
            {sidebarOpen && (
              <div className="hidden sm:block min-w-0">
                <h1 className="font-bold text-gray-900 dark:text-white truncate">NEXUS</h1>
                <p className="text-xs text-gray-500 truncate">UNIKIN</p>
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
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedMenus.includes(item.label)
            
            return (
              <div key={index}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        isActive 
                          ? `bg-gradient-to-r ${menu.color} text-white shadow-lg` 
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 flex-shrink-0", !sidebarOpen && "mx-auto")} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 font-medium text-left">{item.label}</span>
                          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                        </>
                      )}
                    </button>
                    {sidebarOpen && isExpanded && item.children && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                        {item.children.map((child, childIdx) => {
                          const isChildActive = pathname === child.href
                          return (
                            <Link
                              key={childIdx}
                              href={child.href}
                              className={cn(
                                "block px-3 py-2 rounded-md text-sm transition-colors",
                                isChildActive 
                                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              )}
                            >
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
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
                )}
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
                <div className="flex items-center gap-2">
                  <Hand className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Bienvenue, {user.name.split(' ')[0]}
                  </h2>
                </div>
                {/* Fil d'Ariane */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  {getBreadcrumbs().map((crumb, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      {idx > 0 && <ChevronRight className="w-3 h-3" />}
                      {idx === getBreadcrumbs().length - 1 ? (
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{crumb.label}</span>
                      ) : (
                        <Link href={crumb.href} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          {crumb.label}
                        </Link>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <NotificationDropdown userId={user.id ? Number(user.id) : undefined} role={role} />

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
                  <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dialogue de confirmation de déconnexion */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirmer la déconnexion
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre espace.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
