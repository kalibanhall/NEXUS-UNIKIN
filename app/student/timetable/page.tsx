'use client'

import { Timetable } from '@/components/timetable/timetable'

// Données d'exemple pour l'emploi du temps
const sampleSlots = [
  {
    id: '1',
    courseCode: 'INFO101',
    courseName: 'Algorithmique et Programmation',
    teacherName: 'Prof. Kabongo',
    teacherTitle: 'Professeur',
    room: 'A101',
    building: 'Bâtiment A',
    type: 'THEORY' as const,
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    credits: 6,
    color: '#3B82F6',
    studentsCount: 45,
  },
  {
    id: '2',
    courseCode: 'INFO101',
    courseName: 'Algorithmique et Programmation',
    teacherName: 'Prof. Kabongo',
    teacherTitle: 'Professeur',
    room: 'TP1',
    building: 'Bâtiment B',
    type: 'LAB' as const,
    dayOfWeek: 3,
    startTime: '14:00',
    endTime: '16:00',
    credits: 6,
    color: '#3B82F6',
    studentsCount: 25,
  },
  {
    id: '3',
    courseCode: 'INFO102',
    courseName: 'Architecture des Ordinateurs',
    teacherName: 'Dr. Mukendi',
    teacherTitle: 'Chef de Travaux',
    room: 'B201',
    building: 'Bâtiment B',
    type: 'THEORY' as const,
    dayOfWeek: 2,
    startTime: '10:00',
    endTime: '12:00',
    credits: 4,
    color: '#10B981',
    studentsCount: 45,
  },
  {
    id: '4',
    courseCode: 'INFO103',
    courseName: 'Mathématiques pour l\'Informatique',
    teacherName: 'Prof. Lukusa',
    teacherTitle: 'Professeur',
    room: 'A102',
    building: 'Bâtiment A',
    type: 'THEORY' as const,
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    credits: 4,
    color: '#F59E0B',
    studentsCount: 45,
  },
  {
    id: '5',
    courseCode: 'INFO103',
    courseName: 'Mathématiques pour l\'Informatique',
    teacherName: 'Prof. Lukusa',
    teacherTitle: 'Professeur',
    room: 'TD1',
    building: 'Bâtiment A',
    type: 'TUTORIAL' as const,
    dayOfWeek: 5,
    startTime: '10:00',
    endTime: '12:00',
    credits: 4,
    color: '#F59E0B',
    studentsCount: 25,
  },
]

export default function StudentTimetablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mon emploi du temps
        </h1>
        <p className="text-gray-500">
          L1 Informatique • Semestre 1 • 2024-2025
        </p>
      </div>

      <Timetable slots={sampleSlots} highlightCurrent />
    </div>
  )
}
