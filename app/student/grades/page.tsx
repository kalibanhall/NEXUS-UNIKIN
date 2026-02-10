'use client'

import { useState, useEffect } from 'react'
import { 
  ClipboardList, TrendingUp, RefreshCw, Award, GraduationCap, Lock, 
  AlertTriangle, CheckCircle, Calendar, FileText, Download, Printer,
  ChevronDown, Filter, Eye, EyeOff, DollarSign, CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from '@/lib/auth/auth-context'

interface DeliberationResult {
  id: number
  academic_year_id: number
  academic_year_name: string
  semester: number
  session: string
  average_score: number
  validated_credits: number
  total_credits: number
  decision: string
  mention?: string
  is_fees_complete: boolean
  can_view: boolean
  deliberation_date?: string
  grades?: CourseGrade[]
}

interface CourseGrade {
  course_id: number
  code: string
  course_name: string
  credits: number
  semester: number
  tp_score: number | null
  td_score: number | null
  exam_score: number | null
  final_score: number | null
  is_validated: boolean
}

interface FinancialStatus {
  totalDue: number
  totalPaid: number
  totalRemaining: number
  percentagePaid: number
  isComplete: boolean
}

export default function StudentGradesPage() {
  const { user } = useAuth()
  const studentInfo = user?.profile
  const [courses, setCourses] = useState<any[]>([])
  const [deliberations, setDeliberations] = useState<any>(null)
  const [financialStatus, setFinancialStatus] = useState<FinancialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notes')
  
  // Filtres pour la délibération
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [selectedSession, setSelectedSession] = useState<string>('all')
  
  // Modal pour grille verrouillée
  const [showLockedModal, setShowLockedModal] = useState(false)

  useEffect(() => {
    if (user?.userId) {
      fetchData()
    }
  }, [user?.userId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les notes
      const gradesResponse = await fetch(`/api/dashboard?role=STUDENT&user_id=${user?.userId}`)
      if (gradesResponse.ok) {
        const data = await gradesResponse.json()
        setCourses(data.courses || [])
      }

      // Récupérer les délibérations
      if (studentInfo?.id) {
        const delibResponse = await fetch(`/api/student-deliberations?student_id=${studentInfo.id}`)
        if (delibResponse.ok) {
          const delibData = await delibResponse.json()
          setDeliberations(delibData)
        }

        // Récupérer la situation financière
        const financeResponse = await fetch(`/api/student-finances?student_id=${studentInfo.id}`)
        if (financeResponse.ok) {
          const financeData = await financeResponse.json()
          setFinancialStatus(financeData.summary)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">-</Badge>
    if (score >= 16) return <Badge className="bg-green-600">A</Badge>
    if (score >= 14) return <Badge className="bg-blue-600">B</Badge>
    if (score >= 12) return <Badge className="bg-yellow-600">C</Badge>
    if (score >= 10) return <Badge className="bg-orange-600">D</Badge>
    return <Badge className="bg-red-600">E</Badge>
  }

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'ADMIS': return <Badge className="bg-green-600">Admis</Badge>
      case 'AJOURNÉ': return <Badge className="bg-orange-600">Ajourné</Badge>
      case 'EXCLUS': return <Badge className="bg-red-600">Exclus</Badge>
      case 'REDOUBLANT': return <Badge className="bg-amber-600">Redoublant</Badge>
      default: return <Badge variant="outline">En attente</Badge>
    }
  }

  const getMentionBadge = (mention: string | undefined) => {
    if (!mention) return null
    switch (mention) {
      case 'DISTINCTION': return <Badge className="bg-purple-600">Distinction</Badge>
      case 'GRANDE_DISTINCTION': return <Badge className="bg-indigo-600">Grande Distinction</Badge>
      case 'PLUS_GRANDE_DISTINCTION': return <Badge className="bg-pink-600">Plus Grande Distinction</Badge>
      case 'SATISFACTION': return <Badge className="bg-blue-600">Satisfaction</Badge>
      default: return null
    }
  }

  const getSessionLabel = (session: string) => {
    switch (session) {
      case 'NORMALE': return 'Session Normale'
      case 'RATTRAPAGE': return 'Session de Rattrapage'
      case 'SPECIALE': return 'Session Spéciale'
      default: return session
    }
  }

  // Filtrer les résultats de délibération
  const getFilteredDeliberations = () => {
    if (!deliberations?.results) return []
    
    return deliberations.results.filter((r: DeliberationResult) => {
      if (selectedYear !== 'all' && r.academic_year_id.toString() !== selectedYear) return false
      if (selectedSemester !== 'all' && r.semester.toString() !== selectedSemester) return false
      if (selectedSession !== 'all' && r.session !== selectedSession) return false
      return true
    })
  }

  // Obtenir les années académiques uniques
  const getUniqueYears = () => {
    if (!deliberations?.results) return []
    const yearMap = new Map<number, { id: number; name: string }>()
    deliberations.results.forEach((r: DeliberationResult) => {
      if (!yearMap.has(r.academic_year_id)) {
        yearMap.set(r.academic_year_id, { id: r.academic_year_id, name: r.academic_year_name })
      }
    })
    return Array.from(yearMap.values())
  }

  // Vérifier si l'étudiant peut voir les résultats
  const canViewDeliberation = financialStatus?.isComplete || (financialStatus?.percentagePaid ?? 0) >= 70

  const average = courses.length > 0
    ? courses.filter(c => c.final_score).reduce((sum, c) => sum + parseFloat(c.final_score || 0), 0) / 
      (courses.filter(c => c.final_score).length || 1)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notes & Résultats</h1>
        <p className="text-gray-500 dark:text-gray-400">Résultats académiques et grilles de délibération</p>
      </div>

      {/* Situation financière rapide */}
      {financialStatus && (
        <Card className={financialStatus.isComplete ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${financialStatus.isComplete ? 'bg-green-100 dark:bg-green-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                  {financialStatus.isComplete ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold ${financialStatus.isComplete ? 'text-green-800 dark:text-green-400' : 'text-amber-800 dark:text-amber-400'}`}>
                    {financialStatus.isComplete ? 'Situation financière en règle' : 'Frais académiques en cours'}
                  </h3>
                  <p className={financialStatus.isComplete ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}>
                    {financialStatus.percentagePaid}% payé - {financialStatus.totalPaid.toLocaleString()} USD / {financialStatus.totalDue.toLocaleString()} USD
                  </p>
                </div>
              </div>
              <div className="text-right">
                {!financialStatus.isComplete && (
                  <p className="text-sm text-amber-600 font-medium">
                    Reste: {financialStatus.totalRemaining.toLocaleString()} USD
                  </p>
                )}
              </div>
            </div>
            {!financialStatus.isComplete && (
              <div className="mt-4">
                <Progress value={financialStatus.percentagePaid} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="notes" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Mes Notes
          </TabsTrigger>
          <TabsTrigger value="deliberation" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Délibération
          </TabsTrigger>
        </TabsList>

        {/* Onglet Notes */}
        <TabsContent value="notes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Moyenne générale</p>
                    <p className="text-3xl font-bold">{average > 0 ? average.toFixed(2) : '-'}/20</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Cours validés</p>
                    <p className="text-3xl font-bold text-green-600">
                      {courses.filter(c => parseFloat(c.final_score) >= 10).length}/{courses.length}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Crédits validés</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {courses.filter(c => parseFloat(c.final_score) >= 10).reduce((sum, c) => sum + (c.credits || 0), 0)}
                    </p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détail des notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead className="text-center">TP</TableHead>
                    <TableHead className="text-center">TD</TableHead>
                    <TableHead className="text-center">Examen</TableHead>
                    <TableHead className="text-center">Moyenne</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Crédits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length > 0 ? courses.map((course, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell className="text-center">{course.tp_score ?? '-'}</TableCell>
                      <TableCell className="text-center">{course.td_score ?? '-'}</TableCell>
                      <TableCell className="text-center">{course.exam_score ?? '-'}</TableCell>
                      <TableCell className="text-center font-bold">
                        <span className={parseFloat(course.final_score) >= 10 ? 'text-green-600' : 'text-red-600'}>
                          {course.final_score ? parseFloat(course.final_score).toFixed(2) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{getGradeBadge(course.final_score ? parseFloat(course.final_score) : null)}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Aucune note disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Délibération */}
        <TabsContent value="deliberation" className="space-y-6">
          {/* Message si pas en règle */}
          {!canViewDeliberation && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/50">
                    <Lock className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 dark:text-red-400">Grille de délibération verrouillée</h3>
                    <p className="text-red-700 dark:text-red-300">
                      Vous devez avoir payé au moins 70% de vos frais académiques pour accéder à la grille de délibération.
                      Actuellement: {financialStatus?.percentagePaid || 0}% payé.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-600 hover:bg-red-100"
                    onClick={() => window.location.href = '/student/finances'}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Voir mes finances
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtres */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Année académique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {getUniqueYears().map((year: any) => (
                      <SelectItem key={year.id} value={year.id.toString()}>{year.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les semestres</SelectItem>
                    <SelectItem value="1">Semestre 1</SelectItem>
                    <SelectItem value="2">Semestre 2</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <FileText className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sessions</SelectItem>
                    <SelectItem value="NORMALE">Session Normale</SelectItem>
                    <SelectItem value="RATTRAPAGE">Session de Rattrapage</SelectItem>
                    <SelectItem value="SPECIALE">Session Spéciale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Grilles de délibération */}
          {canViewDeliberation ? (
            getFilteredDeliberations().length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {getFilteredDeliberations().map((result: DeliberationResult, idx: number) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">{result.academic_year_name}</h3>
                            <p className="text-sm text-gray-500">
                              Semestre {result.semester} - {getSessionLabel(result.session)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getMentionBadge(result.mention)}
                          {getDecisionBadge(result.decision)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6">
                        {/* Stats de la délibération */}
                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-sm text-gray-500">Moyenne</p>
                            <p className="text-2xl font-bold">{result.average_score ? parseFloat(result.average_score.toString()).toFixed(2) : '-'}/20</p>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-sm text-gray-500">Crédits validés</p>
                            <p className="text-2xl font-bold text-green-600">{result.validated_credits}/{result.total_credits}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-sm text-gray-500">Taux de réussite</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {result.total_credits > 0 ? Math.round((result.validated_credits / result.total_credits) * 100) : 0}%
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-sm text-gray-500">Frais</p>
                            <p className="text-2xl font-bold">
                              {result.is_fees_complete ? (
                                <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-5 w-5" /> Soldé</span>
                              ) : (
                                <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="h-5 w-5" /> En cours</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Progression */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progression des crédits</span>
                            <span>{result.validated_credits}/{result.total_credits} crédits</span>
                          </div>
                          <Progress value={(result.validated_credits / result.total_credits) * 100} className="h-3" />
                        </div>

                        {/* Grille des notes */}
                        {result.grades && result.grades.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Grille de délibération</h4>
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                                    <TableHead>Code</TableHead>
                                    <TableHead>Intitulé du cours</TableHead>
                                    <TableHead className="text-center">Crédits</TableHead>
                                    <TableHead className="text-center">TP</TableHead>
                                    <TableHead className="text-center">TD</TableHead>
                                    <TableHead className="text-center">Examen</TableHead>
                                    <TableHead className="text-center">Moyenne</TableHead>
                                    <TableHead className="text-center">Statut</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {result.grades.map((grade: CourseGrade, gIdx: number) => (
                                    <TableRow key={gIdx} className={grade.is_validated ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10'}>
                                      <TableCell className="font-mono text-sm">{grade.code}</TableCell>
                                      <TableCell>{grade.course_name}</TableCell>
                                      <TableCell className="text-center">{grade.credits}</TableCell>
                                      <TableCell className="text-center">{grade.tp_score ?? '-'}</TableCell>
                                      <TableCell className="text-center">{grade.td_score ?? '-'}</TableCell>
                                      <TableCell className="text-center">{grade.exam_score ?? '-'}</TableCell>
                                      <TableCell className="text-center font-bold">
                                        <span className={grade.final_score && Number(grade.final_score) >= 10 ? 'text-green-600' : 'text-red-600'}>
                                          {grade.final_score ? Number(grade.final_score).toFixed(2) : '-'}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {grade.is_validated ? (
                                          <Badge className="bg-green-600">Validé</Badge>
                                        ) : (
                                          <Badge className="bg-red-600">Non validé</Badge>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Aucune délibération disponible</h3>
                  <p className="text-gray-500">
                    {selectedYear !== 'all' || selectedSemester !== 'all' || selectedSession !== 'all'
                      ? 'Aucun résultat trouvé avec ces filtres'
                      : 'Les résultats de délibération seront affichés ici une fois publiés.'
                    }
                  </p>
                </CardContent>
              </Card>
            )
          ) : (
            // Aperçu flou pour les étudiants pas en règle
            <div className="relative">
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center p-8">
                  <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Contenu verrouillé
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Régularisez votre situation financière pour voir vos résultats
                  </p>
                  <Button onClick={() => window.location.href = '/student/finances'}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Accéder à mes finances
                  </Button>
                </div>
              </div>
              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle>Résultats de délibération</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
