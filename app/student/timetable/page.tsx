'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Timetable } from '@/components/timetable/timetable'
import { Loader2, Calendar, Clock, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TimetableSlot {
  id: string
  courseCode: string
  courseName: string
  teacherName: string
  teacherTitle: string
  room: string
  building: string
  type: 'THEORY' | 'TUTORIAL' | 'LAB'
  dayOfWeek: number
  startTime: string
  endTime: string
  credits: number
  color: string
  studentsCount: number
}

interface PromotionInfo {
  name: string
  level: string
  department: string
  academicYear: string
}

// Données de démonstration pour l'emploi du temps
const DEMO_TIMETABLE: TimetableSlot[] = [
  // LUNDI
  { id: '1', courseCode: 'INFO101', courseName: 'Algorithmique et Programmation', teacherName: 'Prof. Jean Mukendi', teacherTitle: 'Professeur', room: 'A101', building: 'Bât. Sciences', type: 'THEORY', dayOfWeek: 1, startTime: '08:00', endTime: '10:00', credits: 6, color: '#3B82F6', studentsCount: 45 },
  { id: '2', courseCode: 'MATH201', courseName: 'Analyse Mathématique II', teacherName: 'Prof. Marie Kabongo', teacherTitle: 'Professeur', room: 'B202', building: 'Bât. Maths', type: 'THEORY', dayOfWeek: 1, startTime: '10:15', endTime: '12:15', credits: 5, color: '#10B981', studentsCount: 45 },
  { id: '3', courseCode: 'PHYS101', courseName: 'Physique Générale', teacherName: 'Dr. Patrick Lumumba', teacherTitle: 'Docteur', room: 'C301', building: 'Bât. Physique', type: 'THEORY', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', credits: 4, color: '#F59E0B', studentsCount: 45 },
  
  // MARDI
  { id: '4', courseCode: 'INFO101', courseName: 'Algorithmique et Programmation', teacherName: 'Prof. Jean Mukendi', teacherTitle: 'Professeur', room: 'Labo Info 1', building: 'Bât. Sciences', type: 'LAB', dayOfWeek: 2, startTime: '08:00', endTime: '11:00', credits: 6, color: '#3B82F6', studentsCount: 20 },
  { id: '5', courseCode: 'LANG101', courseName: 'Anglais Technique', teacherName: 'Mrs. Sarah Johnson', teacherTitle: 'Maître Assistant', room: 'D105', building: 'Bât. Langues', type: 'TUTORIAL', dayOfWeek: 2, startTime: '11:15', endTime: '13:15', credits: 2, color: '#8B5CF6', studentsCount: 30 },
  { id: '6', courseCode: 'MATH201', courseName: 'Analyse Mathématique II', teacherName: 'Prof. Marie Kabongo', teacherTitle: 'Professeur', room: 'B202', building: 'Bât. Maths', type: 'TUTORIAL', dayOfWeek: 2, startTime: '14:00', endTime: '16:00', credits: 5, color: '#10B981', studentsCount: 25 },
  
  // MERCREDI
  { id: '7', courseCode: 'INFO201', courseName: 'Bases de Données', teacherName: 'Dr. Joseph Kasongo', teacherTitle: 'Docteur', room: 'A102', building: 'Bât. Sciences', type: 'THEORY', dayOfWeek: 3, startTime: '08:00', endTime: '10:00', credits: 5, color: '#EC4899', studentsCount: 45 },
  { id: '8', courseCode: 'INFO301', courseName: 'Réseaux Informatiques', teacherName: 'Prof. Albert Ngoma', teacherTitle: 'Professeur', room: 'A103', building: 'Bât. Sciences', type: 'THEORY', dayOfWeek: 3, startTime: '10:15', endTime: '12:15', credits: 4, color: '#06B6D4', studentsCount: 45 },
  { id: '9', courseCode: 'PHYS101', courseName: 'Physique Générale', teacherName: 'Dr. Patrick Lumumba', teacherTitle: 'Docteur', room: 'Labo Physique', building: 'Bât. Physique', type: 'LAB', dayOfWeek: 3, startTime: '14:00', endTime: '17:00', credits: 4, color: '#F59E0B', studentsCount: 20 },
  
  // JEUDI
  { id: '10', courseCode: 'INFO201', courseName: 'Bases de Données', teacherName: 'Dr. Joseph Kasongo', teacherTitle: 'Docteur', room: 'Labo Info 2', building: 'Bât. Sciences', type: 'LAB', dayOfWeek: 4, startTime: '08:00', endTime: '11:00', credits: 5, color: '#EC4899', studentsCount: 20 },
  { id: '11', courseCode: 'STAT101', courseName: 'Statistiques et Probabilités', teacherName: 'Prof. Claire Mbemba', teacherTitle: 'Professeur', room: 'B201', building: 'Bât. Maths', type: 'THEORY', dayOfWeek: 4, startTime: '11:15', endTime: '13:15', credits: 4, color: '#EF4444', studentsCount: 45 },
  { id: '12', courseCode: 'INFO301', courseName: 'Réseaux Informatiques', teacherName: 'Prof. Albert Ngoma', teacherTitle: 'Professeur', room: 'Labo Réseaux', building: 'Bât. Sciences', type: 'LAB', dayOfWeek: 4, startTime: '14:00', endTime: '17:00', credits: 4, color: '#06B6D4', studentsCount: 15 },
  
  // VENDREDI
  { id: '13', courseCode: 'STAT101', courseName: 'Statistiques et Probabilités', teacherName: 'Prof. Claire Mbemba', teacherTitle: 'Professeur', room: 'B201', building: 'Bât. Maths', type: 'TUTORIAL', dayOfWeek: 5, startTime: '08:00', endTime: '10:00', credits: 4, color: '#EF4444', studentsCount: 25 },
  { id: '14', courseCode: 'LANG101', courseName: 'Anglais Technique', teacherName: 'Mrs. Sarah Johnson', teacherTitle: 'Maître Assistant', room: 'D105', building: 'Bât. Langues', type: 'THEORY', dayOfWeek: 5, startTime: '10:15', endTime: '12:15', credits: 2, color: '#8B5CF6', studentsCount: 45 },
  { id: '15', courseCode: 'INFO101', courseName: 'Algorithmique et Programmation', teacherName: 'Prof. Jean Mukendi', teacherTitle: 'Professeur', room: 'A101', building: 'Bât. Sciences', type: 'TUTORIAL', dayOfWeek: 5, startTime: '14:00', endTime: '16:00', credits: 6, color: '#3B82F6', studentsCount: 25 },
  
  // SAMEDI
  { id: '16', courseCode: 'MATH201', courseName: 'Analyse Mathématique II', teacherName: 'Prof. Marie Kabongo', teacherTitle: 'Professeur', room: 'Amphi A', building: 'Bât. Central', type: 'THEORY', dayOfWeek: 6, startTime: '08:00', endTime: '10:00', credits: 5, color: '#10B981', studentsCount: 120 },
  { id: '17', courseCode: 'INFO201', courseName: 'Bases de Données', teacherName: 'Dr. Joseph Kasongo', teacherTitle: 'Docteur', room: 'A102', building: 'Bât. Sciences', type: 'TUTORIAL', dayOfWeek: 6, startTime: '10:15', endTime: '12:15', credits: 5, color: '#EC4899', studentsCount: 25 },
]

export default function StudentTimetablePage() {
  const { studentInfo } = useAuth()
  const [slots, setSlots] = useState<TimetableSlot[]>(DEMO_TIMETABLE)
  const [promotion, setPromotion] = useState<PromotionInfo>({
    name: 'Licence 2 Informatique',
    level: 'L2',
    department: 'Département Informatique',
    academicYear: '2025-2026'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const studentId = studentInfo?.id || '1'
        const response = await fetch(`/api/timetable?student_id=${studentId}`)
        if (response.ok) {
          const data = await response.json()
          const scheduleByDay = data.scheduleByDay || {}
          const allSlots: TimetableSlot[] = []
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
          const courseColors: Record<string, string> = {}
          let colorIndex = 0

          Object.values(scheduleByDay).forEach((day: any) => {
            if (day.schedules) {
              day.schedules.forEach((s: any) => {
                if (!courseColors[s.course_code]) {
                  courseColors[s.course_code] = colors[colorIndex % colors.length]
                  colorIndex++
                }
                const typeMap: Record<string, 'THEORY' | 'TUTORIAL' | 'LAB'> = {
                  'CM': 'THEORY', 'TD': 'TUTORIAL', 'TP': 'LAB'
                }
                allSlots.push({
                  id: s.id?.toString() || Math.random().toString(),
                  courseCode: s.course_code || '',
                  courseName: s.course_name || '',
                  teacherName: s.teacher_name || 'Non assigné',
                  teacherTitle: '',
                  room: s.room || s.room_name || 'TBA',
                  building: s.building || 'Bâtiment Principal',
                  type: typeMap[s.schedule_type] || 'THEORY',
                  dayOfWeek: s.day_of_week,
                  startTime: s.start_time?.slice(0, 5) || '08:00',
                  endTime: s.end_time?.slice(0, 5) || '10:00',
                  credits: s.credits || 0,
                  color: courseColors[s.course_code],
                  studentsCount: s.capacity || 0
                })
              })
            }
          })
          
          if (allSlots.length > 0) {
            setSlots(allSlots)
            const firstDay = Object.values(data.scheduleByDay).find((d: any) => d.schedules?.length > 0) as any
            if (firstDay?.schedules?.[0]) {
              setPromotion({
                name: firstDay.schedules[0].promotion_name || 'Licence 2 Informatique',
                level: firstDay.schedules[0].level || 'L2',
                department: 'Département Informatique',
                academicYear: '2025-2026'
              })
            }
          }
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimetable()
  }, [studentInfo])

  const totalHours = slots.reduce((acc, s) => {
    const start = parseInt(s.startTime.split(':')[0])
    const end = parseInt(s.endTime.split(':')[0])
    return acc + (end - start)
  }, 0)
  
  const totalCredits = Array.from(new Set(slots.map(s => s.courseCode))).reduce((acc, code) => {
    const course = slots.find(s => s.courseCode === code)
    return acc + (course?.credits || 0)
  }, 0)

  const courseTypes = {
    theory: slots.filter(s => s.type === 'THEORY').length,
    tutorial: slots.filter(s => s.type === 'TUTORIAL').length,
    lab: slots.filter(s => s.type === 'LAB').length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mon emploi du temps
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {promotion.name} • {promotion.academicYear}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Heures/semaine</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Crédits</p>
                <p className="text-2xl font-bold">{totalCredits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Séances</p>
                <p className="text-2xl font-bold">{slots.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Répartition</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-blue-100 text-blue-800">{courseTypes.theory} CM</Badge>
                <Badge className="bg-green-100 text-green-800">{courseTypes.tutorial} TD</Badge>
                <Badge className="bg-amber-100 text-amber-800">{courseTypes.lab} TP</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Timetable slots={slots} highlightCurrent />
    </div>
  )
}
