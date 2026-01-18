'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Users, Clock, RefreshCw, Calendar, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

export default function TeacherCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchCourses()
    }
  }, [user?.id])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/dashboard?role=TEACHER&user_id=${user?.id}`)
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
        <h1 className="text-3xl font-bold">Mes cours</h1>
        <p className="text-gray-500 dark:text-gray-400">Cours que vous enseignez ce semestre</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.length > 0 ? courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge variant="outline">{course.code}</Badge>
                <Badge>{course.credits} crédits</Badge>
              </div>
              <CardTitle className="mt-2">{course.name}</CardTitle>
              <CardDescription>{course.promotion_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Users className="h-4 w-4" />
                    Étudiants
                  </span>
                  <span className="font-medium">{course.student_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    Volume horaire
                  </span>
                  <span className="font-medium">{(course.hours_cm || 0) + (course.hours_td || 0) + (course.hours_tp || 0)}h</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/teacher/grades?course=${course.id}`}>
                      Notes
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/teacher/attendance?course=${course.id}`}>
                      Présences
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun cours assigné pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
