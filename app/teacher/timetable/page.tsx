'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, RefreshCw, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/auth-context'

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

export default function TeacherTimetablePage() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.userId) {
      fetchSchedule()
    }
  }, [user?.userId])

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/dashboard?role=TEACHER&user_id=${user?.userId}`)
      if (response.ok) {
        const data = await response.json()
        setSchedule(data.schedule || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSessionType = (type: string) => {
    switch (type) {
      case 'LECTURE': return { label: 'CM', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
      case 'TD': return { label: 'TD', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
      case 'TP': return { label: 'TP', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' }
      default: return { label: type, color: 'bg-gray-100 text-gray-800' }
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
        <h1 className="text-3xl font-bold">Mon emploi du temps</h1>
        <p className="text-gray-500 dark:text-gray-400">Planning hebdomadaire de vos cours</p>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-sm">Cours Magistral (CM)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-sm">Travaux Dirigés (TD)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500" />
              <span className="text-sm">Travaux Pratiques (TP)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planning de la semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50 dark:bg-gray-800 w-20">Heure</th>
                  {days.map(day => (
                    <th key={day} className="border p-2 bg-gray-50 dark:bg-gray-800">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour}>
                    <td className="border p-2 text-center text-sm font-medium bg-gray-50 dark:bg-gray-800">
                      {hour}
                    </td>
                    {days.map(day => (
                      <td key={`${day}-${hour}`} className="border p-1 h-16 align-top">
                        {/* Add schedule items here when available */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Today's Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions d'aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          {schedule.length > 0 ? (
            <div className="space-y-3">
              {schedule.map((session, idx) => {
                const typeInfo = getSessionType(session.session_type)
                return (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${typeInfo.color}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{session.course_code}</p>
                        <p className="text-sm text-gray-500">{session.course_name}</p>
                      </div>
                      <Badge>{typeInfo.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.start_time} - {session.end_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {session.room_name || 'Salle non assignée'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Pas de cours prévu aujourd'hui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
