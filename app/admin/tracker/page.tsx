'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, Clock, AlertTriangle, Loader2, Calendar, Users, 
  TrendingUp, Building2, ChevronRight, RefreshCw, Target,
  CheckCircle2, XCircle, ArrowUpRight, ListTodo, GraduationCap,
  ClipboardCheck, Flag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface ProjectSummary {
  total_phases: number
  completed_phases: number
  total_weeks: number
  completed_weeks: number
  current_week: number
  total_tasks: number
  completed_tasks: number
  validated_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  total_faculties: number
  completed_faculties: number
  overall_progress: number
  days_remaining: number
  days_elapsed: number
  project_start_date: string
  project_end_date: string
}

interface Phase {
  id: number
  name: string
  description: string
  status: string
  progress_percentage: number
  start_date: string
  end_date: string
  tasks_count: number
  completed_tasks_count: number
}

interface WeekProgress {
  week_id: number
  week_number: number
  week_name: string
  total_tasks: number
  completed_tasks: number
  validated_tasks: number
  progress_percentage: number
  status: string
}

interface Task {
  id: number
  title: string
  status: string
  priority: string
  category: string
  due_date: string
  client_validated: boolean
  prestataire_completed: boolean
  week_name: string
}

export default function TrackerDashboard() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<ProjectSummary | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [weekProgress, setWeekProgress] = useState<WeekProgress[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [taskStats, setTaskStats] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tracker')
      const data = await response.json()
      if (data.success) {
        setSummary(data.data.summary)
        setPhases(data.data.phases)
        setWeekProgress(data.data.weekProgress)
        setRecentTasks(data.data.recentTasks)
        setTaskStats(data.data.taskStats)
        setNotifications(data.data.unreadNotifications)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'blocked': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Terminé</Badge>
      case 'in_progress': return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      case 'blocked': return <Badge className="bg-red-100 text-red-800">Bloqué</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge className="bg-red-600 text-white">Critique</Badge>
      case 'high': return <Badge className="bg-orange-500 text-white">Haute</Badge>
      case 'medium': return <Badge className="bg-yellow-500 text-white">Moyenne</Badge>
      default: return <Badge className="bg-gray-400 text-white">Basse</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du tableau de bord...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Suivi du Projet
          </h1>
          <p className="text-gray-500 mt-1">
            Suivi du projet NEXUS UNIKIN - 30 Janvier au 30 Avril 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Link href="/admin/tracker/tasks">
            <Button>
              <ListTodo className="h-4 w-4 mr-2" />
              Gérer les tâches
            </Button>
          </Link>
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Progression Globale</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.overall_progress || 0}%</div>
            <Progress value={summary?.overall_progress || 0} className="mt-2" />
            <p className="text-xs text-gray-500 mt-2">
              {summary?.days_elapsed || 0} jours écoulés / {summary?.days_remaining || 0} restants
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tâches Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {summary?.completed_tasks || 0}
              <span className="text-lg text-gray-400">/{summary?.total_tasks || 0}</span>
            </div>
            <Progress 
              value={summary?.total_tasks ? (summary.completed_tasks / summary.total_tasks) * 100 : 0} 
              className="mt-2 bg-gray-200" 
            />
            <p className="text-xs text-gray-500 mt-2">
              {summary?.validated_tasks || 0} validées par le client
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">En Cours</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {summary?.in_progress_tasks || 0}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {summary?.pending_tasks || 0} en attente
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                {summary?.blocked_tasks || 0} bloquées
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Facultés</CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {summary?.completed_faculties || 0}
              <span className="text-lg text-gray-400">/{summary?.total_faculties || 0}</span>
            </div>
            <Progress 
              value={summary?.total_faculties ? (summary.completed_faculties / summary.total_faculties) * 100 : 0} 
              className="mt-2" 
            />
            <p className="text-xs text-gray-500 mt-2">
              Semaine actuelle: {summary?.current_week || 1}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="weeks">Semaines</TabsTrigger>
          <TabsTrigger value="tasks">Tâches récentes</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Progression par phase */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Progression par Phase</CardTitle>
                <CardDescription>État d'avancement de chaque phase du projet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {phases.map((phase) => (
                  <div key={phase.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(phase.status)}`} />
                        <span className="font-medium text-sm">{phase.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{phase.completed_tasks_count}/{phase.tasks_count} tâches</span>
                        <span className="font-semibold">{phase.progress_percentage}%</span>
                      </div>
                    </div>
                    <Progress value={phase.progress_percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Statistiques par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle>Par Catégorie</CardTitle>
                <CardDescription>Répartition des tâches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {taskStats.slice(0, 6).map((stat: any) => (
                  <div key={stat.category} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{stat.category?.replace('_', ' ') || 'Autre'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{stat.completed}/{stat.total}</span>
                      <Badge variant="outline" className="min-w-[50px] justify-center">
                        {stat.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Notifications en attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {notifications.map((notif: any) => (
                    <div key={notif.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-gray-500">{notif.message}</p>
                      </div>
                      <Badge variant="outline">{notif.notification_type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Phases */}
        <TabsContent value="phases" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {phases.map((phase) => (
              <Card key={phase.id} className={`${phase.status === 'in_progress' ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{phase.name}</CardTitle>
                    {getStatusBadge(phase.status)}
                  </div>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        {new Date(phase.start_date).toLocaleDateString('fr-FR')} - {new Date(phase.end_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span className="font-semibold">{phase.progress_percentage}%</span>
                      </div>
                      <Progress value={phase.progress_percentage} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {phase.completed_tasks_count}/{phase.tasks_count} tâches terminées
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/tracker/tasks?phase_id=${phase.id}`}>
                          Voir <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Semaines */}
        <TabsContent value="weeks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weekProgress.map((week) => (
              <Card 
                key={week.week_id} 
                className={`${week.status === 'in_progress' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Semaine {week.week_number}
                    </CardTitle>
                    {getStatusBadge(week.status)}
                  </div>
                  <CardDescription className="text-xs truncate">{week.week_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress value={week.progress_percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{week.completed_tasks}/{week.total_tasks} tâches</span>
                    <span className="text-green-600">{week.validated_tasks} validées</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tâches récentes */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tâches Récentes</CardTitle>
                  <CardDescription>Dernières tâches mises à jour</CardDescription>
                </div>
                <Link href="/admin/tracker/tasks">
                  <Button variant="outline" size="sm">
                    Voir toutes les tâches
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.week_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(task.priority)}
                      {task.prestataire_completed && (
                        <span title="Terminé prestataire"><CheckCircle2 className="h-4 w-4 text-blue-500" /></span>
                      )}
                      {task.client_validated && (
                        <span title="Validé client"><ClipboardCheck className="h-4 w-4 text-green-500" /></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
