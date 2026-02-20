'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { UserCheck, Play, RefreshCw, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

export default function TeacherAttendancePage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get('course')
  
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCode, setActiveCode] = useState<string | null>(null)
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null)
  const [codeId, setCodeId] = useState<number | null>(null)
  const [submissionsCount, setSubmissionsCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')
  const [generating, setGenerating] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])

  useEffect(() => {
    if (user?.userId) {
      fetchCourses()
    }
  }, [user?.userId])

  useEffect(() => {
    if (courseIdParam && courses.length > 0) {
      setSelectedCourse(courseIdParam)
    }
  }, [courseIdParam, courses])

  // Timer de countdown pour le code actif
  useEffect(() => {
    if (!codeExpiry) return
    const interval = setInterval(() => {
      const now = new Date()
      const diff = codeExpiry.getTime() - now.getTime()
      if (diff <= 0) {
        setActiveCode(null)
        setCodeExpiry(null)
        setCodeId(null)
        setTimeLeft('')
        toast.info('Le code de présence a expiré')
        clearInterval(interval)
        return
      }
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [codeExpiry])

  // Charger l'historique des codes quand le cours change
  useEffect(() => {
    if (selectedCourse && user?.profile?.id) {
      fetchAttendanceHistory()
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/dashboard?role=TEACHER&user_id=${user?.userId}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
        if (data.courses?.length > 0 && !courseIdParam) {
          setSelectedCourse(data.courses[0].id.toString())
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch(`/api/attendance-codes?teacher_id=${user?.profile?.id}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceHistory(data.codes || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const generateAttendanceCode = async () => {
    if (!selectedCourse || !user?.profile?.id) {
      toast.error('Veuillez sélectionner un cours')
      return
    }
    setGenerating(true)
    try {
      const response = await fetch('/api/attendance-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.profile.id,
          courseId: parseInt(selectedCourse),
          validMinutes: 15
        })
      })
      if (response.ok) {
        const result = await response.json()
        const data = result.data
        setActiveCode(data.code)
        setCodeExpiry(new Date(data.valid_until))
        setCodeId(data.id)
        setSubmissionsCount(0)
        toast.success(`Code généré: ${data.code} — valide 15 minutes`)
        fetchAttendanceHistory()
      } else {
        const err = await response.json()
        toast.error(err.error || 'Erreur lors de la génération du code')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setGenerating(false)
    }
  }

  const deactivateCode = async () => {
    if (!codeId) return
    try {
      await fetch(`/api/attendance-codes?id=${codeId}`, { method: 'DELETE' })
      setActiveCode(null)
      setCodeExpiry(null)
      setCodeId(null)
      setTimeLeft('')
      toast.info('Code désactivé')
      fetchAttendanceHistory()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des présences</h1>
          <p className="text-gray-500 dark:text-gray-400">Enregistrer la présence des étudiants</p>
        </div>
        <Button onClick={generateAttendanceCode} disabled={!selectedCourse || generating}>
          <Play className="h-4 w-4 mr-2" />
          {generating ? 'Génération...' : 'Démarrer l\'appel'}
        </Button>
      </div>

      {/* Course Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
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
        </CardContent>
      </Card>

      {/* Active Code */}
      {activeCode && (
        <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-400">Code de présence actif</h4>
                <p className="text-sm text-green-600">Communiquez ce code à vos étudiants</p>
                {timeLeft && (
                  <p className="text-sm font-mono text-green-700 mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Expire dans: {timeLeft}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-mono font-bold tracking-widest text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 px-6 py-3 rounded-lg">
                  {activeCode}
                </div>
                <Button variant="outline" onClick={deactivateCode}>
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-500">Total étudiants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Présents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-sm text-gray-500">Absents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-amber-600">0</p>
            <p className="text-sm text-gray-500">Retards</p>
          </CardContent>
        </Card>
      </div>

      {/* Student List / History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des codes de présence</CardTitle>
          <CardDescription>Derniers codes générés pour vos cours</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead className="text-center">Soumissions</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.length > 0 ? attendanceHistory.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-bold">{item.code}</TableCell>
                  <TableCell>{item.course_code} - {item.course_name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{item.submissions_count || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.is_active && new Date(item.valid_until) > new Date() ? (
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Expiré</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('fr-FR')} {new Date(item.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Aucun code généré. Sélectionnez un cours et démarrez l&apos;appel.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
