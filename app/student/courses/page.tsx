'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Clock, User, RefreshCw, Calendar, Search, Filter, ChevronRight, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAuth } from '@/lib/auth/auth-context'

interface Course {
  id: number
  code: string
  name: string
  credits: number
  teacher_name: string
  hours_cm: number
  hours_td: number
  hours_tp: number
  semester: number
  final_score?: number | string
}

export default function StudentCoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [semesterFilter, setSemesterFilter] = useState<string>('all')

  useEffect(() => {
    if (user?.userId) {
      fetchCourses()
    }
  }, [user?.userId])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, semesterFilter])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/dashboard?role=STUDENT&user_id=${user?.userId}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = [...courses]
    
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (semesterFilter !== 'all') {
      filtered = filtered.filter(course => course.semester === parseInt(semesterFilter))
    }
    
    setFilteredCourses(filtered)
  }

  const handleCourseClick = (courseId: number) => {
    router.push(`/student/courses/${courseId}`)
  }

  const getTotalHours = (course: Course) => {
    return course.hours_cm + course.hours_td + course.hours_tp
  }

  const getStatusBadge = (course: Course) => {
    if (course.final_score === undefined || course.final_score === null) {
      return <Badge variant="outline">En cours</Badge>
    }
    if (Number(course.final_score) >= 10) {
      return <Badge className="bg-green-600">Validé</Badge>
    }
    return <Badge className="bg-red-600">À reprendre</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Statistiques rapides
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0)
  const validatedCourses = courses.filter(c => c.final_score && Number(c.final_score) >= 10).length
  const semesterSet = new Set(courses.map(c => c.semester))
  const uniqueSemesters: number[] = []
  semesterSet.forEach(s => uniqueSemesters.push(s))
  uniqueSemesters.sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes cours</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Cliquez sur un cours pour voir les détails complets
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{courses.length}</p>
              <p className="text-sm text-gray-500">Cours inscrits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{totalCredits}</p>
              <p className="text-sm text-gray-500">Crédits totaux</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{validatedCourses}</p>
              <p className="text-sm text-gray-500">Cours validés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{courses.length - validatedCourses}</p>
              <p className="text-sm text-gray-500">En cours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un cours, code ou enseignant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Semestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les semestres</SelectItem>
                {uniqueSemesters.map(sem => (
                  <SelectItem key={sem} value={sem.toString()}>Semestre {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des cours */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.length > 0 ? filteredCourses.map((course) => (
          <Card 
            key={course.id} 
            className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary"
            onClick={() => handleCourseClick(course.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="font-mono">{course.code}</Badge>
                {getStatusBadge(course)}
              </div>
              <CardTitle className="mt-2 group-hover:text-primary transition-colors">
                {course.name}
              </CardTitle>
              {course.teacher_name && (
                <CardDescription className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {course.teacher_name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>CM: {course.hours_cm}h | TD: {course.hours_td}h | TP: {course.hours_tp}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Semestre {course.semester}</span>
                  </div>
                  <div>
                    <Badge variant="secondary">{course.credits} crédits</Badge>
                  </div>
                </div>
                {course.final_score !== undefined && course.final_score !== null && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span>Ma note:</span>
                      <span className={`font-bold ${parseFloat(String(course.final_score)) >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(String(course.final_score)).toFixed(2)}/20
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t flex items-center justify-between text-primary">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Voir les détails
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchTerm || semesterFilter !== 'all' ? 'Aucun cours trouvé avec ces filtres' : 'Aucun cours inscrit pour le moment'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
