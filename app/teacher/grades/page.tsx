'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  Upload, 
  Download,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  FileUp,
  X,
  Check
} from 'lucide-react'

interface Course {
  id: number
  code: string
  name: string
  credits: number
  semester: string
  academic_year: string
  student_count: number
}

interface Student {
  id: number
  student_id: string
  matricule: string
  first_name: string
  last_name: string
  email: string
  tp_score: number | null
  exam_score: number | null
  final_score: number | null
  grade: string | null
  status: 'pending' | 'submitted' | 'validated'
}

interface ImportResult {
  success: boolean
  matched: number
  notFound: string[]
  errors: string[]
}

export default function TeacherGradesPage() {
  const { user: session } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Import Excel state
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  
  // Edit state
  const [editingStudent, setEditingStudent] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{tp: string, exam: string}>({tp: '', exam: ''})
  
  // Notifications
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Charger les cours de l'enseignant
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/teacher/courses')
      if (res.ok) {
        const data = await res.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Erreur chargement cours:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger les étudiants d'un cours
  const fetchStudents = async (courseId: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/students`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('Erreur chargement étudiants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find(c => c.id.toString() === courseId)
    if (course) {
      setSelectedCourse(course)
      fetchStudents(course.id)
    }
  }

  // Calcul automatique de la note finale et mention
  const calculateFinalScore = (tp: number | null, exam: number | null): number | null => {
    if (tp === null || exam === null) return null
    // TP = 30%, Examen = 70%
    return Math.round((tp * 0.3 + exam * 0.7) * 100) / 100
  }

  const getGrade = (score: number | null): string => {
    if (score === null) return '-'
    if (score >= 16) return 'A'
    if (score >= 14) return 'B'
    if (score >= 12) return 'C'
    if (score >= 10) return 'D'
    return 'E'
  }

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      case 'E': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Sauvegarder une note individuellement
  const saveGrade = async (studentId: number, tpScore: number, examScore: number) => {
    setSaving(true)
    try {
      const finalScore = calculateFinalScore(tpScore, examScore)
      const grade = getGrade(finalScore)
      
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          course_id: selectedCourse?.id,
          tp_score: tpScore,
          exam_score: examScore,
          final_score: finalScore,
          grade: grade
        })
      })

      if (res.ok) {
        // Mettre à jour localement
        setStudents(prev => prev.map(s => 
          s.id === studentId 
            ? { ...s, tp_score: tpScore, exam_score: examScore, final_score: finalScore, grade: grade, status: 'submitted' as const }
            : s
        ))
        showNotification('success', 'Note enregistrée avec succès')
      } else {
        showNotification('error', 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion')
    } finally {
      setSaving(false)
      setEditingStudent(null)
    }
  }

  // Gestion de l'import Excel
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      parseExcelPreview(file)
    }
  }

  const parseExcelPreview = async (file: File) => {
    // Lecture du fichier CSV/Excel simplifié
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase())
    
    const preview = lines.slice(1, 6).map(line => {
      const values = line.split(/[,;\t]/)
      const row: any = {}
      headers.forEach((h, i) => {
        row[h] = values[i]?.trim() || ''
      })
      return row
    })
    
    setImportPreview(preview)
  }

  const handleImport = async () => {
    if (!importFile || !selectedCourse) return
    
    setImporting(true)
    try {
      const text = await importFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase())
      
      // Trouver les colonnes
      const matriculeCol = headers.findIndex(h => h.includes('matricule') || h.includes('id'))
      const nameCol = headers.findIndex(h => h.includes('nom') || h.includes('name'))
      const tpCol = headers.findIndex(h => h.includes('tp') || h.includes('travaux'))
      const examCol = headers.findIndex(h => h.includes('exam') || h.includes('examen'))
      
      if (matriculeCol === -1 && nameCol === -1) {
        showNotification('error', 'Colonne matricule ou nom non trouvée')
        setImporting(false)
        return
      }

      const results: ImportResult = {
        success: true,
        matched: 0,
        notFound: [],
        errors: []
      }

      const updatedStudents = [...students]
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/[,;\t]/)
        const matricule = matriculeCol >= 0 ? values[matriculeCol]?.trim() : ''
        const name = nameCol >= 0 ? values[nameCol]?.trim().toLowerCase() : ''
        const tp = tpCol >= 0 ? parseFloat(values[tpCol]) : null
        const exam = examCol >= 0 ? parseFloat(values[examCol]) : null
        
        // Chercher l'étudiant
        const studentIndex = updatedStudents.findIndex(s => 
          s.matricule === matricule || 
          `${s.first_name} ${s.last_name}`.toLowerCase().includes(name) ||
          `${s.last_name} ${s.first_name}`.toLowerCase().includes(name)
        )
        
        if (studentIndex >= 0) {
          const student = updatedStudents[studentIndex]
          const finalScore = calculateFinalScore(tp, exam)
          const grade = getGrade(finalScore)
          
          // Sauvegarder via API
          const res = await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: student.id,
              course_id: selectedCourse.id,
              tp_score: tp,
              exam_score: exam,
              final_score: finalScore,
              grade: grade
            })
          })
          
          if (res.ok) {
            updatedStudents[studentIndex] = {
              ...student,
              tp_score: tp,
              exam_score: exam,
              final_score: finalScore,
              grade: grade,
              status: 'submitted'
            }
            results.matched++
          } else {
            results.errors.push(`Erreur pour ${matricule || name}`)
          }
        } else {
          results.notFound.push(matricule || name || `Ligne ${i + 1}`)
        }
      }
      
      setStudents(updatedStudents)
      setImportResult(results)
      
      if (results.matched > 0) {
        showNotification('success', `${results.matched} notes importées avec succès`)
      }
      
    } catch (error) {
      console.error('Erreur import:', error)
      showNotification('error', 'Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const headers = 'Matricule,Nom,Prénom,Note TP,Note Examen\n'
    const rows = students.map(s => 
      `${s.matricule},${s.last_name},${s.first_name},,`
    ).join('\n')
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes_${selectedCourse?.code || 'cours'}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Filtrage des étudiants
  const filteredStudents = students.filter(s => {
    const matchesSearch = searchTerm === '' || 
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  // Statistiques
  const stats = {
    total: students.length,
    graded: students.filter(s => s.final_score !== null).length,
    passed: students.filter(s => s.final_score !== null && s.final_score >= 10).length,
    average: students.filter(s => s.final_score !== null).length > 0
      ? (students.filter(s => s.final_score !== null).reduce((sum, s) => sum + (s.final_score || 0), 0) / students.filter(s => s.final_score !== null).length).toFixed(2)
      : '-'
  }

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <Alert className={notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
          <AlertDescription className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Notes</h1>
          <p className="text-gray-600 mt-1">Saisissez et gérez les notes de vos étudiants</p>
        </div>
      </div>

      {/* Sélection du cours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sélectionner un cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleCourseSelect} value={selectedCourse?.id.toString()}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choisir un cours..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  <span className="font-medium">{course.code}</span> - {course.name} ({course.student_count} étudiants)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total étudiants</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Notes saisies</p>
                    <p className="text-2xl font-bold">{stats.graded}/{stats.total}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Taux de réussite</p>
                    <p className="text-2xl font-bold">
                      {stats.graded > 0 ? Math.round((stats.passed / stats.graded) * 100) : 0}%
                    </p>
                  </div>
                  <Badge className={stats.passed / stats.graded >= 0.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {stats.passed} réussites
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Moyenne classe</p>
                    <p className="text-2xl font-bold">{stats.average}/20</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions et filtres */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Rechercher un étudiant..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="submitted">Soumis</SelectItem>
                      <SelectItem value="validated">Validé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger modèle
                  </Button>
                  <Button onClick={() => setShowImportDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer Excel/CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des notes */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des étudiants - {selectedCourse.name}</CardTitle>
              <CardDescription>
                Cliquez sur une ligne pour modifier les notes. Les modifications sont sauvegardées automatiquement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Nom & Prénom</TableHead>
                      <TableHead className="text-center">Note TP (30%)</TableHead>
                      <TableHead className="text-center">Note Examen (70%)</TableHead>
                      <TableHead className="text-center">Note Finale</TableHead>
                      <TableHead className="text-center">Mention</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(student => (
                      <TableRow 
                        key={student.id}
                        className={editingStudent === student.id ? 'bg-blue-50' : ''}
                      >
                        <TableCell className="font-medium">{student.matricule}</TableCell>
                        <TableCell>{student.last_name} {student.first_name}</TableCell>
                        <TableCell className="text-center">
                          {editingStudent === student.id ? (
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              className="w-20 mx-auto text-center"
                              value={editValues.tp}
                              onChange={(e) => setEditValues(prev => ({...prev, tp: e.target.value}))}
                            />
                          ) : (
                            <span className={student.tp_score !== null ? '' : 'text-gray-400'}>
                              {student.tp_score !== null ? student.tp_score : '-'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingStudent === student.id ? (
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              className="w-20 mx-auto text-center"
                              value={editValues.exam}
                              onChange={(e) => setEditValues(prev => ({...prev, exam: e.target.value}))}
                            />
                          ) : (
                            <span className={student.exam_score !== null ? '' : 'text-gray-400'}>
                              {student.exam_score !== null ? student.exam_score : '-'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {student.final_score !== null ? student.final_score : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getGradeColor(student.grade || '-')}>
                            {student.grade || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={
                            student.status === 'validated' ? 'default' :
                            student.status === 'submitted' ? 'secondary' : 'outline'
                          }>
                            {student.status === 'validated' ? 'Validé' :
                             student.status === 'submitted' ? 'Soumis' : 'En attente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {editingStudent === student.id ? (
                            <div className="flex gap-1 justify-center">
                              <Button 
                                size="sm" 
                                onClick={() => saveGrade(student.id, parseFloat(editValues.tp), parseFloat(editValues.exam))}
                                disabled={saving}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingStudent(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setEditingStudent(student.id)
                                setEditValues({
                                  tp: student.tp_score?.toString() || '',
                                  exam: student.exam_score?.toString() || ''
                                })
                              }}
                            >
                              Modifier
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialog Import */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importer les notes depuis Excel/CSV
            </DialogTitle>
            <DialogDescription>
              Importez un fichier Excel ou CSV contenant les notes. Le système va automatiquement 
              faire correspondre les étudiants par matricule ou par nom.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Zone upload */}
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
              <FileUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              {importFile ? (
                <p className="text-green-600 font-medium">{importFile.name}</p>
              ) : (
                <>
                  <p className="text-gray-600">Cliquez pour sélectionner un fichier</p>
                  <p className="text-sm text-gray-400 mt-1">Formats acceptés: CSV, Excel (.xlsx, .xls)</p>
                </>
              )}
            </div>

            {/* Format attendu */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Format attendu:</strong> Le fichier doit contenir les colonnes: 
                Matricule (ou ID), Nom, Note TP, Note Examen. Les colonnes peuvent être séparées par des virgules, points-virgules ou tabulations.
              </AlertDescription>
            </Alert>

            {/* Aperçu */}
            {importPreview.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Aperçu des données:</h4>
                <div className="rounded border overflow-auto max-h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(importPreview[0]).map(key => (
                          <TableHead key={key} className="text-xs">{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreview.map((row, i) => (
                        <TableRow key={i}>
                          {Object.values(row).map((val: any, j) => (
                            <TableCell key={j} className="text-xs">{val}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Résultat de l'import */}
            {importResult && (
              <Alert className={importResult.matched > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <AlertDescription>
                  <p className="font-medium">{importResult.matched} notes importées avec succès</p>
                  {importResult.notFound.length > 0 && (
                    <p className="text-sm mt-1 text-orange-600">
                      Non trouvés: {importResult.notFound.slice(0, 5).join(', ')}
                      {importResult.notFound.length > 5 && ` et ${importResult.notFound.length - 5} autres`}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowImportDialog(false)
              setImportFile(null)
              setImportPreview([])
              setImportResult(null)
            }}>
              Annuler
            </Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              {importing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer les notes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
