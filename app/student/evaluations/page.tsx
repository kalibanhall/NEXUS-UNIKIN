'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FileText,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Timer,
  Award,
  BookOpen,
  Send,
  ChevronRight,
  Upload,
  File,
  Laptop,
  Users,
  Briefcase,
  ClipboardCheck,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  Eye,
  Download,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

// Types d'évaluation
type EvaluationType = 'EXAM' | 'QUIZ' | 'TP' | 'TD' | 'PROJECT' | 'ORAL'

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
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED'
  attempt_status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED'
  score?: number
  is_passed?: boolean
  requires_file_upload: boolean
  plagiarism_check: boolean
  max_attempts: number
  attempts_used: number
  instructions?: string
  submission_deadline?: string
}

interface EvaluationAttempt {
  id: string
  evaluation_id: string
  started_at: string
  submitted_at?: string
  score?: number
  plagiarism_score?: number
  status: string
  feedback?: string
}

interface Question {
  id: string
  question_text: string
  question_type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'MULTIPLE_SELECT' | 'FILE_UPLOAD'
  options?: string[]
  points: number
  order_index: number
}

interface SubmissionFile {
  id: string
  file_name: string
  file_url: string
  uploaded_at: string
  plagiarism_score?: number
}

const evaluationTypeConfig: Record<EvaluationType, { label: string; color: string; icon: typeof FileText }> = {
  'EXAM': { label: 'Examen', color: 'bg-red-100 text-red-700', icon: ClipboardCheck },
  'QUIZ': { label: 'Interrogation', color: 'bg-blue-100 text-blue-700', icon: FileText },
  'TP': { label: 'Travaux Pratiques', color: 'bg-green-100 text-green-700', icon: Laptop },
  'TD': { label: 'Travaux Dirigés', color: 'bg-purple-100 text-purple-700', icon: BookOpen },
  'PROJECT': { label: 'Projet Tutoré', color: 'bg-amber-100 text-amber-700', icon: Briefcase },
  'ORAL': { label: 'Oral', color: 'bg-pink-100 text-pink-700', icon: Users },
}

export default function StudentEvaluationsPage() {
  const { user } = useAuth()
  const studentInfo = user?.profile
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // États pour l'évaluation en cours
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)
  
  // États pour passer une évaluation
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // États pour upload de fichiers
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submissionText, setSubmissionText] = useState('')

  // État résultat
  const [attemptResult, setAttemptResult] = useState<EvaluationAttempt | null>(null)

  useEffect(() => {
    fetchEvaluations()
  }, [activeTab])

  useEffect(() => {
    if (timeRemaining > 0 && showEvaluationDialog) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeRemaining, showEvaluationDialog])

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/evaluations?action=${activeTab}&student_id=${studentInfo?.id}`)
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

  const handleStartEvaluation = async () => {
    if (!selectedEvaluation) return

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          evaluationId: selectedEvaluation.id,
          studentId: studentInfo?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentAttemptId(data.attempt_id)
        setQuestions(data.questions || [])
        setTimeRemaining(data.time_remaining / 1000)
        setShowStartDialog(false)
        
        // Si c'est une évaluation avec questions
        if (data.questions && data.questions.length > 0) {
          setShowEvaluationDialog(true)
        } else {
          // Évaluation avec upload de fichier
          setShowSubmitDialog(true)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Impossible de démarrer l\'évaluation')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmitEvaluation = async () => {
    if (!currentAttemptId) return

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          attemptId: currentAttemptId,
          answers: formattedAnswers
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAttemptResult(result)
        setShowEvaluationDialog(false)
        setShowResultDialog(true)
        toast.success('Évaluation soumise avec succès!')
        resetEvaluationState()
      } else {
        toast.error('Erreur lors de la soumission')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleFileSubmit = async () => {
    if (!currentAttemptId || uploadedFiles.length === 0) return

    try {
      const formData = new FormData()
      formData.append('attemptId', currentAttemptId)
      formData.append('text', submissionText)
      uploadedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      const response = await fetch('/api/evaluations/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setAttemptResult(result)
        setShowSubmitDialog(false)
        setShowResultDialog(true)
        toast.success('Travail soumis avec succès!')
        
        if (selectedEvaluation?.plagiarism_check) {
          toast.info('Vérification anti-plagiat en cours...')
        }
        
        resetEvaluationState()
      } else {
        toast.error('Erreur lors de la soumission')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleAutoSubmit = () => {
    toast.warning('Temps écoulé! Soumission automatique...')
    handleSubmitEvaluation()
  }

  const resetEvaluationState = () => {
    setQuestions([])
    setCurrentQuestionIndex(0)
    setAnswers({})
    setCurrentAttemptId(null)
    setUploadedFiles([])
    setSubmissionText('')
    setUploadProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
    fetchEvaluations()
  }

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getEvaluationIcon = (type: EvaluationType) => {
    const Icon = evaluationTypeConfig[type].icon
    return <Icon className="h-5 w-5" />
  }

  const getStatusBadge = (evaluation: Evaluation) => {
    if (evaluation.attempt_status === 'GRADED') {
      return evaluation.is_passed 
        ? <Badge className="bg-green-100 text-green-700">Réussi</Badge>
        : <Badge className="bg-red-100 text-red-700">Échoué</Badge>
    }
    if (evaluation.attempt_status === 'SUBMITTED') {
      return <Badge className="bg-blue-100 text-blue-700">En correction</Badge>
    }
    if (evaluation.status === 'MISSED') {
      return <Badge variant="destructive">Manqué</Badge>
    }
    if (evaluation.status === 'IN_PROGRESS') {
      return <Badge className="bg-amber-100 text-amber-700">En cours</Badge>
    }
    return <Badge variant="outline">À venir</Badge>
  }

  const filteredEvaluations = evaluations
    .filter(e => selectedType === 'all' || e.evaluation_type === selectedType)
    .filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const upcomingEvals = filteredEvaluations.filter(e => e.status === 'UPCOMING' || e.status === 'IN_PROGRESS')
  const completedEvals = filteredEvaluations.filter(e => e.status === 'COMPLETED' || e.status === 'MISSED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Évaluations
        </h1>
        <p className="text-muted-foreground mt-1">
          Examens, TP, Projets tutorés et autres contrôles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingEvals.length}</p>
                <p className="text-sm text-muted-foreground">À venir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {evaluations.filter(e => e.is_passed).length}
                </p>
                <p className="text-sm text-muted-foreground">Réussies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {evaluations.filter(e => e.score).length > 0 
                    ? (evaluations.filter(e => e.score).reduce((acc, e) => acc + (e.score || 0), 0) / 
                       evaluations.filter(e => e.score).length).toFixed(1)
                    : '-'}
                </p>
                <p className="text-sm text-muted-foreground">Moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {evaluations.filter(e => e.status === 'MISSED').length}
                </p>
                <p className="text-sm text-muted-foreground">Manquées</p>
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
          <TabsTrigger value="upcoming">
            À venir ({upcomingEvals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminées ({completedEvals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : upcomingEvals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune évaluation à venir</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingEvals.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${evaluationTypeConfig[evaluation.evaluation_type].color}`}>
                          {getEvaluationIcon(evaluation.evaluation_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{evaluation.title}</h3>
                            <Badge className={evaluationTypeConfig[evaluation.evaluation_type].color}>
                              {evaluationTypeConfig[evaluation.evaluation_type].label}
                            </Badge>
                            {evaluation.plagiarism_check && (
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Anti-plagiat
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {evaluation.course_code} - {evaluation.course_name}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(evaluation.start_time).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              {evaluation.duration_minutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {evaluation.total_points} pts
                            </span>
                          </div>
                          {evaluation.requires_file_upload && (
                            <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
                              <Upload className="h-4 w-4" />
                              Soumission de fichier requise
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(evaluation)}
                        {evaluation.status === 'IN_PROGRESS' && evaluation.attempts_used < evaluation.max_attempts && (
                          <Button onClick={() => {
                            setSelectedEvaluation(evaluation)
                            setShowStartDialog(true)
                          }}>
                            <Play className="h-4 w-4 mr-2" />
                            Commencer
                          </Button>
                        )}
                        {evaluation.status === 'UPCOMING' && (
                          <p className="text-sm text-muted-foreground">
                            Dans {Math.ceil((new Date(evaluation.start_time).getTime() - Date.now()) / (1000 * 60 * 60))}h
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedEvals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune évaluation terminée</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedEvals.map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${evaluationTypeConfig[evaluation.evaluation_type].color}`}>
                          {getEvaluationIcon(evaluation.evaluation_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{evaluation.title}</h3>
                            <Badge className={evaluationTypeConfig[evaluation.evaluation_type].color}>
                              {evaluationTypeConfig[evaluation.evaluation_type].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {evaluation.course_code} - {evaluation.course_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(evaluation.end_time).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {evaluation.score !== undefined ? (
                          <>
                            <p className={`text-2xl font-bold ${evaluation.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                              {evaluation.score}/{evaluation.total_points}
                            </p>
                            <Progress 
                              value={(evaluation.score / evaluation.total_points) * 100} 
                              className="w-32 mt-2"
                            />
                            {getStatusBadge(evaluation)}
                          </>
                        ) : (
                          getStatusBadge(evaluation)
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setSelectedEvaluation(evaluation)
                            // Charger les résultats détaillés
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de démarrage */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Démarrer l'évaluation</DialogTitle>
            <DialogDescription>
              {selectedEvaluation?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Informations importantes</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Durée: <strong>{selectedEvaluation?.duration_minutes} minutes</strong></li>
                  <li>Points total: <strong>{selectedEvaluation?.total_points} pts</strong></li>
                  <li>Note de passage: <strong>{selectedEvaluation?.passing_score}%</strong></li>
                  <li>Tentatives: {selectedEvaluation?.attempts_used}/{selectedEvaluation?.max_attempts}</li>
                </ul>
              </AlertDescription>
            </Alert>

            {selectedEvaluation?.instructions && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Instructions</h4>
                <p className="text-sm text-muted-foreground">{selectedEvaluation.instructions}</p>
              </div>
            )}

            {selectedEvaluation?.plagiarism_check && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Vérification anti-plagiat</AlertTitle>
                <AlertDescription>
                  Cette évaluation est soumise à une vérification anti-plagiat automatique.
                  Tout plagiat détecté entraînera des sanctions.
                </AlertDescription>
              </Alert>
            )}

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                Une fois démarrée, l'évaluation ne peut pas être mise en pause. 
                Le temps commence immédiatement.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleStartEvaluation}>
              <Play className="h-4 w-4 mr-2" />
              Commencer maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'évaluation (questions) */}
      <Dialog open={showEvaluationDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedEvaluation?.title}</DialogTitle>
              <div className={`px-4 py-2 rounded-lg font-mono text-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-primary/10'
              }`}>
                <Timer className="h-4 w-4 inline mr-2" />
                {formatTime(timeRemaining)}
              </div>
            </div>
          </DialogHeader>

          <div className="flex gap-4">
            {/* Navigation questions */}
            <div className="w-48 border-r pr-4">
              <p className="text-sm font-medium mb-3">Questions</p>
              <div className="grid grid-cols-5 gap-1">
                {questions.map((q, index) => (
                  <Button
                    key={q.id}
                    variant={currentQuestionIndex === index ? 'default' : answers[q.id] ? 'secondary' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>✓ Répondu: {Object.keys(answers).length}/{questions.length}</p>
              </div>
            </div>

            {/* Question actuelle */}
            <div className="flex-1">
              {questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge>Question {currentQuestionIndex + 1}/{questions.length}</Badge>
                    <Badge variant="outline">{questions[currentQuestionIndex].points} pts</Badge>
                  </div>
                  
                  <p className="text-lg">{questions[currentQuestionIndex].question_text}</p>

                  {/* Rendu selon le type de question */}
                  {questions[currentQuestionIndex].question_type === 'MCQ' && (
                    <RadioGroup
                      value={answers[questions[currentQuestionIndex].id] as string || ''}
                      onValueChange={(v: string) => handleAnswerChange(questions[currentQuestionIndex].id, v)}
                    >
                      {questions[currentQuestionIndex].options?.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted">
                          <RadioGroupItem value={option} id={`q${currentQuestionIndex}_opt${i}`} />
                          <Label htmlFor={`q${currentQuestionIndex}_opt${i}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {questions[currentQuestionIndex].question_type === 'TRUE_FALSE' && (
                    <RadioGroup
                      value={answers[questions[currentQuestionIndex].id] as string || ''}
                      onValueChange={(v: string) => handleAnswerChange(questions[currentQuestionIndex].id, v)}
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted">
                        <RadioGroupItem value="true" id={`q${currentQuestionIndex}_true`} />
                        <Label htmlFor={`q${currentQuestionIndex}_true`} className="cursor-pointer">Vrai</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted">
                        <RadioGroupItem value="false" id={`q${currentQuestionIndex}_false`} />
                        <Label htmlFor={`q${currentQuestionIndex}_false`} className="cursor-pointer">Faux</Label>
                      </div>
                    </RadioGroup>
                  )}

                  {questions[currentQuestionIndex].question_type === 'SHORT_ANSWER' && (
                    <Input
                      value={answers[questions[currentQuestionIndex].id] as string || ''}
                      onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                      placeholder="Votre réponse..."
                    />
                  )}

                  {questions[currentQuestionIndex].question_type === 'ESSAY' && (
                    <Textarea
                      value={answers[questions[currentQuestionIndex].id] as string || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                      placeholder="Rédigez votre réponse..."
                      rows={8}
                    />
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    >
                      Précédent
                    </Button>
                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                        Suivant
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmitEvaluation} className="bg-green-600 hover:bg-green-700">
                        <Send className="h-4 w-4 mr-2" />
                        Soumettre
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog soumission fichier */}
      <Dialog open={showSubmitDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Soumettre votre travail</DialogTitle>
              {selectedEvaluation?.submission_deadline && (
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Date limite: {new Date(selectedEvaluation.submission_deadline).toLocaleString('fr-FR')}
                </div>
              )}
            </div>
            <DialogDescription>{selectedEvaluation?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedEvaluation?.plagiarism_check && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Vérification anti-plagiat activée</AlertTitle>
                <AlertDescription>
                  Votre soumission sera analysée pour détecter tout plagiat. 
                  Assurez-vous que votre travail est original.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Description / Notes (optionnel)</Label>
              <Textarea
                value={submissionText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSubmissionText(e.target.value)}
                placeholder="Ajoutez une description ou des notes sur votre travail..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Fichiers</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    if (e.target.files) {
                      setUploadedFiles(Array.from(e.target.files))
                    }
                  }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.py,.java,.cpp,.c,.js,.ts"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez ou glissez vos fichiers ici
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Word, PowerPoint, Code source, Archives (max 50MB)
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSubmitDialog(false)
              resetEvaluationState()
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleFileSubmit} 
              disabled={uploadedFiles.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Résultat */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résultat de l'évaluation</DialogTitle>
          </DialogHeader>

          {attemptResult && (
            <div className="text-center space-y-4">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                (attemptResult.score || 0) >= (selectedEvaluation?.passing_score || 50)
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                {(attemptResult.score || 0) >= (selectedEvaluation?.passing_score || 50) ? (
                  <CheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-600" />
                )}
              </div>

              {attemptResult.score !== undefined ? (
                <>
                  <p className="text-3xl font-bold">
                    {attemptResult.score}/{selectedEvaluation?.total_points}
                  </p>
                  <p className={`text-lg ${
                    (attemptResult.score || 0) >= (selectedEvaluation?.passing_score || 50)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {(attemptResult.score || 0) >= (selectedEvaluation?.passing_score || 50)
                      ? 'Félicitations ! Vous avez réussi.'
                      : 'Vous n\'avez pas atteint la note de passage.'}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg">Votre travail a été soumis avec succès.</p>
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez votre note après correction.
                  </p>
                </div>
              )}

              {attemptResult.plagiarism_score !== undefined && (
                <Alert className={attemptResult.plagiarism_score > 30 ? 'border-red-300' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Score de similarité: {attemptResult.plagiarism_score}%</AlertTitle>
                  <AlertDescription>
                    {attemptResult.plagiarism_score > 30
                      ? 'Attention: Un taux de similarité élevé a été détecté.'
                      : 'Votre travail semble original.'}
                  </AlertDescription>
                </Alert>
              )}

              {attemptResult.feedback && (
                <div className="text-left p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Commentaires</h4>
                  <p className="text-sm text-muted-foreground">{attemptResult.feedback}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
