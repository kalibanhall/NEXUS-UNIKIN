'use client'

import { useState, useEffect } from 'react'
import { 
  FileText,
  Users,
  BarChart3,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  PieChart,
  Star,
  MessageSquare,
  Send,
  AlertCircle,
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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

interface Survey {
  id: string
  title: string
  description: string
  survey_type: string
  faculty_name: string | null
  status: string
  start_date: string
  end_date: string
  response_count: number
  target_audience: string
  is_anonymous: boolean
  questions: SurveyQuestion[]
  already_responded?: boolean
}

interface SurveyQuestion {
  id: string
  text: string
  type: string
  required: boolean
  options: string[]
}

interface SurveyResponse {
  id: string
  survey_id: string
  answers: any
  submitted_at: string
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([])
  const [myResponses, setMyResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('manage')
  const [showNewSurveyDialog, setShowNewSurveyDialog] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [showStatsDialog, setShowStatsDialog] = useState(false)
  const [surveyStats, setSurveyStats] = useState<any>(null)
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, any>>({})
  
  // Form state for new survey
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    surveyType: 'GENERAL',
    targetAudience: 'ALL',
    startDate: '',
    endDate: '',
    isAnonymous: true,
    questions: [{ id: 'q_1', text: '', type: 'RATING', required: true, options: [] }]
  })

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchSurveys()
    } else if (activeTab === 'available') {
      fetchAvailableSurveys()
    } else if (activeTab === 'my_responses') {
      fetchMyResponses()
    }
  }, [activeTab])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/surveys')
      if (response.ok) {
        const data = await response.json()
        setSurveys(data.surveys || [])
      }
    } catch (error) {
      console.error('Error fetching surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSurveys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/surveys?action=available')
      if (response.ok) {
        const data = await response.json()
        setAvailableSurveys(data.surveys || [])
      }
    } catch (error) {
      console.error('Error fetching available surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyResponses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/surveys?action=my_responses')
      if (response.ok) {
        const data = await response.json()
        setMyResponses(data.responses || [])
      }
    } catch (error) {
      console.error('Error fetching responses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSurveyStats = async (surveyId: string) => {
    try {
      const response = await fetch(`/api/surveys?action=stats&id=${surveyId}`)
      if (response.ok) {
        const data = await response.json()
        setSurveyStats(data)
        setShowStatsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCreateSurvey = async () => {
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSurvey)
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Enquête créée avec succès')
        setShowNewSurveyDialog(false)
        fetchSurveys()
        setNewSurvey({
          title: '',
          description: '',
          surveyType: 'GENERAL',
          targetAudience: 'ALL',
          startDate: '',
          endDate: '',
          isAnonymous: true,
          questions: [{ id: 'q_1', text: '', type: 'RATING', required: true, options: [] }]
        })
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }

  const handlePublish = async (surveyId: string) => {
    try {
      const response = await fetch('/api/surveys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, action: 'publish' })
      })

      if (response.ok) {
        toast.success('Enquête publiée')
        fetchSurveys()
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const handleSubmitResponse = async () => {
    if (!selectedSurvey) return

    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond',
          surveyId: selectedSurvey.id,
          answers: currentAnswers
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        setSelectedSurvey(null)
        setCurrentAnswers({})
        fetchAvailableSurveys()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
    }
  }

  const addQuestion = () => {
    setNewSurvey({
      ...newSurvey,
      questions: [
        ...newSurvey.questions,
        { id: `q_${newSurvey.questions.length + 1}`, text: '', type: 'RATING', required: false, options: [] }
      ]
    })
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const questions = [...newSurvey.questions]
    questions[index] = { ...questions[index], [field]: value }
    setNewSurvey({ ...newSurvey, questions })
  }

  const removeQuestion = (index: number) => {
    if (newSurvey.questions.length > 1) {
      setNewSurvey({
        ...newSurvey,
        questions: newSurvey.questions.filter((_, i) => i !== index)
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline">Brouillon</Badge>
      case 'PUBLISHED':
        return <Badge className="bg-green-100 text-green-700">Publiée</Badge>
      case 'CLOSED':
        return <Badge className="bg-gray-100 text-gray-700">Clôturée</Badge>
      case 'ARCHIVED':
        return <Badge variant="secondary">Archivée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSurveyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'GENERAL': 'Générale',
      'COURSE': 'Évaluation cours',
      'TEACHER': 'Évaluation enseignant',
      'SERVICE': 'Évaluation services',
      'SATISFACTION': 'Satisfaction',
      'EVENT': 'Événement'
    }
    return labels[type] || type
  }

  const questionTypes = [
    { value: 'RATING', label: 'Note (1-5)' },
    { value: 'SCALE', label: 'Échelle (1-10)' },
    { value: 'CHOICE', label: 'Choix unique' },
    { value: 'MULTIPLE_CHOICE', label: 'Choix multiples' },
    { value: 'TEXT', label: 'Texte libre' },
    { value: 'YES_NO', label: 'Oui/Non' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Enquêtes & Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les enquêtes de satisfaction et collectez les retours
          </p>
        </div>
        <Button onClick={() => setShowNewSurveyDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Enquête
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Gérer les enquêtes</TabsTrigger>
          <TabsTrigger value="available">Participer</TabsTrigger>
          <TabsTrigger value="my_responses">Mes réponses</TabsTrigger>
        </TabsList>

        {/* Gestion des enquêtes */}
        <TabsContent value="manage" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : surveys.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune enquête créée</p>
                <Button className="mt-4" onClick={() => setShowNewSurveyDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une enquête
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {surveys.map((survey) => (
                <Card key={survey.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{survey.title}</h3>
                          {getStatusBadge(survey.status)}
                          {survey.is_anonymous && (
                            <Badge variant="outline" className="text-xs">Anonyme</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {survey.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline">{getSurveyTypeLabel(survey.survey_type)}</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(survey.start_date).toLocaleDateString('fr-FR')} - {new Date(survey.end_date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {survey.response_count || 0} réponses
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchSurveyStats(survey.id)}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Stats
                        </Button>
                        {survey.status === 'DRAFT' && (
                          <Button 
                            size="sm"
                            onClick={() => handlePublish(survey.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Publier
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Participer */}
        <TabsContent value="available" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : availableSurveys.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Aucune enquête en cours pour vous</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSurveys.map((survey) => (
                <Card key={survey.id} className={survey.already_responded ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">{getSurveyTypeLabel(survey.survey_type)}</Badge>
                      {survey.already_responded && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Répondu
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Jusqu'au {new Date(survey.end_date).toLocaleDateString('fr-FR')}
                      </span>
                      {survey.is_anonymous && (
                        <span className="text-green-600">Anonyme</span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      disabled={survey.already_responded}
                      onClick={() => setSelectedSurvey(survey)}
                    >
                      {survey.already_responded ? 'Déjà répondu' : 'Participer'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Mes réponses */}
        <TabsContent value="my_responses" className="space-y-4">
          {myResponses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Vous n'avez pas encore répondu à des enquêtes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myResponses.map((response: any) => (
                <Card key={response.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{response.title}</h3>
                        <p className="text-sm text-muted-foreground">{response.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-700">Complété</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(response.submitted_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Nouvelle Enquête */}
      <Dialog open={showNewSurveyDialog} onOpenChange={setShowNewSurveyDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle enquête</DialogTitle>
            <DialogDescription>
              Définissez les paramètres et les questions de votre enquête
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Titre</Label>
              <Input 
                placeholder="Titre de l'enquête"
                value={newSurvey.title}
                onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Description de l'enquête..."
                value={newSurvey.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewSurvey({ ...newSurvey, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type d'enquête</Label>
                <Select 
                  value={newSurvey.surveyType}
                  onValueChange={(v) => setNewSurvey({ ...newSurvey, surveyType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">Générale</SelectItem>
                    <SelectItem value="COURSE">Évaluation cours</SelectItem>
                    <SelectItem value="TEACHER">Évaluation enseignant</SelectItem>
                    <SelectItem value="SERVICE">Évaluation services</SelectItem>
                    <SelectItem value="SATISFACTION">Satisfaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Public cible</Label>
                <Select 
                  value={newSurvey.targetAudience}
                  onValueChange={(v) => setNewSurvey({ ...newSurvey, targetAudience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous</SelectItem>
                    <SelectItem value="STUDENT">Étudiants</SelectItem>
                    <SelectItem value="TEACHER">Enseignants</SelectItem>
                    <SelectItem value="EMPLOYEE">Personnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date de début</Label>
                <Input 
                  type="date"
                  value={newSurvey.startDate}
                  onChange={(e) => setNewSurvey({ ...newSurvey, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Date de fin</Label>
                <Input 
                  type="date"
                  value={newSurvey.endDate}
                  onChange={(e) => setNewSurvey({ ...newSurvey, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="anonymous"
                checked={newSurvey.isAnonymous}
                onCheckedChange={(checked: boolean | 'indeterminate') => setNewSurvey({ ...newSurvey, isAnonymous: checked === true })}
              />
              <label htmlFor="anonymous" className="text-sm">
                Réponses anonymes
              </label>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Questions</Label>
                <Button variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              <div className="space-y-4">
                {newSurvey.questions.map((question, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="font-medium text-muted-foreground mt-2">
                          Q{index + 1}
                        </span>
                        <div className="flex-1 space-y-3">
                          <Input 
                            placeholder="Texte de la question"
                            value={question.text}
                            onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          />
                          <div className="flex items-center gap-4">
                            <Select 
                              value={question.type}
                              onValueChange={(v) => updateQuestion(index, 'type', v)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {questionTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                checked={question.required}
                                onCheckedChange={(checked: boolean | 'indeterminate') => updateQuestion(index, 'required', checked === true)}
                              />
                              <span className="text-sm">Obligatoire</span>
                            </div>
                          </div>
                          {(question.type === 'CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                            <Textarea 
                              placeholder="Options (une par ligne)"
                              value={question.options?.join('\n') || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion(index, 'options', e.target.value.split('\n'))}
                            />
                          )}
                        </div>
                        {newSurvey.questions.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => removeQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSurveyDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateSurvey}>
              Créer l'enquête
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Répondre à l'enquête */}
      <Dialog open={!!selectedSurvey && !selectedSurvey.already_responded} onOpenChange={() => setSelectedSurvey(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSurvey?.title}</DialogTitle>
            <DialogDescription>{selectedSurvey?.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {selectedSurvey?.questions?.map((question: any, index: number) => (
              <div key={question.id} className="space-y-3">
                <Label className="flex items-center gap-2">
                  <span className="font-medium">Q{index + 1}.</span>
                  {question.text}
                  {question.required && <span className="text-red-500">*</span>}
                </Label>
                
                {question.type === 'RATING' && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={currentAnswers[question.id] === rating ? 'default' : 'outline'}
                        className="w-12 h-12"
                        onClick={() => setCurrentAnswers({ ...currentAnswers, [question.id]: rating })}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                )}
                
                {question.type === 'SCALE' && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <Button
                        key={rating}
                        variant={currentAnswers[question.id] === rating ? 'default' : 'outline'}
                        className="w-10 h-10 p-0"
                        onClick={() => setCurrentAnswers({ ...currentAnswers, [question.id]: rating })}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                )}
                
                {question.type === 'TEXT' && (
                  <Textarea
                    placeholder="Votre réponse..."
                    value={currentAnswers[question.id] || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentAnswers({ ...currentAnswers, [question.id]: e.target.value })}
                  />
                )}
                
                {question.type === 'YES_NO' && (
                  <RadioGroup
                    value={currentAnswers[question.id]}
                    onValueChange={(v: string) => setCurrentAnswers({ ...currentAnswers, [question.id]: v })}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`${question.id}_yes`} />
                        <Label htmlFor={`${question.id}_yes`}>Oui</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`${question.id}_no`} />
                        <Label htmlFor={`${question.id}_no`}>Non</Label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
                
                {question.type === 'CHOICE' && question.options && (
                  <RadioGroup
                    value={currentAnswers[question.id]}
                    onValueChange={(v: string) => setCurrentAnswers({ ...currentAnswers, [question.id]: v })}
                  >
                    {question.options.map((option: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}_${i}`} />
                        <Label htmlFor={`${question.id}_${i}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedSurvey(null)
              setCurrentAnswers({})
            }}>
              Annuler
            </Button>
            <Button onClick={handleSubmitResponse}>
              <Send className="h-4 w-4 mr-2" />
              Envoyer mes réponses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Statistiques */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Statistiques de l'enquête</DialogTitle>
            <DialogDescription>
              {surveyStats?.survey?.title} - {surveyStats?.totalResponses} réponses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {surveyStats?.questionStats?.map((qStat: any, index: number) => (
              <Card key={qStat.questionId}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">
                    Q{index + 1}. {qStat.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(qStat.questionType === 'RATING' || qStat.questionType === 'SCALE') && (
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-primary">
                        {qStat.average}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Moyenne sur {qStat.questionType === 'RATING' ? '5' : '10'}</p>
                        <p>Min: {qStat.min} - Max: {qStat.max}</p>
                      </div>
                    </div>
                  )}
                  {qStat.distribution && (
                    <div className="space-y-2">
                      {qStat.distribution.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-24 text-sm truncate">{item.choice}</span>
                          <Progress 
                            value={(item.count / surveyStats.totalResponses) * 100} 
                            className="flex-1 h-4"
                          />
                          <span className="w-16 text-sm text-right">
                            {item.count} ({((item.count / surveyStats.totalResponses) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {qStat.sampleResponses && (
                    <div className="space-y-2">
                      {qStat.sampleResponses.slice(0, 5).map((response: string, i: number) => (
                        <p key={i} className="text-sm p-2 bg-muted rounded">
                          "{response}"
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
