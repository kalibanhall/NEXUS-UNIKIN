'use client'

import { useState, useEffect } from 'react'
import { 
  FileQuestion,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Copy,
  Search,
  Filter,
  Calendar,
  Award,
  FileText,
  Settings,
  ChevronRight,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

interface Exam {
  id: string
  title: string
  description: string
  exam_type: string
  course_code: string
  course_name: string
  start_time: string
  end_time: string
  duration_minutes: number
  total_points: number
  passing_score: number
  max_attempts: number
  is_published: boolean
  questions_count: number
  participants_count: number
}

interface Question {
  id?: string
  question_text: string
  question_type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'MULTIPLE_SELECT'
  options: string[]
  correct_answer: string | string[]
  points: number
  explanation?: string
}

interface ExamStats {
  total_participants: number
  average_score: number
  highest_score: number
  lowest_score: number
  passed_count: number
  total_attempts: number
}

export default function TeacherExamsPage() {
  const { user } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false)
  const [showStatsDialog, setShowStatsDialog] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [examStats, setExamStats] = useState<ExamStats | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [activeTab, setActiveTab] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')

  const [examForm, setExamForm] = useState({
    courseId: '',
    title: '',
    description: '',
    examType: 'EXAM',
    startTime: '',
    endTime: '',
    durationMinutes: 60,
    totalPoints: 100,
    passingScore: 50,
    maxAttempts: 1,
    instructions: '',
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true
  })

  const [questionForm, setQuestionForm] = useState<Question>({
    question_text: '',
    question_type: 'MCQ',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    explanation: ''
  })

  useEffect(() => {
    fetchExams()
    fetchCourses()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/exams?action=my_exams&teacher_id=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setExams(data.exams || [])
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses?action=my_courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchExamStats = async (examId: string) => {
    try {
      const response = await fetch(`/api/exams?action=statistics&exam_id=${examId}`)
      if (response.ok) {
        const data = await response.json()
        setExamStats(data.statistics)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCreateExam = async () => {
    if (!examForm.courseId || !examForm.title || !examForm.startTime || !examForm.endTime) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...examForm,
          questions: []
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Examen créé avec succès')
        setShowCreateDialog(false)
        resetExamForm()
        fetchExams()
        
        // Ouvrir directement le dialog des questions
        setSelectedExam({ id: data.exam_id } as Exam)
        setShowQuestionsDialog(true)
      } else {
        toast.error('Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleAddQuestion = async () => {
    if (!questionForm.question_text || !selectedExam) {
      toast.error('Veuillez entrer la question')
      return
    }

    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_question',
          examId: selectedExam.id,
          questionText: questionForm.question_text,
          questionType: questionForm.question_type,
          options: questionForm.options.filter(o => o.trim() !== ''),
          correctAnswer: questionForm.correct_answer,
          points: questionForm.points,
          explanation: questionForm.explanation
        })
      })

      if (response.ok) {
        toast.success('Question ajoutée')
        setQuestions([...questions, { ...questionForm, id: Date.now().toString() }])
        resetQuestionForm()
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const handleTogglePublish = async (exam: Exam) => {
    try {
      const response = await fetch('/api/exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_publish',
          examId: exam.id
        })
      })

      if (response.ok) {
        toast.success(exam.is_published ? 'Examen dépublié' : 'Examen publié')
        fetchExams()
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen?')) return

    try {
      const response = await fetch(`/api/exams?exam_id=${examId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Examen supprimé')
        fetchExams()
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const resetExamForm = () => {
    setExamForm({
      courseId: '',
      title: '',
      description: '',
      examType: 'EXAM',
      startTime: '',
      endTime: '',
      durationMinutes: 60,
      totalPoints: 100,
      passingScore: 50,
      maxAttempts: 1,
      instructions: '',
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true
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

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getExamTypeBadge = (type: string) => {
    switch (type) {
      case 'EXAM': return <Badge>Examen</Badge>
      case 'QUIZ': return <Badge variant="secondary">Quiz</Badge>
      case 'TEST': return <Badge variant="outline">Test</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  const getExamStatus = (exam: Exam) => {
    const now = new Date()
    const start = new Date(exam.start_time)
    const end = new Date(exam.end_time)

    if (!exam.is_published) {
      return <Badge variant="secondary">Brouillon</Badge>
    }
    if (now < start) {
      return <Badge className="bg-blue-100 text-blue-700">Programmé</Badge>
    }
    if (now >= start && now <= end) {
      return <Badge className="bg-green-100 text-green-700">En cours</Badge>
    }
    return <Badge variant="outline">Terminé</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileQuestion className="h-8 w-8 text-primary" />
            Examens & Quiz
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez et gérez vos examens et quiz en ligne
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel examen
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{exams.length}</p>
                <p className="text-sm text-muted-foreground">Total examens</p>
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
                  {exams.filter(e => e.is_published).length}
                </p>
                <p className="text-sm text-muted-foreground">Publiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exams.filter(e => {
                    const now = new Date()
                    return now >= new Date(e.start_time) && now <= new Date(e.end_time)
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exams.reduce((acc, e) => acc + (e.participants_count || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Participants total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un examen..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="EXAM">Examens</SelectItem>
                <SelectItem value="QUIZ">Quiz</SelectItem>
                <SelectItem value="TEST">Tests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des examens */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredExams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun examen trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier examen ou quiz
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un examen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getExamTypeBadge(exam.exam_type)}
                      {getExamStatus(exam)}
                      <Badge variant="outline">{exam.course_code}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{exam.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {exam.course_name}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(exam.start_time).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {exam.questions_count || 0} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {exam.participants_count || 0} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {exam.total_points} pts (Seuil: {exam.passing_score}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedExam(exam)
                        setQuestions([])
                        setShowQuestionsDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Questions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedExam(exam)
                        fetchExamStats(exam.id)
                        setShowStatsDialog(true)
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Stats
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTogglePublish(exam)}>
                          {exam.is_published ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Dépublier
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publier
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteExam(exam.id)}
                        >
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

      {/* Dialog Créer un examen */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel examen</DialogTitle>
            <DialogDescription>
              Configurez les paramètres de base de votre examen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cours *</Label>
                <Select
                  value={examForm.courseId}
                  onValueChange={(v) => setExamForm({ ...examForm, courseId: v })}
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

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={examForm.examType}
                  onValueChange={(v) => setExamForm({ ...examForm, examType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXAM">Examen</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="TEST">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                placeholder="Ex: Examen final - Algorithmique"
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Description de l'examen..."
                value={examForm.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExamForm({ ...examForm, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date/Heure début *</Label>
                <Input
                  type="datetime-local"
                  value={examForm.startTime}
                  onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date/Heure fin *</Label>
                <Input
                  type="datetime-local"
                  value={examForm.endTime}
                  onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Durée (min)</Label>
                <Input
                  type="number"
                  value={examForm.durationMinutes}
                  onChange={(e) => setExamForm({ ...examForm, durationMinutes: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total points</Label>
                <Input
                  type="number"
                  value={examForm.totalPoints}
                  onChange={(e) => setExamForm({ ...examForm, totalPoints: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Seuil (%)</Label>
                <Input
                  type="number"
                  value={examForm.passingScore}
                  onChange={(e) => setExamForm({ ...examForm, passingScore: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tentatives</Label>
                <Input
                  type="number"
                  min={1}
                  value={examForm.maxAttempts}
                  onChange={(e) => setExamForm({ ...examForm, maxAttempts: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                placeholder="Instructions pour les étudiants..."
                value={examForm.instructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExamForm({ ...examForm, instructions: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label>Mélanger questions</Label>
                <Switch
                  checked={examForm.shuffleQuestions}
                  onCheckedChange={(v) => setExamForm({ ...examForm, shuffleQuestions: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label>Mélanger options</Label>
                <Switch
                  checked={examForm.shuffleOptions}
                  onCheckedChange={(v) => setExamForm({ ...examForm, shuffleOptions: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label>Afficher corrections</Label>
                <Switch
                  checked={examForm.showCorrectAnswers}
                  onCheckedChange={(v) => setExamForm({ ...examForm, showCorrectAnswers: v })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateExam}>
              Créer et ajouter des questions
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Questions */}
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gérer les questions - {selectedExam?.title}
            </DialogTitle>
            <DialogDescription>
              Ajoutez et modifiez les questions de votre examen
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="add">
            <TabsList>
              <TabsTrigger value="add">Ajouter une question</TabsTrigger>
              <TabsTrigger value="list">Questions ({questions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de question</Label>
                  <Select
                    value={questionForm.question_type}
                    onValueChange={(v: any) => setQuestionForm({ 
                      ...questionForm, 
                      question_type: v,
                      options: v === 'MCQ' || v === 'MULTIPLE_SELECT' ? ['', '', '', ''] : []
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">Choix multiple (1 réponse)</SelectItem>
                      <SelectItem value="MULTIPLE_SELECT">Sélection multiple</SelectItem>
                      <SelectItem value="TRUE_FALSE">Vrai/Faux</SelectItem>
                      <SelectItem value="SHORT_ANSWER">Réponse courte</SelectItem>
                      <SelectItem value="ESSAY">Rédaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min={1}
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question *</Label>
                <Textarea
                  placeholder="Saisissez votre question..."
                  value={questionForm.question_text}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  rows={3}
                />
              </div>

              {(questionForm.question_type === 'MCQ' || questionForm.question_type === 'MULTIPLE_SELECT') && (
                <div className="space-y-2">
                  <Label>Options de réponse</Label>
                  <div className="space-y-2">
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options]
                            newOptions[index] = e.target.value
                            setQuestionForm({ ...questionForm, options: newOptions })
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOptions = questionForm.options.filter((_, i) => i !== index)
                            setQuestionForm({ ...questionForm, options: newOptions })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestionForm({ 
                        ...questionForm, 
                        options: [...questionForm.options, ''] 
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une option
                    </Button>
                  </div>
                </div>
              )}

              {questionForm.question_type === 'TRUE_FALSE' && (
                <div className="space-y-2">
                  <Label>Réponse correcte</Label>
                  <Select
                    value={questionForm.correct_answer as string}
                    onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Vrai</SelectItem>
                      <SelectItem value="false">Faux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {questionForm.question_type === 'MCQ' && (
                <div className="space-y-2">
                  <Label>Réponse correcte</Label>
                  <Select
                    value={questionForm.correct_answer as string}
                    onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la bonne réponse" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionForm.options.filter(o => o.trim()).map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {questionForm.question_type === 'SHORT_ANSWER' && (
                <div className="space-y-2">
                  <Label>Réponse attendue</Label>
                  <Input
                    placeholder="Réponse exacte attendue"
                    value={questionForm.correct_answer as string}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Explication (optionnel)</Label>
                <Textarea
                  placeholder="Explication affichée après correction..."
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  rows={2}
                />
              </div>

              <Button onClick={handleAddQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter la question
              </Button>
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileQuestion className="h-10 w-10 mx-auto mb-2" />
                  <p>Aucune question ajoutée</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questions.map((q, index) => (
                    <Card key={q.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              Q{index + 1} • {q.points} pts
                            </Badge>
                            <p className="font-medium">{q.question_text}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Type: {q.question_type}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setShowQuestionsDialog(false)}>
              Terminer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Statistiques */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Statistiques - {selectedExam?.title}</DialogTitle>
          </DialogHeader>

          {examStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{examStats.total_participants}</p>
                    <p className="text-sm text-muted-foreground">Participants</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {Math.round(examStats.average_score || 0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Moyenne</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round((examStats.passed_count / examStats.total_participants) * 100) || 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribution des scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm">Plus haut:</span>
                      <Progress value={(examStats.highest_score / 100) * 100} className="flex-1" />
                      <span className="w-16 text-right font-medium">{examStats.highest_score}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm">Moyenne:</span>
                      <Progress value={(examStats.average_score / 100) * 100} className="flex-1" />
                      <span className="w-16 text-right font-medium">{Math.round(examStats.average_score)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm">Plus bas:</span>
                      <Progress value={(examStats.lowest_score / 100) * 100} className="flex-1" />
                      <span className="w-16 text-right font-medium">{examStats.lowest_score}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <p>Pas encore de données statistiques</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatsDialog(false)}>
              Fermer
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Exporter les résultats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
