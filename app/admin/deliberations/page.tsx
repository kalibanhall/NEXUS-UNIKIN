'use client'

import { useState } from 'react'
import { 
  Scale,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  Filter,
  Users,
  FileText,
  Clock,
  Play,
  Pause,
  Check,
  X,
  Eye,
  TrendingUp,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn, getGradeColor } from '@/lib/utils'

// Types
interface DeliberationSession {
  id: string
  name: string
  faculty: string
  department: string
  promotion: string
  academicYear: string
  semester: number
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  startDate: string
  endDate: string | null
  totalStudents: number
  processedStudents: number
  passRate: number
  president: string
  secretary: string
}

interface StudentResult {
  id: string
  matricule: string
  firstName: string
  lastName: string
  avgGrade: number
  totalCredits: number
  acquiredCredits: number
  status: 'pending' | 'passed' | 'failed' | 'recourse'
  hasDebt: boolean
  isLocked: boolean
  decision: string
  mention: string | null
}

// Mock data - Deliberation sessions
const deliberationSessions: DeliberationSession[] = [
  {
    id: '1',
    name: 'Délibération L1 Informatique - S1',
    faculty: 'Sciences',
    department: 'Informatique',
    promotion: 'L1 Informatique',
    academicYear: '2025-2026',
    semester: 1,
    status: 'in_progress',
    startDate: '2025-01-20',
    endDate: null,
    totalStudents: 156,
    processedStudents: 89,
    passRate: 67.4,
    president: 'Prof. Kabongo',
    secretary: 'Dr. Mutombo',
  },
  {
    id: '2',
    name: 'Délibération L2 Informatique - S1',
    faculty: 'Sciences',
    department: 'Informatique',
    promotion: 'L2 Informatique',
    academicYear: '2025-2026',
    semester: 1,
    status: 'draft',
    startDate: '2025-01-25',
    endDate: null,
    totalStudents: 134,
    processedStudents: 0,
    passRate: 0,
    president: 'Prof. Ilunga',
    secretary: 'Dr. Kasongo',
  },
  {
    id: '3',
    name: 'Délibération L3 Informatique - S1',
    faculty: 'Sciences',
    department: 'Informatique',
    promotion: 'L3 Informatique',
    academicYear: '2025-2026',
    semester: 1,
    status: 'completed',
    startDate: '2025-01-15',
    endDate: '2025-01-18',
    totalStudents: 98,
    processedStudents: 98,
    passRate: 72.4,
    president: 'Prof. Kabongo',
    secretary: 'Dr. Mutombo',
  },
]

// Mock data - Student results
const studentResults: StudentResult[] = [
  {
    id: '1',
    matricule: 'L1-INFO-2025-001',
    firstName: 'Patrick',
    lastName: 'Mbuyi',
    avgGrade: 14.5,
    totalCredits: 30,
    acquiredCredits: 30,
    status: 'passed',
    hasDebt: false,
    isLocked: false,
    decision: 'Admis',
    mention: 'Assez Bien',
  },
  {
    id: '2',
    matricule: 'L1-INFO-2025-002',
    firstName: 'Marie',
    lastName: 'Kasongo',
    avgGrade: 0,
    totalCredits: 30,
    acquiredCredits: 0,
    status: 'pending',
    hasDebt: true,
    isLocked: true,
    decision: '-',
    mention: null,
  },
  {
    id: '3',
    matricule: 'L1-INFO-2025-003',
    firstName: 'Jean',
    lastName: 'Ilunga',
    avgGrade: 16.8,
    totalCredits: 30,
    acquiredCredits: 30,
    status: 'passed',
    hasDebt: false,
    isLocked: false,
    decision: 'Admis',
    mention: 'Bien',
  },
  {
    id: '4',
    matricule: 'L1-INFO-2025-004',
    firstName: 'Sarah',
    lastName: 'Mutombo',
    avgGrade: 8.2,
    totalCredits: 30,
    acquiredCredits: 12,
    status: 'failed',
    hasDebt: false,
    isLocked: false,
    decision: 'Ajourné',
    mention: null,
  },
  {
    id: '5',
    matricule: 'L1-INFO-2025-005',
    firstName: 'David',
    lastName: 'Lukusa',
    avgGrade: 0,
    totalCredits: 30,
    acquiredCredits: 0,
    status: 'pending',
    hasDebt: true,
    isLocked: true,
    decision: '-',
    mention: null,
  },
  {
    id: '6',
    matricule: 'L1-INFO-2025-006',
    firstName: 'Claire',
    lastName: 'Ndaya',
    avgGrade: 12.4,
    totalCredits: 30,
    acquiredCredits: 26,
    status: 'passed',
    hasDebt: false,
    isLocked: false,
    decision: 'Admis avec dette',
    mention: null,
  },
  {
    id: '7',
    matricule: 'L1-INFO-2025-007',
    firstName: 'Michel',
    lastName: 'Tshilumba',
    avgGrade: 9.8,
    totalCredits: 30,
    acquiredCredits: 18,
    status: 'recourse',
    hasDebt: false,
    isLocked: false,
    decision: 'Recours autorisé',
    mention: null,
  },
]

// Mention calculation
function getMention(avg: number): string | null {
  if (avg >= 16) return 'Distinction'
  if (avg >= 14) return 'Bien'
  if (avg >= 12) return 'Assez Bien'
  if (avg >= 10) return 'Passable'
  return null
}

export default function DeliberationPage() {
  const [selectedSession, setSelectedSession] = useState(deliberationSessions[0])
  const [students, setStudents] = useState(studentResults)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isRunning, setIsRunning] = useState(false)

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: students.length,
    passed: students.filter(s => s.status === 'passed').length,
    failed: students.filter(s => s.status === 'failed').length,
    pending: students.filter(s => s.status === 'pending').length,
    locked: students.filter(s => s.isLocked).length,
    recourse: students.filter(s => s.status === 'recourse').length,
    avgGrade: students
      .filter(s => s.avgGrade > 0)
      .reduce((sum, s) => sum + s.avgGrade, 0) / 
      students.filter(s => s.avgGrade > 0).length || 0,
  }

  // Start deliberation
  const startDeliberation = async () => {
    if (stats.locked > 0) {
      toast.warning(`${stats.locked} étudiant(s) avec dette sont verrouillés. Leurs notes ne seront pas délibérées.`)
    }
    
    setIsRunning(true)
    toast.info('Délibération en cours...')
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update student statuses
    setStudents(prev => prev.map(student => {
      if (student.isLocked) return student
      
      const avgGrade = student.avgGrade
      let newStatus: StudentResult['status'] = 'pending'
      let decision = '-'
      let mention = null
      
      if (avgGrade >= 10) {
        newStatus = 'passed'
        decision = student.acquiredCredits >= student.totalCredits ? 'Admis' : 'Admis avec dette'
        mention = getMention(avgGrade)
      } else if (avgGrade >= 8) {
        newStatus = 'recourse'
        decision = 'Recours possible'
      } else if (avgGrade > 0) {
        newStatus = 'failed'
        decision = 'Ajourné'
      }
      
      return { ...student, status: newStatus, decision, mention }
    }))
    
    setIsRunning(false)
    toast.success('Délibération terminée')
  }

  // Validate results
  const validateResults = () => {
    toast.success('Résultats validés et envoyés pour publication')
  }

  // Unlock student (admin only)
  const unlockStudent = (studentId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, isLocked: false } : s
    ))
    toast.success('Étudiant débloqué')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-7 h-7" />
            Délibération
          </h1>
          <p className="text-gray-500">
            Gestion des délibérations académiques
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="w-4 h-4 mr-2" />
            Exporter PV
          </Button>
          <Button 
            variant="outline"
            onClick={validateResults}
            disabled={stats.pending > 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Valider
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-cyan-600"
            onClick={startDeliberation}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Délibérer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Session Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-64">
              <Select 
                value={selectedSession.id} 
                onValueChange={(id) => {
                  const session = deliberationSessions.find(s => s.id === id)
                  if (session) setSelectedSession(session)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une session" />
                </SelectTrigger>
                <SelectContent>
                  {deliberationSessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span><strong>Président:</strong> {selectedSession.president}</span>
              <span><strong>Secrétaire:</strong> {selectedSession.secretary}</span>
            </div>
            <Badge variant={
              selectedSession.status === 'completed' ? 'success' :
              selectedSession.status === 'in_progress' ? 'info' :
              selectedSession.status === 'archived' ? 'secondary' : 'warning'
            } className="ml-auto">
              {selectedSession.status === 'completed' ? 'Terminé' :
               selectedSession.status === 'in_progress' ? 'En cours' :
               selectedSession.status === 'archived' ? 'Archivé' : 'Brouillon'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.passed}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Admis</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <X className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.failed}</p>
            <p className="text-xs text-red-600 dark:text-red-400">Ajournés</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.pending}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">En attente</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.recourse}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Recours</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.locked}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Verrouillés</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-cyan-600" />
            <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.avgGrade.toFixed(1)}</p>
            <p className="text-xs text-cyan-600 dark:text-cyan-400">Moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for locked students */}
      {stats.locked > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-200">
                {stats.locked} étudiant(s) avec dette financière
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Les notes de ces étudiants sont verrouillées et ne peuvent pas être délibérées. 
                Contactez le service financier pour régularisation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="passed">Admis</SelectItem>
                <SelectItem value="failed">Ajournés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="recourse">Recours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="w-[60px]"></TableHead>
                <TableHead className="w-[160px]">Matricule</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead className="text-center">Moyenne</TableHead>
                <TableHead className="text-center">Crédits</TableHead>
                <TableHead className="text-center">Décision</TableHead>
                <TableHead className="text-center">Mention</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow 
                  key={student.id}
                  className={cn(
                    student.isLocked && "bg-red-50 dark:bg-red-900/10"
                  )}
                >
                  <TableCell>
                    {student.isLocked ? (
                      <Lock className="w-4 h-4 text-red-500" />
                    ) : student.status === 'passed' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : student.status === 'failed' ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : student.status === 'recourse' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.matricule}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{student.lastName} {student.firstName}</p>
                      {student.hasDebt && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Dette impayée
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-lg font-bold",
                      student.isLocked ? "text-gray-400" : getGradeColor(student.avgGrade)
                    )}>
                      {student.isLocked ? '-' : student.avgGrade > 0 ? student.avgGrade.toFixed(2) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {student.isLocked ? (
                      <span className="text-gray-400">-/-</span>
                    ) : (
                      <span>
                        <span className={student.acquiredCredits >= student.totalCredits ? 'text-green-600 font-bold' : ''}>
                          {student.acquiredCredits}
                        </span>
                        /{student.totalCredits}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={
                      student.decision.includes('Admis') ? 'success' :
                      student.decision.includes('Recours') ? 'warning' :
                      student.decision === 'Ajourné' ? 'destructive' : 'secondary'
                    }>
                      {student.decision}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {student.mention ? (
                      <Badge variant="outline" className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-300">
                        {student.mention}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {student.isLocked && (
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => unlockStudent(student.id)}
                          title="Débloquer l'étudiant"
                        >
                          <Unlock className="w-4 h-4 text-amber-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 py-3">
          <div className="flex items-center justify-between w-full text-sm text-gray-500">
            <span>
              {filteredStudents.length} étudiant(s) affiché(s)
            </span>
            <div className="flex items-center gap-4">
              <span>
                Taux de réussite: 
                <strong className={cn(
                  "ml-1",
                  (stats.passed / (stats.total - stats.locked) * 100) >= 50 ? 'text-green-600' : 'text-red-600'
                )}>
                  {((stats.passed / (stats.total - stats.locked)) * 100).toFixed(1)}%
                </strong>
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
