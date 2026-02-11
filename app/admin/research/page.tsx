'use client'

import { useState, useEffect } from 'react'
import { 
  Microscope, 
  FileText, 
  Users, 
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Award,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface ResearchProject {
  id: string
  title: string
  description: string
  research_area: string
  faculty_name: string
  status: string
  start_date: string
  end_date: string
  budget_allocated: number
  budget_spent: number
  funding_source: string
  member_count: number
}

interface Publication {
  id: string
  title: string
  authors: string[]
  publication_type: string
  journal_conference_name: string
  publication_year: number
  doi: string
  abstract: string
}

interface Thesis {
  id: string
  title: string
  student_name: string
  supervisor_name: string
  thesis_type: string
  status: string
  faculty_name: string
  defense_date: string
}

interface Stats {
  projectsByStatus: any[]
  publicationsByType: any[]
  thesesByType: any[]
  publicationsByYear: any[]
  budget: { allocated: number; spent: number }
}

export default function ResearchPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [publications, setPublications] = useState<Publication[]>([])
  const [theses, setTheses] = useState<Thesis[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showNewThesisDialog, setShowNewThesisDialog] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchProjects()
    fetchPublications()
    fetchTheses()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/research?type=stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ type: 'projects' })
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/research?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPublications = async () => {
    try {
      const response = await fetch('/api/research?type=publications')
      if (response.ok) {
        const data = await response.json()
        setPublications(data.publications || [])
      }
    } catch (error) {
      console.error('Error fetching publications:', error)
    }
  }

  const fetchTheses = async () => {
    try {
      const response = await fetch('/api/research?type=theses')
      if (response.ok) {
        const data = await response.json()
        setTheses(data.theses || [])
      }
    } catch (error) {
      console.error('Error fetching theses:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700'
      case 'COMPLETED': return 'bg-green-100 text-green-700'
      case 'ON_HOLD': return 'bg-amber-100 text-amber-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      case 'PROPOSED': return 'bg-gray-100 text-gray-700'
      case 'DEFENDED': return 'bg-green-100 text-green-700'
      case 'SUBMITTED': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PROPOSED': 'Proposé',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé',
      'ON_HOLD': 'En pause',
      'CANCELLED': 'Annulé',
      'DRAFT': 'Brouillon',
      'SUBMITTED': 'Soumis',
      'IN_REVIEW': 'En révision',
      'APPROVED': 'Approuvé',
      'DEFENSE_SCHEDULED': 'Soutenance planifiée',
      'DEFENDED': 'Soutenu',
      'REJECTED': 'Rejeté'
    }
    return labels[status] || status
  }

  const getThesisTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'LICENCE': 'Licence (TFC)',
      'MASTER': 'Master (Mémoire)',
      'DOCTORAT': 'Doctorat (Thèse)'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Microscope className="h-8 w-8 text-primary" />
            Recherche Scientifique
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des projets de recherche, publications et thèses - SGR
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => setShowNewThesisDialog(true)}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Nouvelle Thèse
          </Button>
          <Button onClick={() => setShowNewProjectDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Projet
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="theses">Thèses & Mémoires</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Projets actifs</p>
                    <p className="text-2xl font-bold">
                      {stats?.projectsByStatus?.find(p => p.status === 'IN_PROGRESS')?.count || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Microscope className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Publications</p>
                    <p className="text-2xl font-bold">
                      {stats?.publicationsByType?.reduce((sum, p) => sum + parseInt(p.count), 0) || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Thèses en cours</p>
                    <p className="text-2xl font-bold">
                      {stats?.thesesByType?.filter(t => t.status === 'IN_PROGRESS').reduce((sum, t) => sum + parseInt(t.count), 0) || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget utilisé</p>
                    <p className="text-2xl font-bold">
                      {stats?.budget?.spent ? ((stats.budget.spent / stats.budget.allocated) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <Progress 
                  value={stats?.budget?.spent ? (stats.budget.spent / stats.budget.allocated) * 100 : 0} 
                  className="mt-3 h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projets par statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.projectsByStatus?.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Publications par année</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.publicationsByYear?.map((item) => (
                    <div key={item.publication_year} className="flex items-center gap-3">
                      <span className="w-12 text-sm text-muted-foreground">
                        {item.publication_year}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full"
                          style={{ 
                            width: `${Math.min((item.count / 20) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="font-semibold w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projets */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un projet..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => {
                  setStatusFilter(v)
                  fetchProjects()
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="PROPOSED">Proposé</SelectItem>
                    <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                    <SelectItem value="ON_HOLD">En pause</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {project.research_area}
                          </span>
                          <span>{project.faculty_name}</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {project.member_count} membres
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(project.start_date).toLocaleDateString('fr-FR')}
                            {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString('fr-FR')}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-semibold">
                          {(project.budget_spent || 0).toLocaleString()} / {(project.budget_allocated || 0).toLocaleString()} $
                        </p>
                        <Progress 
                          value={project.budget_allocated ? (project.budget_spent / project.budget_allocated) * 100 : 0}
                          className="mt-2 h-2 w-32"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Publications */}
        <TabsContent value="publications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publications.map((pub) => (
              <Card key={pub.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">{pub.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pub.authors?.join(', ')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{pub.publication_type}</Badge>
                        <span className="text-xs text-muted-foreground">{pub.publication_year}</span>
                      </div>
                      {pub.journal_conference_name && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {pub.journal_conference_name}
                        </p>
                      )}
                    </div>
                    {pub.doi && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Thèses */}
        <TabsContent value="theses" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Titre</th>
                  <th className="text-left py-3 px-4 font-medium">Étudiant</th>
                  <th className="text-left py-3 px-4 font-medium">Directeur</th>
                  <th className="text-center py-3 px-4 font-medium">Type</th>
                  <th className="text-center py-3 px-4 font-medium">Statut</th>
                  <th className="text-center py-3 px-4 font-medium">Soutenance</th>
                  <th className="text-center py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {theses.map((thesis) => (
                  <tr key={thesis.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <p className="font-medium line-clamp-1">{thesis.title}</p>
                      <p className="text-xs text-muted-foreground">{thesis.faculty_name}</p>
                    </td>
                    <td className="py-3 px-4">{thesis.student_name}</td>
                    <td className="py-3 px-4">{thesis.supervisor_name}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">{getThesisTypeLabel(thesis.thesis_type)}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusColor(thesis.status)}>
                        {getStatusLabel(thesis.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      {thesis.defense_date 
                        ? new Date(thesis.defense_date).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Nouveau Projet */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Projet de Recherche</DialogTitle>
            <DialogDescription>
              Créer un nouveau projet de recherche scientifique
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Titre du projet</Label>
              <Input placeholder="Titre du projet de recherche" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea placeholder="Description détaillée du projet..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Domaine de recherche</Label>
                <Input placeholder="Ex: Intelligence Artificielle" />
              </div>
              <div className="grid gap-2">
                <Label>Source de financement</Label>
                <Input placeholder="Ex: Fonds universitaires" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date de début</Label>
                <Input type="date" />
              </div>
              <div className="grid gap-2">
                <Label>Date de fin prévue</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Budget alloué (USD)</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast.success('Projet créé avec succès')
              setShowNewProjectDialog(false)
            }}>
              Créer le projet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nouvelle Thèse */}
      <Dialog open={showNewThesisDialog} onOpenChange={setShowNewThesisDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enregistrer une Thèse/Mémoire</DialogTitle>
            <DialogDescription>
              Enregistrer une nouvelle thèse ou mémoire de recherche
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LICENCE">Travail de Fin de Cycle (TFC)</SelectItem>
                  <SelectItem value="MASTER">Mémoire de Master</SelectItem>
                  <SelectItem value="DOCTORAT">Thèse de Doctorat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Titre</Label>
              <Input placeholder="Titre de la thèse/mémoire" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Étudiant</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Étudiant 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Directeur de thèse</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le directeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Prof. XXXXX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Résumé</Label>
              <Textarea placeholder="Résumé de la thèse..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewThesisDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast.success('Thèse enregistrée avec succès')
              setShowNewThesisDialog(false)
            }}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
