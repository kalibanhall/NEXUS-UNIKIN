'use client'

import { useState, useEffect } from 'react'
import { 
  Scale, Lock, AlertTriangle, CheckCircle, Download,
  Search, Users, Clock, Check, X, TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

function getGradeColor(avg: number): string {
  if (avg >= 16) return 'text-green-600'
  if (avg >= 14) return 'text-green-500'
  if (avg >= 12) return 'text-blue-600'
  if (avg >= 10) return 'text-yellow-600'
  if (avg >= 8) return 'text-orange-600'
  return 'text-red-600'
}

function getMention(avg: number): string | null {
  if (avg >= 16) return 'Distinction'
  if (avg >= 14) return 'Bien'
  if (avg >= 12) return 'Assez Bien'
  if (avg >= 10) return 'Passable'
  return null
}

function getDecisionLabel(decision: string): string {
  switch (decision) {
    case 'ADMIS': return 'Admis'
    case 'ADMIS_AVEC_DETTE': return 'Admis avec dette'
    case 'AJOURNÉ': return 'Ajourné'
    case 'REFUSÉ': return 'Refusé'
    case 'BLOQUÉ': return 'Bloqué'
    default: return 'En attente'
  }
}

function getDecisionVariant(decision: string): string {
  switch (decision) {
    case 'ADMIS': return 'success'
    case 'ADMIS_AVEC_DETTE': return 'warning'
    case 'AJOURNÉ': return 'destructive'
    case 'REFUSÉ': return 'destructive'
    case 'BLOQUÉ': return 'secondary'
    default: return 'outline'
  }
}

export default function DeliberationPage() {
  const [faculties, setFaculties] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedPromotion, setSelectedPromotion] = useState('')
  
  const [students, setStudents] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [loadingFaculties, setLoadingFaculties] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Charger les facultés au montage
  useEffect(() => {
    fetchFaculties()
  }, [])

  // Charger les départements quand la faculté change
  useEffect(() => {
    if (selectedFaculty) {
      fetchDepartments(selectedFaculty)
      setSelectedDepartment('')
      setSelectedPromotion('')
      setStudents([])
      setStatistics(null)
    }
  }, [selectedFaculty])

  // Charger les promotions quand le département change
  useEffect(() => {
    if (selectedDepartment) {
      fetchPromotions(selectedDepartment)
      setSelectedPromotion('')
      setStudents([])
      setStatistics(null)
    }
  }, [selectedDepartment])

  // Charger les données de délibération quand la promotion change
  useEffect(() => {
    if (selectedPromotion) {
      fetchDeliberationData(selectedPromotion)
    }
  }, [selectedPromotion])

  const fetchFaculties = async () => {
    try {
      const response = await fetch('/api/academic-structure?type=faculties')
      if (response.ok) {
        const data = await response.json()
        if (data.faculties) {
          setFaculties(data.faculties)
        }
      }
    } catch (error) {
      console.error('Error fetching faculties:', error)
    } finally {
      setLoadingFaculties(false)
    }
  }

  const fetchDepartments = async (facultyId: string) => {
    try {
      const response = await fetch(`/api/academic-structure?type=departments&faculty_id=${facultyId}`)
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchPromotions = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/academic-structure?type=promotions&department_id=${departmentId}`)
      if (response.ok) {
        const data = await response.json()
        setPromotions(data.promotions || [])
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
    }
  }

  const fetchDeliberationData = async (promotionId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/deliberations?promotionId=${promotionId}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        setStatistics(data.statistics || null)
      } else {
        toast.error('Erreur lors du chargement des données')
      }
    } catch (error) {
      console.error('Error fetching deliberation data:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les étudiants
  const filteredStudents = students.filter((student: any) => {
    const name = `${student.first_name} ${student.last_name}`.toLowerCase()
    const matchesSearch = 
      name.includes(searchTerm.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter !== 'all') {
      matchesStatus = student.decision === statusFilter
    }

    return matchesSearch && matchesStatus
  })

  // Stats calculées
  const stats = {
    total: students.length,
    admis: students.filter((s: any) => s.decision === 'ADMIS').length,
    admisAvecDette: students.filter((s: any) => s.decision === 'ADMIS_AVEC_DETTE').length,
    ajourne: students.filter((s: any) => s.decision === 'AJOURNÉ').length,
    refuse: students.filter((s: any) => s.decision === 'REFUSÉ').length,
    bloque: students.filter((s: any) => s.decision === 'BLOQUÉ').length,
    enAttente: students.filter((s: any) => s.decision === 'EN_ATTENTE').length,
    avgGrade: students.filter((s: any) => parseFloat(s.average) > 0).length > 0
      ? students.filter((s: any) => parseFloat(s.average) > 0)
          .reduce((sum: number, s: any) => sum + parseFloat(s.average), 0) / 
        students.filter((s: any) => parseFloat(s.average) > 0).length
      : 0,
  }

  // Valider les délibérations
  const validateResults = async () => {
    if (!selectedPromotion || students.length === 0) return

    setIsRunning(true)
    try {
      const decisions = students
        .filter((s: any) => s.decision !== 'BLOQUÉ' && s.decision !== 'EN_ATTENTE')
        .map((s: any) => ({
          studentId: s.id,
          status: s.decision,
        }))

      const response = await fetch('/api/deliberations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promotionId: parseInt(selectedPromotion),
          decisions,
          validatedBy: 1
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Délibérations validées avec succès')
        setShowConfirmDialog(false)
        fetchDeliberationData(selectedPromotion)
      } else {
        const err = await response.json()
        toast.error(err.error || 'Erreur lors de la validation')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsRunning(false)
    }
  }

  if (loadingFaculties) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
          <p className="text-gray-500">Gestion des délibérations académiques</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={students.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exporter PV
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowConfirmDialog(true)}
            disabled={students.length === 0 || stats.enAttente === stats.total}
          >
            <Check className="w-4 h-4 mr-2" />
            Valider
          </Button>
        </div>
      </div>

      {/* Sélection Faculté → Département → Promotion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-64">
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une faculté" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((f: any) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={!selectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="Département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d: any) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select value={selectedPromotion} onValueChange={setSelectedPromotion} disabled={!selectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Promotion" />
                </SelectTrigger>
                <SelectContent>
                  {promotions.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPromotion && (
              <Button variant="ghost" size="sm" onClick={() => fetchDeliberationData(selectedPromotion)}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Chargement des données...</span>
        </div>
      )}

      {/* Contenu quand promotion sélectionnée */}
      {!loading && selectedPromotion && students.length > 0 && (
        <>
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
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.admis}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Admis</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.admisAvecDette}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Avec dette</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.ajourne}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Ajournés</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-800">
              <CardContent className="p-4 text-center">
                <X className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.refuse}</p>
                <p className="text-xs text-red-600 dark:text-red-400">Refusés</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <Lock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.bloque}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bloqués</p>
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

          {/* Alert étudiants bloqués */}
          {stats.bloque > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    {stats.bloque} étudiant(s) bloqués pour raison financière
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Ces étudiants ne peuvent pas être délibérés. Contactez le service financier.
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
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Décision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les décisions</SelectItem>
                    <SelectItem value="ADMIS">Admis</SelectItem>
                    <SelectItem value="ADMIS_AVEC_DETTE">Admis avec dette</SelectItem>
                    <SelectItem value="AJOURNÉ">Ajournés</SelectItem>
                    <SelectItem value="REFUSÉ">Refusés</SelectItem>
                    <SelectItem value="BLOQUÉ">Bloqués</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? filteredStudents.map((student: any) => {
                    const avg = parseFloat(student.average) || 0
                    const creditsValidated = parseInt(student.credits_validated) || 0
                    const totalCredits = parseInt(student.total_credits) || 0
                    const isBlocked = student.decision === 'BLOQUÉ'
                    const mention = avg >= 10 ? getMention(avg) : null

                    return (
                      <TableRow 
                        key={student.id}
                        className={cn(isBlocked && "bg-red-50 dark:bg-red-900/10")}
                      >
                        <TableCell>
                          {isBlocked ? (
                            <Lock className="w-4 h-4 text-red-500" />
                          ) : student.decision === 'ADMIS' || student.decision === 'ADMIS_AVEC_DETTE' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : student.decision === 'REFUSÉ' || student.decision === 'AJOURNÉ' ? (
                            <X className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{student.matricule}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.last_name} {student.first_name}</p>
                            {student.payment_status === 'BLOCKED' && (
                              <Badge variant="destructive" className="text-xs mt-1">Paiement bloqué</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn("text-lg font-bold", isBlocked ? "text-gray-400" : getGradeColor(avg))}>
                            {isBlocked ? '-' : avg > 0 ? avg.toFixed(2) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isBlocked ? (
                            <span className="text-gray-400">-/-</span>
                          ) : (
                            <span>
                              <span className={creditsValidated >= totalCredits ? 'text-green-600 font-bold' : ''}>
                                {creditsValidated}
                              </span>
                              /{totalCredits}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getDecisionVariant(student.decision) as any}>
                            {getDecisionLabel(student.decision)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {mention ? (
                            <Badge variant="outline" className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-300">
                              {mention}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Aucun étudiant trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {students.length > 0 && (
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 py-3">
                <div className="flex items-center justify-between w-full text-sm text-gray-500">
                  <span>{filteredStudents.length} étudiant(s) affiché(s) sur {stats.total}</span>
                  <span>
                    Taux de réussite: 
                    <strong className={cn("ml-1", statistics?.passRate && parseFloat(statistics.passRate) >= 50 ? 'text-green-600' : 'text-red-600')}>
                      {statistics?.passRate || '0'}%
                    </strong>
                  </span>
                </div>
              </CardFooter>
            )}
          </Card>
        </>
      )}

      {/* Message si pas de promotion sélectionnée */}
      {!loading && !selectedPromotion && (
        <Card>
          <CardContent className="py-16 text-center">
            <Scale className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Sélectionnez une promotion</h3>
            <p className="text-sm text-gray-400 mt-1">
              Choisissez une faculté, un département et une promotion pour voir les résultats
            </p>
          </CardContent>
        </Card>
      )}

      {/* Message si aucun étudiant */}
      {!loading && selectedPromotion && students.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Aucun étudiant trouvé</h3>
            <p className="text-sm text-gray-400 mt-1">
              Aucune donnée de notes pour cette promotion. Vérifiez que les notes ont été encodées.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la validation</DialogTitle>
            <DialogDescription>
              Valider définitivement les notes pour {stats.total - stats.bloque} étudiant(s).
              {stats.bloque > 0 && ` (${stats.bloque} bloqué(s) exclus)`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 text-sm">
            <p><strong>{stats.admis}</strong> Admis</p>
            <p><strong>{stats.admisAvecDette}</strong> Admis avec dette</p>
            <p><strong>{stats.ajourne}</strong> Ajournés</p>
            <p><strong>{stats.refuse}</strong> Refusés</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isRunning}>Annuler</Button>
            <Button onClick={validateResults} disabled={isRunning}>
              {isRunning ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Validation...</> : <><Check className="w-4 h-4 mr-2" />Confirmer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
