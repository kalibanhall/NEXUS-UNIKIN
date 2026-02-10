'use client'

import { useState, useEffect } from 'react'
import { 
  FileQuestion,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  Timer,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
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
  attempts_used: number
  best_score: number
  availability_status: string
  instructions: string
}

interface Question {
  id: string
  question_text: string
  question_type: string
  options: string[]
  points: number
  image_url?: string
}

interface ExamSession {
  exam: Exam
  attempt_id: string
  questions: Question[]
  time_remaining: number
}

export default function StudentExamsPage() {
  const { user, studentInfo } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('available')
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [examSession, setExamSession] = useState<ExamSession | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [examResult, setExamResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (studentInfo?.id) {
      fetchExams()
    }
  }, [studentInfo])

  useEffect(() => {
    if (examSession && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            handleSubmitExam()
            return 0
          }
          return prev - 1000
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [examSession, timeRemaining])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/exams?action=available&student_id=${studentInfo?.id}`)
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

  const handleStartExam = async () => {
    if (!selectedExam) return

    try {
      const response = await fetch(`/api/exams?action=start&exam_id=${selectedExam.id}&student_id=${studentInfo?.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setExamSession(data)
        setTimeRemaining(data.time_remaining)
        setAnswers({})
        setShowInstructions(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Impossible de démarrer l'examen")
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleSubmitExam = async () => {
    if (!examSession || submitting) return

    setSubmitting(true)
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          attemptId: examSession.attempt_id,
          studentId: studentInfo?.id,
          answers: formattedAnswers
        })
      })

      if (response.ok) {
        const result = await response.json()
        setExamResult(result)
        setShowResults(true)
        setExamSession(null)
        fetchExams()
        toast.success('Examen soumis avec succès!')
      } else {
        toast.error('Erreur lors de la soumission')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-100 text-green-700">Disponible</Badge>
      case 'UPCOMING':
        return <Badge className="bg-blue-100 text-blue-700">À venir</Badge>
      case 'CLOSED':
        return <Badge variant="secondary">Terminé</Badge>
      case 'MAX_ATTEMPTS':
        return <Badge variant="outline">Tentatives épuisées</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getExamTypeBadge = (type: string) => {
    switch (type) {
      case 'EXAM': return <Badge>Examen</Badge>
      case 'QUIZ': return <Badge variant="secondary">Quiz</Badge>
      case 'TEST': return <Badge variant="outline">Test</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  const availableExams = exams.filter(e => e.availability_status === 'AVAILABLE')
  const upcomingExams = exams.filter(e => e.availability_status === 'UPCOMING')
  const completedExams = exams.filter(e => e.attempts_used > 0)

  // Mode examen en cours
  if (examSession) {
    const currentQuestionIndex = Object.keys(answers).length
    const totalQuestions = examSession.questions.length
    const progress = (currentQuestionIndex / totalQuestions) * 100

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header fixe */}
        <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b z-50 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-semibold">{examSession.exam.title}</h1>
              <p className="text-sm text-muted-foreground">{examSession.exam.course_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300000 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Timer className="h-5 w-5" />
                <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
              </div>
              <Button onClick={handleSubmitExam} disabled={submitting}>
                {submitting ? 'Soumission...' : 'Soumettre'}
              </Button>
            </div>
          </div>
          <div className="max-w-4xl mx-auto mt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Object.keys(answers).length} / {totalQuestions} questions répondues
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="pt-32 pb-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {examSession.questions.map((question, index) => (
              <Card key={question.id} className={answers[question.id] ? 'border-green-300' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Question {index + 1}</Badge>
                    <Badge>{question.points} pts</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{question.question_text}</CardTitle>
                </CardHeader>
                <CardContent>
                  {question.image_url && (
                    <img src={question.image_url} alt="Question" className="max-w-md mb-4 rounded" />
                  )}

                  {question.question_type === 'MCQ' && (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                    >
                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                            <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                            <Label htmlFor={`${question.id}-${optIndex}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {question.question_type === 'TRUE_FALSE' && (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                    >
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 flex-1">
                          <RadioGroupItem value="true" id={`${question.id}-true`} />
                          <Label htmlFor={`${question.id}-true`} className="cursor-pointer">Vrai</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 flex-1">
                          <RadioGroupItem value="false" id={`${question.id}-false`} />
                          <Label htmlFor={`${question.id}-false`} className="cursor-pointer">Faux</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  )}

                  {question.question_type === 'MULTIPLE_SELECT' && (
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                          <Checkbox
                            id={`${question.id}-${optIndex}`}
                            checked={(answers[question.id] || []).includes(option)}
                            onCheckedChange={(checked) => {
                              const current = answers[question.id] || []
                              if (checked) {
                                setAnswers({ ...answers, [question.id]: [...current, option] })
                              } else {
                                setAnswers({ ...answers, [question.id]: current.filter((o: string) => o !== option) })
                              }
                            }}
                          />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'SHORT_ANSWER' && (
                    <Input
                      placeholder="Votre réponse..."
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    />
                  )}

                  {question.question_type === 'ESSAY' && (
                    <Textarea
                      placeholder="Rédigez votre réponse..."
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      rows={6}
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            <Card className="bg-primary/5 border-primary">
              <CardContent className="p-6 text-center">
                <p className="text-lg mb-4">
                  Vous avez répondu à <strong>{Object.keys(answers).length}</strong> questions sur <strong>{totalQuestions}</strong>
                </p>
                <Button size="lg" onClick={handleSubmitExam} disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Soumission en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Soumettre l'examen
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileQuestion className="h-8 w-8 text-primary" />
          Mes Examens
        </h1>
        <p className="text-muted-foreground mt-1">
          Passez vos examens et quiz en ligne
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableExams.length}</p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingExams.length}</p>
                <p className="text-sm text-muted-foreground">À venir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedExams.length}</p>
                <p className="text-sm text-muted-foreground">Passés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {completedExams.length > 0 
                    ? Math.round(completedExams.reduce((acc, e) => acc + e.best_score, 0) / completedExams.length)
                    : '-'}%
                </p>
                <p className="text-sm text-muted-foreground">Moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">
            Disponibles ({availableExams.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            À venir ({upcomingExams.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Passés ({completedExams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : availableExams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun examen disponible pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableExams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      {getExamTypeBadge(exam.exam_type)}
                      {getStatusBadge(exam.availability_status)}
                    </div>
                    <CardTitle className="mt-2">{exam.title}</CardTitle>
                    <CardDescription>{exam.course_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.total_points} points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Seuil: {exam.passing_score}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.attempts_used}/{exam.max_attempts} tentatives</span>
                      </div>
                    </div>
                    {exam.attempts_used > 0 && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          Meilleur score: <span className="font-bold">{exam.best_score}%</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedExam(exam)
                        setShowInstructions(true)
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {exam.attempts_used > 0 ? 'Réessayer' : 'Commencer'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingExams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun examen programmé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <Card key={exam.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getExamTypeBadge(exam.exam_type)}
                          <Badge variant="outline">{exam.course_code}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{exam.title}</h3>
                        <p className="text-muted-foreground">{exam.course_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {new Date(exam.start_time).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Durée: {exam.duration_minutes} min • {exam.total_points} pts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedExams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun examen passé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedExams.map((exam) => (
                <Card key={exam.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getExamTypeBadge(exam.exam_type)}
                          <Badge variant="outline">{exam.course_code}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{exam.title}</h3>
                        <p className="text-muted-foreground">{exam.course_name}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          exam.best_score >= exam.passing_score ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {exam.best_score}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {exam.attempts_used} tentative(s)
                        </p>
                        {exam.best_score >= exam.passing_score ? (
                          <Badge className="bg-green-100 text-green-700 mt-1">Réussi</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 mt-1">Échoué</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Instructions */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedExam?.title}</DialogTitle>
            <DialogDescription>{selectedExam?.course_name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Durée</p>
                <p className="font-semibold">{selectedExam?.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="font-semibold">{selectedExam?.total_points} pts</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seuil de réussite</p>
                <p className="font-semibold">{selectedExam?.passing_score}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tentatives restantes</p>
                <p className="font-semibold">
                  {(selectedExam?.max_attempts || 0) - (selectedExam?.attempts_used || 0)}
                </p>
              </div>
            </div>

            {selectedExam?.instructions && (
              <div>
                <h4 className="font-semibold mb-2">Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedExam.instructions}
                </p>
              </div>
            )}

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Important</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Une fois commencé, le chronomètre ne peut pas être mis en pause</li>
                    <li>Ne fermez pas cette fenêtre pendant l'examen</li>
                    <li>Vos réponses sont enregistrées automatiquement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstructions(false)}>
              Annuler
            </Button>
            <Button onClick={handleStartExam}>
              <Play className="h-4 w-4 mr-2" />
              Commencer l'examen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Résultats */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résultat de l'examen</DialogTitle>
          </DialogHeader>

          <div className="text-center py-6">
            {examResult?.score >= (selectedExam?.passing_score || 50) ? (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600">Félicitations!</h3>
                <p className="text-muted-foreground">Vous avez réussi l'examen</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-600">Dommage!</h3>
                <p className="text-muted-foreground">Vous n'avez pas atteint le seuil de réussite</p>
              </>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-4xl font-bold">{examResult?.score || 0} pts</p>
              <p className="text-sm text-muted-foreground">
                Temps: {examResult?.time_spent || 0} minutes
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowResults(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
