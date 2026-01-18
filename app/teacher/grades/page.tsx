'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Save, 
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  Filter,
  Users,
  Calculator,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

interface Course {
  id: number
  code: string
  name: string
  credits: number
  promotion_name: string
}

interface StudentGrade {
  id: number
  student_id: number
  matricule: string
  first_name: string
  last_name: string
  payment_status: string
  tp_score: number | null
  td_score: number | null
  exam_score: number | null
  final_score: number | null
  grade_letter: string | null
  is_validated: boolean
}

export default function GradesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get('course')
  
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [students, setStudents] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editedGrades, setEditedGrades] = useState<Map<number, any>>(new Map())
  const [showValidateModal, setShowValidateModal] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchCourses()
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentGrades()
    }
  }, [selectedCourse])

  useEffect(() => {
    if (courseIdParam && courses.length > 0) {
      setSelectedCourse(courseIdParam)
    }
  }, [courseIdParam, courses])

  const fetchCourses = async () => {
    try {
      // Get teacher ID first
      const dashResponse = await fetch(`/api/dashboard?role=TEACHER&user_id=${user?.id}`)
      if (dashResponse.ok) {
        const data = await dashResponse.json()
        if (data.courses) {
          setCourses(data.courses)
          if (data.courses.length > 0 && !courseIdParam) {
            setSelectedCourse(data.courses[0].id.toString())
          }
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentGrades = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/grades?course_id=${selectedCourse}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.grades || [])
        setEditedGrades(new Map())
      }
    } catch (error) {
      console.error('Error fetching grades:', error)
      toast.error('Erreur lors du chargement des notes')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (studentId: number, field: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    if (numValue !== null && (numValue < 0 || numValue > 20)) {
      toast.error('La note doit être entre 0 et 20')
      return
    }

    setEditedGrades(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(studentId) || {}
      newMap.set(studentId, { ...existing, [field]: numValue })
      return newMap
    })
  }

  const calculateFinal = (tp: number | null, td: number | null, exam: number | null): number | null => {
    if (tp === null && td === null && exam === null) return null
    // Coefficients: TP=20%, TD=20%, Exam=60%
    const tpScore = tp || 0
    const tdScore = td || 0
    const examScore = exam || 0
    return Math.round((tpScore * 0.2 + tdScore * 0.2 + examScore * 0.6) * 100) / 100
  }

  const getGradeLetter = (score: number): string => {
    if (score >= 16) return 'A'
    if (score >= 14) return 'B'
    if (score >= 12) return 'C'
    if (score >= 10) return 'D'
    return 'E'
  }

  const saveGrades = async () => {
    if (editedGrades.size === 0) {
      toast.info('Aucune modification à sauvegarder')
      return
    }

    setSaving(true)
    try {
      const promises = Array.from(editedGrades.entries()).map(([studentId, grades]) => {
        const student = students.find(s => s.student_id === studentId)
        const tp = grades.tp_score !== undefined ? grades.tp_score : student?.tp_score
        const td = grades.td_score !== undefined ? grades.td_score : student?.td_score
        const exam = grades.exam_score !== undefined ? grades.exam_score : student?.exam_score
        const final = calculateFinal(tp, td, exam)
        const letter = final !== null ? getGradeLetter(final) : null

        return fetch('/api/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            course_id: parseInt(selectedCourse),
            tp_score: tp,
            td_score: td,
            exam_score: exam,
            final_score: final,
            grade_letter: letter
          })
        })
      })

      await Promise.all(promises)
      toast.success('Notes sauvegardées avec succès')
      fetchStudentGrades()
    } catch (error) {
      console.error('Error saving grades:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const validateAllGrades = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/grades/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: parseInt(selectedCourse)
        })
      })

      if (response.ok) {
        toast.success('Notes validées avec succès')
        setShowValidateModal(false)
        fetchStudentGrades()
      } else {
        toast.error('Erreur lors de la validation')
      }
    } catch (error) {
      console.error('Error validating grades:', error)
      toast.error('Erreur lors de la validation')
    } finally {
      setSaving(false)
    }
  }

  const getGradeValue = (student: StudentGrade, field: string): number | '' => {
    const edited = editedGrades.get(student.student_id)
    if (edited && edited[field] !== undefined) {
      return edited[field] === null ? '' : edited[field]
    }
    const value = (student as any)[field]
    return value === null ? '' : value
  }

  const getCurrentFinal = (student: StudentGrade): number | null => {
    const edited = editedGrades.get(student.student_id) || {}
    const tp = edited.tp_score !== undefined ? edited.tp_score : student.tp_score
    const td = edited.td_score !== undefined ? edited.td_score : student.td_score
    const exam = edited.exam_score !== undefined ? edited.exam_score : student.exam_score
    return calculateFinal(tp, td, exam)
  }

  const filteredStudents = students.filter(s => 
    s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCourseInfo = courses.find(c => c.id.toString() === selectedCourse)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des notes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Encoder et gérer les notes des étudiants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!selectedCourse}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            onClick={saveGrades} 
            disabled={saving || editedGrades.size === 0}
          >
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Course Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un cours" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="md:col-span-1 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowValidateModal(true)}
                disabled={!selectedCourse || students.length === 0}
              >
                <Lock className="h-4 w-4 mr-2" />
                Valider les notes
              </Button>
            </div>
          </div>
          {selectedCourseInfo && (
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {selectedCourseInfo.name}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {filteredStudents.length} étudiants
              </span>
              <Badge variant="outline">{selectedCourseInfo.credits} crédits</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grades Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>TP (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>TD (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Examen (60%)</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Calculator className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Moyenne = TP×0.2 + TD×0.2 + Exam×0.6</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Étudiant</TableHead>
                  <TableHead className="text-center w-24">TP /20</TableHead>
                  <TableHead className="text-center w-24">TD /20</TableHead>
                  <TableHead className="text-center w-24">Exam /20</TableHead>
                  <TableHead className="text-center w-24">Moyenne</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                  const finalScore = getCurrentFinal(student)
                  const gradeLetter = finalScore !== null ? getGradeLetter(finalScore) : null
                  const isBlocked = student.payment_status === 'BLOCKED'
                  
                  return (
                    <TableRow key={student.student_id} className={isBlocked ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                      <TableCell className="font-mono text-sm">{student.matricule}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{student.first_name} {student.last_name}</span>
                          {isBlocked && (
                            <Badge variant="destructive" className="text-xs">Bloqué</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          className="w-full text-center"
                          value={getGradeValue(student, 'tp_score')}
                          onChange={(e) => handleGradeChange(student.student_id, 'tp_score', e.target.value)}
                          disabled={student.is_validated || isBlocked}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          className="w-full text-center"
                          value={getGradeValue(student, 'td_score')}
                          onChange={(e) => handleGradeChange(student.student_id, 'td_score', e.target.value)}
                          disabled={student.is_validated || isBlocked}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          className="w-full text-center"
                          value={getGradeValue(student, 'exam_score')}
                          onChange={(e) => handleGradeChange(student.student_id, 'exam_score', e.target.value)}
                          disabled={student.is_validated || isBlocked}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold text-lg ${
                          finalScore !== null 
                            ? finalScore >= 10 ? 'text-green-600' : 'text-red-600'
                            : 'text-gray-400'
                        }`}>
                          {finalScore !== null ? finalScore.toFixed(2) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {gradeLetter ? (
                          <Badge className={
                            gradeLetter === 'A' ? 'bg-green-600' :
                            gradeLetter === 'B' ? 'bg-blue-600' :
                            gradeLetter === 'C' ? 'bg-yellow-600' :
                            gradeLetter === 'D' ? 'bg-orange-600' :
                            'bg-red-600'
                          }>
                            {gradeLetter}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.is_validated ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <Lock className="h-3 w-3 mr-1" />
                            Validé
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Unlock className="h-3 w-3 mr-1" />
                            Brouillon
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      {selectedCourse ? 'Aucun étudiant inscrit à ce cours' : 'Sélectionnez un cours'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {filteredStudents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Moyenne classe</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const validScores = filteredStudents
                      .map(s => getCurrentFinal(s))
                      .filter((s): s is number => s !== null)
                    return validScores.length > 0 
                      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
                      : '-'
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Réussite (≥10)</p>
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    const validScores = filteredStudents
                      .map(s => getCurrentFinal(s))
                      .filter((s): s is number => s !== null)
                    const passed = validScores.filter(s => s >= 10).length
                    return validScores.length > 0 
                      ? `${Math.round((passed / validScores.length) * 100)}%`
                      : '-'
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes encodées</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredStudents.filter(s => getCurrentFinal(s) !== null).length}/{filteredStudents.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes validées</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredStudents.filter(s => s.is_validated).length}/{filteredStudents.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validate Modal */}
      <Dialog open={showValidateModal} onOpenChange={setShowValidateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Valider les notes
            </DialogTitle>
            <DialogDescription>
              Cette action validera toutes les notes du cours. Une fois validées, 
              les notes ne pourront plus être modifiées sans l'autorisation de l'administration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Attention:</strong> Vérifiez que toutes les notes sont correctes avant de valider.
                Les notes des étudiants bloqués financièrement ne seront pas incluses.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidateModal(false)}>
              Annuler
            </Button>
            <Button onClick={validateAllGrades} disabled={saving}>
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Valider les notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
