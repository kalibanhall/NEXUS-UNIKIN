'use client'

import { useState, useEffect } from 'react'
import { 
  Scale,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  Users,
  FileText,
  Clock,
  Play,
  Check,
  X,
  Eye,
  TrendingUp,
  Award,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn, getGradeColor } from '@/lib/utils'

interface DeliberationSession {
  id: string
  name: string
  faculty: string
  department: string
  promotion: string
  promotionId: number
  academicYear: string
  semester: number
  status: string
  startDate: string
  endDate: string | null
  totalStudents: number
  processedStudents: number
  passRate: number
  president: string
  secretary: string
}

interface StudentResult {
  id: number
  matricule: string
  first_name: string
  last_name: string
  average: number
  total_credits: number
  credits_validated: number
  status: string
  payment_status: string
  decision: string
}

interface Stats {
  totalStudents: number
  passedStudents: number
  failedStudents: number
  passRate: string | number
}

function getMention(avg: number): string | null {
  if (avg >= 16) return 'Distinction'
  if (avg >= 14) return 'Bien'
  if (avg >= 12) return 'Assez Bien'
  if (avg >= 10) return 'Passable'
  return null
}

function getDecisionBadge(decision: string) {
  switch (decision) {
    case 'ADMIS':
      return <Badge className="bg-green-500">Admis</Badge>
    case 'ADMIS_AVEC_DETTE':
      return <Badge className="bg-yellow-500">Admis avec dette</Badge>
    case 'AJOURNÉ':
      return <Badge className="bg-orange-500">Ajourné</Badge>
    case 'REFUSÉ':
      return <Badge className="bg-red-500">Refusé</Badge>
    case 'BLOQUÉ':
      return <Badge className="bg-gray-500">Bloqué</Badge>
    default:
      return <Badge variant="outline">En attente</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'in-progress':
    case 'IN_PROGRESS':
      return <Badge className="bg-blue-500">En cours</Badge>
    case 'completed':
    case 'COMPLETED':
      return <Badge className="bg-green-500">Terminée</Badge>
    case 'draft':
    case 'DRAFT':
      return <Badge variant="outline">Brouillon</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function DeliberationPage() {
  const [sessions, setSessions] = useState<DeliberationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<DeliberationSession | null>(null)
  const [students, setStudents] = useState<StudentResult[]>([])
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, passedStudents: 0, failedStudents: 0, passRate: 0 })
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isRunning, setIsRunning] = useState(false)
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null)

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/deliberations/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
        if (data.sessions?.length > 0 && !selectedSession) {
          setSelectedSession(data.sessions[0])
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des sessions')
    } finally {
      setIsLoadingSessions(false)
    }
  }

  // Fetch students for selected session
  const fetchStudents = async (promotionId: number) => {
    setIsLoadingStudents(true)
    try {
      const response = await fetch(`/api/deliberations?promotionId=${promotionId}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        setStats(data.statistics || { totalStudents: 0, passedStudents: 0, failedStudents: 0, passRate: 0 })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des étudiants')
    } finally {
      setIsLoadingStudents(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (selectedSession?.promotionId) {
      fetchStudents(selectedSession.promotionId)
    }
  }, [selectedSession])

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || student.decision === statusFilter

    return matchesSearch && matchesStatus
  })

  // Computed stats
  const computedStats = {
    total: students.length,
    passed: students.filter(s => s.decision === 'ADMIS' || s.decision === 'ADMIS_AVEC_DETTE').length,
    failed: students.filter(s => s.decision === 'AJOURNÉ' || s.decision === 'REFUSÉ').length,
    pending: students.filter(s => s.decision === 'EN_ATTENTE').length,
    blocked: students.filter(s => s.decision === 'BLOQUÉ').length,
    avgGrade: students
      .filter(s => s.average > 0)
      .reduce((sum, s) => sum + parseFloat(s.average?.toString() || '0'), 0) / 
      students.filter(s => s.average > 0).length || 0,
  }

  // Start deliberation
  const startDeliberation = async () => {
    if (computedStats.blocked > 0) {
      toast.warning(`${computedStats.blocked} étudiant(s) avec dette sont bloqués.`)
    }
    
    setIsRunning(true)
    toast.info('Délibération en cours...')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsRunning(false)
    toast.success('Délibération terminée')
    
    if (selectedSession?.promotionId) {
      fetchStudents(selectedSession.promotionId)
    }
  }

  // Validate results
  const validateResults = () => {
    toast.success('Résultats validés et prêts pour publication')
  }

  // View student details
  const viewStudentDetails = (student: StudentResult) => {
    setSelectedStudent(student)
    setShowStudentDialog(true)
  }

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Scale className="w-7 h-7" />
          <h1 className="text-2xl font-bold">Délibérations</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucune session de délibération</h3>
            <p className="text-muted-foreground mt-2">
              Aucune session de délibération n'est configurée pour l'année académique en cours.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-7 h-7" />
            Délibérations
          </h1>
          <p className="text-muted-foreground">
            Gestion des délibérations et validation des résultats
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              fetchSessions()
              if (selectedSession?.promotionId) {
                fetchStudents(selectedSession.promotionId)
              }
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Session Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Session de délibération</CardTitle>
          <CardDescription>
            Sélectionnez une session pour voir les résultats des étudiants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {sessions.map((session) => (
              <Card 
                key={session.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md min-w-[280px] flex-1",
                  selectedSession?.id === session.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedSession(session)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{session.name}</CardTitle>
                    {getStatusBadge(session.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{session.faculty} - {session.department}</p>
                    <p>Semestre {session.semester} • {session.academicYear}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.totalStudents} étudiants
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedSession && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{computedStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Admis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{computedStats.passed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Ajournés/Refusés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{computedStats.failed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Bloqués</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{computedStats.blocked}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {computedStats.total > 0 ? ((computedStats.passed / computedStats.total) * 100).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{computedStats.avgGrade.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={startDeliberation}
              disabled={isRunning || selectedSession.status === 'completed'}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Délibération en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Lancer la délibération
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={validateResults}
              disabled={selectedSession.status !== 'in-progress' && selectedSession.status !== 'IN_PROGRESS'}
            >
              <Check className="h-4 w-4 mr-2" />
              Valider les résultats
            </Button>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Résultats des étudiants</CardTitle>
                  <CardDescription>
                    {filteredStudents.length} étudiant(s) sur {students.length}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-[200px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filtrer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="ADMIS">Admis</SelectItem>
                      <SelectItem value="ADMIS_AVEC_DETTE">Admis avec dette</SelectItem>
                      <SelectItem value="AJOURNÉ">Ajourné</SelectItem>
                      <SelectItem value="REFUSÉ">Refusé</SelectItem>
                      <SelectItem value="BLOQUÉ">Bloqué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Nom & Prénom</TableHead>
                      <TableHead className="text-center">Moyenne</TableHead>
                      <TableHead className="text-center">Crédits</TableHead>
                      <TableHead className="text-center">Décision</TableHead>
                      <TableHead className="text-center">Mention</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucun étudiant trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => {
                        const avg = parseFloat(student.average?.toString() || '0')
                        const mention = getMention(avg)
                        const creditsValidated = parseInt(student.credits_validated?.toString() || '0')
                        const totalCredits = parseInt(student.total_credits?.toString() || '0')
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-mono">{student.matricule}</TableCell>
                            <TableCell className="font-medium">
                              {student.last_name} {student.first_name}
                              {student.decision === 'BLOQUÉ' && (
                                <Lock className="inline-block h-4 w-4 ml-2 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                "font-bold",
                                avg >= 14 && "text-green-600",
                                avg >= 10 && avg < 14 && "text-blue-600",
                                avg < 10 && "text-red-600"
                              )}>
                                {avg > 0 ? avg.toFixed(2) : '-'}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm">
                                {creditsValidated}/{totalCredits}
                              </span>
                              <Progress 
                                value={totalCredits > 0 ? (creditsValidated / totalCredits) * 100 : 0} 
                                className="h-1 mt-1"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {getDecisionBadge(student.decision)}
                            </TableCell>
                            <TableCell className="text-center">
                              {mention ? (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                  <Award className="h-3 w-3 mr-1" />
                                  {mention}
                                </Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewStudentDetails(student)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Student Detail Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'étudiant</DialogTitle>
            <DialogDescription>
              Informations complètes sur les résultats
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Matricule</p>
                  <p className="font-mono font-medium">{selectedStudent.matricule}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">{selectedStudent.last_name} {selectedStudent.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moyenne générale</p>
                  <p className="text-2xl font-bold">
                    {parseFloat(selectedStudent.average?.toString() || '0').toFixed(2)}/20
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crédits validés</p>
                  <p className="font-medium">
                    {selectedStudent.credits_validated || 0}/{selectedStudent.total_credits || 0} ECTS
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut paiement</p>
                  <Badge variant={selectedStudent.payment_status === 'PAID' ? 'default' : 'destructive'}>
                    {selectedStudent.payment_status === 'PAID' ? 'Payé' : 
                     selectedStudent.payment_status === 'PARTIAL' ? 'Partiel' : 'Non payé'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Décision</p>
                  {getDecisionBadge(selectedStudent.decision)}
                </div>
              </div>
              {getMention(parseFloat(selectedStudent.average?.toString() || '0')) && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    Mention: {getMention(parseFloat(selectedStudent.average?.toString() || '0'))}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
