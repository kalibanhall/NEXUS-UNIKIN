'use client'

import { useState } from 'react'
import { 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { cn, DAYS_OF_WEEK, TIME_SLOTS, COURSE_TYPES } from '@/lib/utils'

// Types
interface TimetableSlot {
  id: string
  courseCode: string
  courseName: string
  teacherName: string
  teacherTitle: string
  room: string
  building: string
  type: 'THEORY' | 'PRACTICAL' | 'LAB' | 'TUTORIAL'
  dayOfWeek: number
  startTime: string
  endTime: string
  credits: number
  color?: string
  studentsCount?: number
}

interface TimetableProps {
  slots: TimetableSlot[]
  viewMode?: 'week' | 'day'
  onSlotClick?: (slot: TimetableSlot) => void
  highlightCurrent?: boolean
  showTeacherInfo?: boolean
}

// Sample data for demo
const sampleSlots: TimetableSlot[] = [
  {
    id: '1',
    courseCode: 'INFO101',
    courseName: 'Introduction à l\'Informatique',
    teacherName: 'Jean-Pierre Kabongo',
    teacherTitle: 'Professeur',
    room: 'Auditoire A',
    building: 'Bâtiment Central',
    type: 'THEORY',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    credits: 4,
    color: 'bg-blue-500',
    studentsCount: 156,
  },
  {
    id: '2',
    courseCode: 'INFO102',
    courseName: 'Algorithmique et Structures de Données',
    teacherName: 'Jean-Pierre Kabongo',
    teacherTitle: 'Professeur',
    room: 'Salle B-204',
    building: 'Bâtiment Sciences',
    type: 'TUTORIAL',
    dayOfWeek: 1,
    startTime: '10:15',
    endTime: '12:15',
    credits: 5,
    color: 'bg-orange-500',
    studentsCount: 156,
  },
  {
    id: '3',
    courseCode: 'MATH101',
    courseName: 'Mathématiques pour l\'Informatique',
    teacherName: 'Sophie Mutombo',
    teacherTitle: 'Docteur',
    room: 'Auditoire C',
    building: 'Bâtiment Central',
    type: 'THEORY',
    dayOfWeek: 1,
    startTime: '14:15',
    endTime: '16:15',
    credits: 3,
    color: 'bg-purple-500',
    studentsCount: 156,
  },
  {
    id: '4',
    courseCode: 'INFO101',
    courseName: 'Introduction à l\'Informatique',
    teacherName: 'Jean-Pierre Kabongo',
    teacherTitle: 'Professeur',
    room: 'Labo Info 1',
    building: 'Bâtiment Sciences',
    type: 'LAB',
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '10:00',
    credits: 4,
    color: 'bg-green-500',
    studentsCount: 40,
  },
  {
    id: '5',
    courseCode: 'INFO103',
    courseName: 'Programmation Web',
    teacherName: 'Patrick Ilunga',
    teacherTitle: 'Assistant',
    room: 'Labo Info 2',
    building: 'Bâtiment Sciences',
    type: 'PRACTICAL',
    dayOfWeek: 2,
    startTime: '10:15',
    endTime: '12:15',
    credits: 4,
    color: 'bg-teal-500',
    studentsCount: 40,
  },
  {
    id: '6',
    courseCode: 'INFO104',
    courseName: 'Base de Données',
    teacherName: 'Marie Kasongo',
    teacherTitle: 'Docteur',
    room: 'Salle D-102',
    building: 'Bâtiment Sciences',
    type: 'THEORY',
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '10:00',
    credits: 4,
    color: 'bg-indigo-500',
    studentsCount: 156,
  },
  {
    id: '7',
    courseCode: 'INFO102',
    courseName: 'Algorithmique et Structures de Données',
    teacherName: 'Jean-Pierre Kabongo',
    teacherTitle: 'Professeur',
    room: 'Auditoire B',
    building: 'Bâtiment Central',
    type: 'THEORY',
    dayOfWeek: 3,
    startTime: '14:15',
    endTime: '16:15',
    credits: 5,
    color: 'bg-blue-500',
    studentsCount: 156,
  },
  {
    id: '8',
    courseCode: 'INFO104',
    courseName: 'Base de Données',
    teacherName: 'Marie Kasongo',
    teacherTitle: 'Docteur',
    room: 'Labo Info 1',
    building: 'Bâtiment Sciences',
    type: 'PRACTICAL',
    dayOfWeek: 4,
    startTime: '10:15',
    endTime: '12:15',
    credits: 4,
    color: 'bg-green-500',
    studentsCount: 40,
  },
  {
    id: '9',
    courseCode: 'MATH101',
    courseName: 'Mathématiques pour l\'Informatique',
    teacherName: 'Sophie Mutombo',
    teacherTitle: 'Docteur',
    room: 'Salle B-204',
    building: 'Bâtiment Sciences',
    type: 'TUTORIAL',
    dayOfWeek: 5,
    startTime: '08:00',
    endTime: '10:00',
    credits: 3,
    color: 'bg-orange-500',
    studentsCount: 40,
  },
  {
    id: '10',
    courseCode: 'INFO103',
    courseName: 'Programmation Web',
    teacherName: 'Patrick Ilunga',
    teacherTitle: 'Assistant',
    room: 'Auditoire A',
    building: 'Bâtiment Central',
    type: 'THEORY',
    dayOfWeek: 5,
    startTime: '10:15',
    endTime: '12:15',
    credits: 4,
    color: 'bg-blue-500',
    studentsCount: 156,
  },
]

// Slot tooltip content component
function SlotTooltipContent({ slot }: { slot: TimetableSlot }) {
  const typeInfo = COURSE_TYPES.find(t => t.value === slot.type)
  
  return (
    <div className="w-72 p-1">
      <div className="flex items-start gap-3">
        <div className={cn("w-2 h-full rounded-full min-h-[100px]", slot.color || 'bg-blue-500')} />
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{slot.courseCode}</Badge>
              <Badge className={cn("text-xs", 
                slot.type === 'THEORY' ? 'bg-blue-500' :
                slot.type === 'PRACTICAL' ? 'bg-green-500' :
                slot.type === 'LAB' ? 'bg-purple-500' : 'bg-orange-500'
              )}>
                {typeInfo?.label || slot.type}
              </Badge>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mt-1">
              {slot.courseName}
            </h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <User className="w-4 h-4 text-gray-400" />
              <span>{slot.teacherTitle} {slot.teacherName}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{slot.startTime} - {slot.endTime}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{slot.room}, {slot.building}</span>
            </div>

            {slot.studentsCount && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{slot.studentsCount} étudiants</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>{slot.credits} crédits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Slot component with hover
function TimetableSlotItem({ 
  slot, 
  onClick,
  compact = false 
}: { 
  slot: TimetableSlot
  onClick?: () => void
  compact?: boolean
}) {
  const typeColors = {
    THEORY: 'timetable-theory',
    PRACTICAL: 'timetable-practical',
    LAB: 'timetable-lab',
    TUTORIAL: 'border-l-4 border-orange-500 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div 
          className={cn(
            "timetable-slot cursor-pointer",
            typeColors[slot.type],
            compact ? "p-1.5" : "p-2"
          )}
          onClick={onClick}
        >
          <div className="font-semibold text-xs">{slot.courseCode}</div>
          {!compact && (
            <>
              <div className="text-xs truncate mt-0.5 opacity-80">{slot.courseName}</div>
              <div className="text-xs mt-1 flex items-center gap-1 opacity-70">
                <MapPin className="w-3 h-3" />
                {slot.room}
              </div>
            </>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-auto p-3">
        <SlotTooltipContent slot={slot} />
      </HoverCardContent>
    </HoverCard>
  )
}

// Main Timetable Component
export function Timetable({
  slots = sampleSlots,
  viewMode = 'week',
  onSlotClick,
  highlightCurrent = true,
}: TimetableProps) {
  const [currentWeek, setCurrentWeek] = useState(0)
  
  // Get current day and time for highlighting
  const now = new Date()
  const currentDay = now.getDay() || 7 // Convert Sunday (0) to 7
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // Check if slot is current
  const isCurrentSlot = (slot: TimetableSlot) => {
    if (!highlightCurrent) return false
    if (slot.dayOfWeek !== currentDay) return false
    return currentTime >= slot.startTime && currentTime <= slot.endTime
  }

  // Get slots for a specific day and time
  const getSlotAt = (day: number, timeSlot: typeof TIME_SLOTS[0]) => {
    return slots.find(
      s => s.dayOfWeek === day && s.startTime === timeSlot.start
    )
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Emploi du temps
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(w => w - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-3">
                Semaine {currentWeek === 0 ? 'actuelle' : currentWeek > 0 ? `+${currentWeek}` : currentWeek}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(w => w + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(0)}>
                Aujourd'hui
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {COURSE_TYPES.map(type => (
              <div key={type.value} className="flex items-center gap-1.5 text-xs">
                <div className={cn("w-3 h-3 rounded", type.color)} />
                <span className="text-gray-600 dark:text-gray-400">{type.label}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row with days */}
            <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
              <div className="p-2 text-xs font-medium text-gray-500">Horaire</div>
              {DAYS_OF_WEEK.slice(0, 6).map(day => (
                <div 
                  key={day.value}
                  className={cn(
                    "p-2 text-center text-sm font-medium rounded-t-lg",
                    day.value === currentDay && currentWeek === 0
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {day.label}
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            {TIME_SLOTS.map((timeSlot, timeIndex) => (
              <div key={timeIndex} className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
                {/* Time column */}
                <div className="p-2 text-xs text-gray-500 flex flex-col justify-center">
                  <div>{timeSlot.start}</div>
                  <div className="text-gray-400">-</div>
                  <div>{timeSlot.end}</div>
                </div>

                {/* Day columns */}
                {DAYS_OF_WEEK.slice(0, 6).map(day => {
                  const slot = getSlotAt(day.value, timeSlot)
                  const isCurrent = slot && isCurrentSlot(slot)

                  return (
                    <div 
                      key={day.value}
                      className={cn(
                        "min-h-[80px] rounded-lg transition-all",
                        !slot && "bg-gray-50 dark:bg-gray-800/30",
                        isCurrent && "ring-2 ring-blue-500 ring-offset-2"
                      )}
                    >
                      {slot ? (
                        <TimetableSlotItem 
                          slot={slot} 
                          onClick={() => onSlotClick?.(slot)}
                        />
                      ) : (
                        <div className="h-full" />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

// Export a simpler card version for dashboard
export function TimetableCard({
  slots = sampleSlots,
  maxSlots = 3,
}: {
  slots?: TimetableSlot[]
  maxSlots?: number
}) {
  const now = new Date()
  const currentDay = now.getDay() || 7
  
  // Get today's slots
  const todaySlots = slots
    .filter(s => s.dayOfWeek === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, maxSlots)

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {todaySlots.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Aucun cours prévu aujourd'hui
          </p>
        ) : (
          todaySlots.map(slot => (
            <TimetableSlotItem key={slot.id} slot={slot} compact />
          ))
        )}
      </div>
    </TooltipProvider>
  )
}

export { sampleSlots }
