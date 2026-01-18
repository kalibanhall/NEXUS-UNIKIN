'use client'

import { useState, useEffect } from 'react'
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Award,
  Edit,
  Trash2,
  Eye,
  Copy,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Laptop,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  AlertTriangle,
  Shield,
  FileSearch,
  Settings2,
  ChevronRight,
  Send
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

// Types d'évaluation
type EvaluationType = 'EXAM' | 'QUIZ' | 'TP' | 'TD' | 'PROJECT' | 'ORAL'
type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'MULTIPLE_SELECT' | 'FILE_UPLOAD'

interface Course {
  id: string
  code: string
  name: string
}

interface Evaluation {
  id: string
  title: string
  description: string
  evaluation_type: EvaluationType
  course_id: string
  course_name: string
  course_code: string
  start_time: string
  end_time: string
  duration_minutes: number
  total_points: number
  passing_score: number
  status: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'
  is_published: boolean
  requires_file_upload: boolean
  plagiarism_check: boolean
  max_attempts: number
  shuffle_questions: boolean
  shuffle_options: boolean
  show_results: boolean
  questions_count: number
  submissions_count: number
  graded_count: number
  average_score?: number
  instructions?: string
}

interface Question {
  id: string
  question_text: string
  question_type: QuestionType
  options: string[]
  correct_answer: string | string[]
  points: number
  order_index: number
  explanation?: string
}

interface Submission {
  id: string
  student_id: string
  student_name: string
  student_matricule: string
  submitted_at: string
  score?: number
  is_graded: boolean
  plagiarism_score?: number
  plagiarism_status: 'PENDING' | 'CLEAN' | 'SUSPICIOUS' | 'PLAGIARIZED'
  time_spent: number
  files?: { name: string; url: string }[]
}

interface PlagiarismReport {
  overall_score: number
  sources: {
    source: string
    similarity: number
    matched_text: string
  }[]
  suspicious_sections: {
    text: string
    similarity: number
    source?: string
  }[]
}

const evaluationTypeConfig: Record<EvaluationType, { label: string; color: string; icon: typeof FileText }> = {
  'EXAM': { label: 'Examen', color: 'bg-red-100 text-red-700', icon: ClipboardCheck },
  'QUIZ': { label: 'Interrogation', color: 'bg-blue-100 text-blue-700', icon: FileText },
  'TP': { label: 'Travaux Pratiques', color: 'bg-green-100 text-green-700', icon: Laptop },
  'TD': { label: 'Travaux Dirigés', color: 'bg-purple-100 text-purple-700', icon: BookOpen },
  'PROJECT': { label: 'Projet Tutoré', color: 'bg-amber-100 text-amber-700', icon: Briefcase },
  'ORAL': { label: 'Oral', color: 'bg-pink-100 text-pink-700', icon: Users },
}

const questionTypeLabels: Record<QuestionType, string> = {
  'MCQ': 'Choix multiple',
  'TRUE_FALSE': 'Vrai/Faux',
  'SHORT_ANSWER': 'Réponse courte',
  'ESSAY': 'Rédaction',
  'MULTIPLE_SELECT': 'Sélection multiple',
  'FILE_UPLOAD': 'Fichier à soumettre'
}

export default function TeacherEvaluationsPage() {
  const { user } = useAuth()
  const teacherInfo = user?.profile
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // État pour création/édition
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false)
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false)
  const [showPlagiarismDialog, setShowPlagiarismDialog] = useState(false)
  const [showGradingDialog, setShowGradingDialog] = useState(false)
  
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [plagiarismReport, setPlagiarismReport] = useState<PlagiarismReport | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  // Formulaire évaluation
  const [evalForm, setEvalForm] = useState({
    title: '',
    description: '',
    evaluation_type: 'EXAM' as EvaluationType,
    course_id: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    total_points: 20,
    passing_score: 50,
    max_attempts: 1,
    instructions: '',
    requires_file_upload: false,
    plagiarism_check: true,
    shuffle_questions: false,
    shuffle_options: false,
    show_results: true
  })

  // Formulaire question
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'MCQ' as QuestionType,
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    explanation: ''
  })

  // Formulaire notation
  const [gradingForm, setGradingForm] = useState({
    score: 0,
    feedback: ''
  })

  useEffect(() => {
    fetchEvaluations()
    fetchCourses()
  }, [])

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/evaluations?action=teacher&teacher_id=${teacherInfo?.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvaluations(data.evaluations || [])
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/courses?teacher_id=${teacherInfo?.id}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchSubmissions = async (evaluationId: string) => {
    try {
      const response = await fetch(`/api/evaluations/submissions?evaluation_id=${evaluationId}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    }
  }

  const fetchPlagiarismReport = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/evaluations/plagiarism?submission_id=${submissionId}`)
      if (response.ok) {
        const data = await response.json()
        setPlagiarismReport(data.report)
      }
    } catch (error) {
      console.error('Error fetching plagiarism report:', error)
    }
  }

  const handleCreateEvaluation = async () => {
    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          teacherId: teacherInfo?.id,
          ...evalForm
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Évaluation créée!')
        setShowCreateDialog(false)
        setSelectedEvaluation(data.evaluation)
        setShowQuestionsDialog(true)
        fetchEvaluations()
        resetEvalForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleAddQuestion = async () => {
    if (!selectedEvaluation) return

    try {
      const response = await fetch('/api/evaluations/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluation_id: selectedEvaluation.id,
          ...questionForm
        })
      })

      if (response.ok) {
        const data = await response.json()
        setQuestions(prev => [...prev, data.question])
        toast.success('Question ajoutée!')
        resetQuestionForm()
      } else {
        toast.error('Erreur lors de l\'ajout')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handlePublishEvaluation = async (evaluationId: string) => {
    try {
      const response = await fetch('/api/evaluations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          evaluationId
        })
      })

      if (response.ok) {
        toast.success('Évaluation publiée!')
        fetchEvaluations()
      } else {
        toast.error('Erreur lors de la publication')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleRunPlagiarismCheck = async (submissionId: string) => {
    try {
      toast.info('Vérification anti-plagiat en cours...')
      const response = await fetch('/api/evaluations/plagiarism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId })
      })

      if (response.ok) {
        const data = await response.json()
        setPlagiarismReport(data.report)
        toast.success('Analyse terminée!')
        // Mettre à jour la soumission
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, plagiarism_score: data.report.overall_score, plagiarism_status: data.status }
            : s
        ))
      } else {
        toast.error('Erreur lors de l\'analyse')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return

    try {
      const response = await fetch('/api/evaluations/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: selectedSubmission.id,
          score: gradingForm.score,
          feedback: gradingForm.feedback
        })
      })

      if (response.ok) {
        toast.success('Note enregistrée!')
        setShowGradingDialog(false)
        fetchSubmissions(selectedEvaluation!.id)
        setGradingForm({ score: 0, feedback: '' })
      } else {
        toast.error('Erreur lors de la notation')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const resetEvalForm = () => {
    setEvalForm({
      title: '',
      description: '',
      evaluation_type: 'EXAM',
      course_id: '',
      start_time: '',
      end_time: '',
      duration_minutes: 60,
      total_points: 20,
      passing_score: 50,
      max_attempts: 1,
      instructions: '',
      requires_file_upload: false,
      plagiarism_check: true,
      shuffle_questions: false,
      shuffle_options: false,
      show_results: true
    })
  }

  const resetQuestionForm = () => {
    setQuestionForm({
      question_text: '',
      question_type: 'MCQ',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      explanation: ''
    })
  }

  const getPlagiarismBadge = (status: string, score?: number) => {
    if (status === 'PENDING') return <Badge variant="outline">En attente</Badge>
    if (status === 'CLEAN' || (score && score < 15)) return <Badge className="bg-green-100 text-green-700">Original</Badge>
    if (status === 'SUSPICIOUS' || (score && score >= 15 && score < 40)) return <Badge className="bg-amber-100 text-amber-700">Suspect ({score}%)</Badge>
    return <Badge variant="destructive">Plagiat ({score}%)</Badge>
  }

  const filteredEvaluations = evaluations
    .filter(e => selectedType === 'all' || e.evaluation_type === selectedType)
    .filter(e => {
      if (activeTab === 'draft') return e.status === 'DRAFT'
      if (activeTab === 'active') return e.status === 'SCHEDULED' || e.status === 'IN_PROGRESS'
      if (activeTab === 'completed') return e.status === 'COMPLETED'
      return true
    })
    .filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Évaluations
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos examens, TP, projets tutorés et autres contrôles
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle évaluation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{evaluations.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Edit className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{evaluations.filter(e => e.status === 'DRAFT').length}</p>
                <p className="text-sm text-muted-foreground">Brouillons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {evaluations.filter(e => e.status === 'SCHEDULED' || e.status === 'IN_PROGRESS').length}
                </p>
                <p className="text-sm text-muted-foreground">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {evaluations.reduce((acc, e) => acc + e.submissions_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Soumissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {evaluations.reduce((acc, e) => acc + (e.submissions_count - e.graded_count), 0)}
                </p>
                <p className="text-sm text-muted-foreground">À corriger</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une évaluation..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type d'évaluation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(evaluationTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchEvaluations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="draft">Brouillons</TabsTrigger>
          <TabsTrigger value="active">Actives</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune évaluation</p>
                <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une évaluation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEvaluations.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${evaluationTypeConfig[evaluation.evaluation_type].color}`}>
                          {(() => {
                            const Icon = evaluationTypeConfig[evaluation.evaluation_type].icon
                            return <Icon className="h-5 w-5" />
                          })()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{evaluation.title}</h3>
                            <Badge className={evaluationTypeConfig[evaluation.evaluation_type].color}>
                              {evaluationTypeConfig[evaluation.evaluation_type].label}
                            </Badge>
                            {evaluation.plagiarism_check && (
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
                                <Shield className="h-3 w-3 mr-1" />
                                Anti-plagiat
                              </Badge>
                            )}
                            {!evaluation.is_published && (
                              <Badge variant="secondary">Brouillon</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {evaluation.course_code} - {evaluation.course_name}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(evaluation.start_time).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {evaluation.duration_minutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {evaluation.questions_count} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {evaluation.total_points} pts
                            </span>
                          </div>
                          {evaluation.submissions_count > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4" />
                                <span>{evaluation.submissions_count} soumissions</span>
                                <span className="text-muted-foreground">
                                  ({evaluation.graded_count} corrigées)
                                </span>
                              </div>
                              <Progress 
                                value={(evaluation.graded_count / evaluation.submissions_count) * 100} 
                                className="w-48 mt-1 h-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedEvaluation(evaluation)
                              setShowQuestionsDialog(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier questions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedEvaluation(evaluation)
                              fetchSubmissions(evaluation.id)
                              setShowSubmissionsDialog(true)
                            }}>
                              <Users className="h-4 w-4 mr-2" />
                              Voir soumissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!evaluation.is_published && (
                              <DropdownMenuItem onClick={() => handlePublishEvaluation(evaluation.id)}>
                                <Send className="h-4 w-4 mr-2" />
                                Publier
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {
                              setSelectedEvaluation(evaluation)
                              // Exporter les résultats
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              Exporter résultats
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle évaluation</DialogTitle>
            <DialogDescription>
              Créez un examen, TP, projet tutoré ou autre type d'évaluation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={evalForm.title}
                  onChange={(e) => setEvalForm({ ...evalForm, title: e.target.value })}
                  placeholder="Ex: Examen final - Programmation"
                />
              </div>

              <div className="space-y-2">
                <Label>Type d'évaluation *</Label>
                <Select
                  value={evalForm.evaluation_type}
                  onValueChange={(v: EvaluationType) => setEvalForm({ ...evalForm, evaluation_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(evaluationTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cours *</Label>
                <Select
                  value={evalForm.course_id}
                  onValueChange={(v) => setEvalForm({ ...evalForm, course_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={evalForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEvalForm({ ...evalForm, description: e.target.value })}
                  placeholder="Description de l'évaluation..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Date/Heure début *</Label>
                <Input
                  type="datetime-local"
                  value={evalForm.start_time}
                  onChange={(e) => setEvalForm({ ...evalForm, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Date/Heure fin *</Label>
                <Input
                  type="datetime-local"
                  value={evalForm.end_time}
                  onChange={(e) => setEvalForm({ ...evalForm, end_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Durée (minutes)</Label>
                <Input
                  type="number"
                  value={evalForm.duration_minutes}
                  onChange={(e) => setEvalForm({ ...evalForm, duration_minutes: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Total points</Label>
                <Input
                  type="number"
                  value={evalForm.total_points}
                  onChange={(e) => setEvalForm({ ...evalForm, total_points: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Note de passage (%)</Label>
                <Input
                  type="number"
                  value={evalForm.passing_score}
                  onChange={(e) => setEvalForm({ ...evalForm, passing_score: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tentatives max</Label>
                <Input
                  type="number"
                  value={evalForm.max_attempts}
                  onChange={(e) => setEvalForm({ ...evalForm, max_attempts: parseInt(e.target.value) })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Instructions</Label>
                <Textarea
                  value={evalForm.instructions}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEvalForm({ ...evalForm, instructions: e.target.value })}
                  placeholder="Instructions pour les étudiants..."
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Soumission de fichier</Label>
                    <p className="text-xs text-muted-foreground">Pour TP, projets...</p>
                  </div>
                  <Switch
                    checked={evalForm.requires_file_upload}
                    onCheckedChange={(v) => setEvalForm({ ...evalForm, requires_file_upload: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-600" />
                      Anti-plagiat
                    </Label>
                    <p className="text-xs text-muted-foreground">Vérification automatique</p>
                  </div>
                  <Switch
                    checked={evalForm.plagiarism_check}
                    onCheckedChange={(v) => setEvalForm({ ...evalForm, plagiarism_check: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Mélanger questions</Label>
                    <p className="text-xs text-muted-foreground">Ordre aléatoire</p>
                  </div>
                  <Switch
                    checked={evalForm.shuffle_questions}
                    onCheckedChange={(v) => setEvalForm({ ...evalForm, shuffle_questions: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Afficher résultats</Label>
                    <p className="text-xs text-muted-foreground">Après soumission</p>
                  </div>
                  <Switch
                    checked={evalForm.show_results}
                    onCheckedChange={(v) => setEvalForm({ ...evalForm, show_results: v })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateEvaluation}>
              Créer et ajouter questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Soumissions */}
      <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Soumissions - {selectedEvaluation?.title}</DialogTitle>
            <DialogDescription>
              {submissions.length} soumissions
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Date soumission</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Anti-plagiat</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.student_name}</TableCell>
                    <TableCell>{submission.student_matricule}</TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {Math.floor(submission.time_spent / 60)}min
                    </TableCell>
                    <TableCell>
                      {selectedEvaluation?.plagiarism_check ? (
                        <div className="flex items-center gap-2">
                          {getPlagiarismBadge(submission.plagiarism_status, submission.plagiarism_score)}
                          {submission.plagiarism_status === 'PENDING' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRunPlagiarismCheck(submission.id)}
                            >
                              <FileSearch className="h-4 w-4" />
                            </Button>
                          )}
                          {submission.plagiarism_score && submission.plagiarism_score > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission)
                                fetchPlagiarismReport(submission.id)
                                setShowPlagiarismDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.is_graded ? (
                        <span className="font-medium">{submission.score}/{selectedEvaluation?.total_points}</span>
                      ) : (
                        <Badge variant="outline">Non corrigé</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setGradingForm({ score: submission.score || 0, feedback: '' })
                            setShowGradingDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {submission.files && submission.files.length > 0 && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmissionsDialog(false)}>
              Fermer
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rapport Plagiat */}
      <Dialog open={showPlagiarismDialog} onOpenChange={setShowPlagiarismDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Rapport Anti-Plagiat
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission?.student_name} - {selectedSubmission?.student_matricule}
            </DialogDescription>
          </DialogHeader>

          {plagiarismReport && (
            <div className="space-y-6">
              {/* Score global */}
              <div className="text-center p-6 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Score de similarité</p>
                <p className={`text-5xl font-bold ${
                  plagiarismReport.overall_score < 15 ? 'text-green-600' :
                  plagiarismReport.overall_score < 40 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {plagiarismReport.overall_score}%
                </p>
                <p className="text-sm mt-2">
                  {plagiarismReport.overall_score < 15 ? 'Travail original' :
                   plagiarismReport.overall_score < 40 ? 'Quelques similarités détectées' :
                   'Plagiat probable détecté'}
                </p>
              </div>

              {/* Sources détectées */}
              {plagiarismReport.sources.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Sources détectées</h4>
                  <div className="space-y-2">
                    {plagiarismReport.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{source.source}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            "{source.matched_text}"
                          </p>
                        </div>
                        <Badge className={source.similarity > 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                          {source.similarity}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections suspectes */}
              {plagiarismReport.suspicious_sections.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Passages suspects</h4>
                  <div className="space-y-2">
                    {plagiarismReport.suspicious_sections.map((section, index) => (
                      <Alert key={index} variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="italic">"{section.text}"</p>
                          <p className="text-sm mt-1">
                            Similarité: {section.similarity}%
                            {section.source && ` - Source: ${section.source}`}
                          </p>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlagiarismDialog(false)}>
              Fermer
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Télécharger rapport
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Notation */}
      <Dialog open={showGradingDialog} onOpenChange={setShowGradingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Noter la soumission</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.student_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSubmission?.plagiarism_score && selectedSubmission.plagiarism_score > 30 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Attention: Plagiat détecté</AlertTitle>
                <AlertDescription>
                  Un taux de similarité de {selectedSubmission.plagiarism_score}% a été détecté.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Note (/{selectedEvaluation?.total_points})</Label>
              <Input
                type="number"
                value={gradingForm.score}
                onChange={(e) => setGradingForm({ ...gradingForm, score: parseFloat(e.target.value) })}
                min={0}
                max={selectedEvaluation?.total_points}
              />
            </div>

            <div className="space-y-2">
              <Label>Commentaires</Label>
              <Textarea
                value={gradingForm.feedback}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                placeholder="Commentaires pour l'étudiant..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGradingDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleGradeSubmission}>
              Enregistrer la note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
