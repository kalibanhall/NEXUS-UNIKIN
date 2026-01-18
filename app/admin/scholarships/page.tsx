'use client'

import { useState, useEffect } from 'react'
import { 
  Award,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Check,
  X,
  Clock,
  CreditCard,
  FileText,
  Calendar,
  GraduationCap,
  Building2,
  AlertTriangle,
  CheckCircle,
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
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface ScholarshipProgram {
  id: string
  name: string
  description: string
  scholarship_type: string
  amount: number
  currency: string
  coverage: any
  faculty_name: string | null
  academic_year: string
  max_recipients: number
  current_recipients: number
  application_deadline: string
  status: string
  eligibility_criteria: any
}

interface ScholarshipApplication {
  id: string
  program_name: string
  student_name: string
  student_matricule: string
  faculty_name: string
  gpa: number
  status: string
  applied_at: string
  reviewed_at: string | null
  reviewer_name: string | null
}

export default function ScholarshipsPage() {
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([])
  const [applications, setApplications] = useState<ScholarshipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('programs')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNewProgramDialog, setShowNewProgramDialog] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchPrograms()
    fetchApplications()
    fetchStats()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/scholarships')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs || [])
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await fetch(`/api/scholarships?type=applications&${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/scholarships?type=stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleReviewApplication = async (applicationId: string, decision: 'APPROVED' | 'REJECTED', comment?: string) => {
    try {
      const response = await fetch('/api/scholarships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          action: 'review',
          status: decision,
          reviewComment: comment
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(decision === 'APPROVED' ? 'Candidature approuvée' : 'Candidature rejetée')
        fetchApplications()
        setSelectedApplication(null)
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors du traitement')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700">En attente</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-700">Approuvée</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700">Rejetée</Badge>
      case 'ACTIVE':
        return <Badge className="bg-blue-100 text-blue-700">Active</Badge>
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-700">Terminé</Badge>
      case 'OPEN':
        return <Badge className="bg-green-100 text-green-700">Ouvert</Badge>
      case 'CLOSED':
        return <Badge className="bg-red-100 text-red-700">Fermé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScholarshipTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'MERIT': 'Mérite académique',
      'NEED': 'Aide sociale',
      'SPORT': 'Excellence sportive',
      'RESEARCH': 'Recherche',
      'CULTURAL': 'Excellence culturelle',
      'GOVERNMENT': 'Gouvernementale',
      'PRIVATE': 'Privée',
      'INTERNATIONAL': 'Internationale'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Bourses & Aides Financières
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des programmes de bourses et candidatures
          </p>
        </div>
        <Button onClick={() => setShowNewProgramDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Programme
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programmes actifs</p>
                <p className="text-2xl font-bold">{stats?.activePrograms || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Boursiers actuels</p>
                <p className="text-2xl font-bold">{stats?.totalRecipients || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidatures en attente</p>
                <p className="text-2xl font-bold">{stats?.pendingApplications || 0}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget total</p>
                <p className="text-2xl font-bold">
                  {((stats?.totalBudget || 0) / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-muted-foreground">CDF</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="programs">Programmes</TabsTrigger>
          <TabsTrigger value="applications">
            Candidatures
            {stats?.pendingApplications > 0 && (
              <Badge className="ml-2 bg-amber-500">{stats.pendingApplications}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recipients">Boursiers</TabsTrigger>
        </TabsList>

        {/* Programmes */}
        <TabsContent value="programs" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : programs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun programme de bourse</p>
                <Button className="mt-4" onClick={() => setShowNewProgramDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un programme
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        {getStatusBadge(program.status)}
                      </div>
                      <Badge variant="outline">{getScholarshipTypeLabel(program.scholarship_type)}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{program.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-semibold">
                        {program.amount?.toLocaleString()} {program.currency || 'CDF'}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Places</span>
                        <span>{program.current_recipients || 0}/{program.max_recipients}</span>
                      </div>
                      <Progress 
                        value={program.max_recipients ? (program.current_recipients / program.max_recipients) * 100 : 0} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(program.application_deadline).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {program.faculty_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{program.faculty_name}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Candidatures */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher une candidature..." className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={(v) => {
                  setStatusFilter(v)
                  fetchApplications()
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="APPROVED">Approuvées</SelectItem>
                    <SelectItem value="REJECTED">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{app.student_name}</h3>
                        <p className="text-sm text-muted-foreground">{app.student_matricule}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{app.faculty_name}</span>
                          <span>•</span>
                          <span>GPA: {app.gpa?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-medium">{app.program_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Soumis le {new Date(app.applied_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {getStatusBadge(app.status)}
                      
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleReviewApplication(app.id, 'APPROVED')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                      
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Boursiers */}
        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Boursiers</CardTitle>
              <CardDescription>Étudiants bénéficiant actuellement d'une bourse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>La liste des boursiers sera affichée ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Nouveau Programme */}
      <Dialog open={showNewProgramDialog} onOpenChange={setShowNewProgramDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Programme de Bourse</DialogTitle>
            <DialogDescription>
              Créer un nouveau programme de bourse ou d'aide financière
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label>Nom du programme</Label>
              <Input placeholder="Ex: Bourse d'Excellence Académique" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea placeholder="Description du programme de bourse..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type de bourse</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MERIT">Mérite académique</SelectItem>
                    <SelectItem value="NEED">Aide sociale</SelectItem>
                    <SelectItem value="SPORT">Excellence sportive</SelectItem>
                    <SelectItem value="RESEARCH">Recherche</SelectItem>
                    <SelectItem value="GOVERNMENT">Gouvernementale</SelectItem>
                    <SelectItem value="PRIVATE">Privée</SelectItem>
                    <SelectItem value="INTERNATIONAL">Internationale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Année académique</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Montant</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Devise</Label>
                <Select defaultValue="CDF">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDF">CDF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Max. bénéficiaires</Label>
                <Input type="number" placeholder="10" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Date limite de candidature</Label>
              <Input type="date" />
            </div>
            <div className="grid gap-2">
              <Label>Critères d'éligibilité</Label>
              <Textarea placeholder="Décrivez les critères d'éligibilité..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProgramDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast.success('Programme créé avec succès')
              setShowNewProgramDialog(false)
            }}>
              Créer le programme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejet */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la candidature</DialogTitle>
            <DialogDescription>
              Candidature de {selectedApplication?.student_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Motif du rejet</Label>
              <Textarea placeholder="Expliquez le motif du rejet..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApplication(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedApplication && handleReviewApplication(selectedApplication.id, 'REJECTED')}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
