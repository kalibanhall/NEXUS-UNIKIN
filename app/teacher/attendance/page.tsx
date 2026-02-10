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

  const generateAttendanceCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setActiveCode(code)
    toast.success('Code de présence généré')
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
        <Button onClick={generateAttendanceCode} disabled={!selectedCourse}>
          <Play className="h-4 w-4 mr-2" />
          Démarrer l'appel
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
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-mono font-bold tracking-widest text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 px-6 py-3 rounded-lg">
                  {activeCode}
                </div>
                <Button variant="outline" onClick={() => setActiveCode(null)}>
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

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des étudiants</CardTitle>
          <CardDescription>Marquer la présence manuellement</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Sélectionnez un cours et démarrez l'appel pour voir les étudiants
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
