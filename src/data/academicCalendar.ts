export type AcademicEventType = 'holiday' | 'break' | 'exam-period' | 'special' | 'info'

export interface AcademicEvent {
  id: string
  title: string
  type: AcademicEventType
  date?: string       // YYYY-MM-DD single day
  startDate?: string  // YYYY-MM-DD range start
  endDate?: string    // YYYY-MM-DD range end
  description?: string
  icon: string
}

// Data extracted from 26_27_Primero_Segundo_Tercero_Grados.pdf
// and 26_27_Examenes_Extraordinarios_Grados.pdf
export const ACADEMIC_EVENTS: AcademicEvent[] = [
  {
    id: 'q1-start',
    title: 'Q1 begins',
    type: 'info',
    date: '2026-09-07',
    description: 'First day of first semester teaching',
    icon: '🎒',
  },
  {
    id: 'hispanidad',
    title: 'Día de la Hispanidad',
    type: 'holiday',
    date: '2026-10-12',
    description: 'National holiday — no classes',
    icon: '🇪🇸',
  },
  {
    id: 'oct20-special',
    title: 'Special timetable',
    type: 'special',
    date: '2026-10-20',
    description: 'Tuesday follows the Friday timetable today',
    icon: '🔄',
  },
  {
    id: 'all-saints-break',
    title: 'All Saints break',
    type: 'break',
    startDate: '2026-10-26',
    endDate: '2026-11-01',
    description: 'Mid-semester break',
    icon: '🍂',
  },
  {
    id: 'constitucion',
    title: 'Día de la Constitución',
    type: 'holiday',
    date: '2026-12-06',
    description: 'National holiday — no classes',
    icon: '📜',
  },
  {
    id: 'inmaculada',
    title: 'La Inmaculada',
    type: 'holiday',
    date: '2026-12-08',
    description: 'National holiday — no classes',
    icon: '⛪',
  },
  {
    id: 'dec16-special',
    title: 'Special timetable',
    type: 'special',
    date: '2026-12-16',
    description: 'Wednesday follows the Tuesday timetable today',
    icon: '🔄',
  },
  {
    id: 'q1-end',
    title: 'Last day of Q1 classes',
    type: 'info',
    date: '2026-12-20',
    description: 'End of first semester teaching period',
    icon: '📚',
  },
  {
    id: 'christmas',
    title: 'Christmas break',
    type: 'break',
    startDate: '2026-12-21',
    endDate: '2027-01-04',
    description: 'Winter holiday break',
    icon: '🎄',
  },
  {
    id: 'q1-exams',
    title: 'Q1 Final exams',
    type: 'exam-period',
    startDate: '2027-01-11',
    endDate: '2027-01-30',
    description: 'First semester final examination period',
    icon: '📝',
  },
  {
    id: 'extraordinary-exams',
    title: 'Extraordinary exams',
    type: 'exam-period',
    startDate: '2027-07-12',
    endDate: '2027-07-30',
    description: 'Resit exam period (failed subjects)',
    icon: '📋',
  },
]

function eventStartDate(ev: AcademicEvent): string {
  return ev.date || ev.startDate || ''
}

export function getEventsForDate(dateStr: string): AcademicEvent[] {
  return ACADEMIC_EVENTS.filter(ev => {
    if (ev.date) return ev.date === dateStr
    if (ev.startDate && ev.endDate) return dateStr >= ev.startDate && dateStr <= ev.endDate
    return false
  })
}

export function getNextEvent(fromDate: string): AcademicEvent | null {
  const upcoming = ACADEMIC_EVENTS.filter(ev => eventStartDate(ev) >= fromDate)
  return upcoming.length > 0 ? upcoming[0] : null
}

export function getSemesterWeek(dateStr: string): number | null {
  if (dateStr < '2026-09-07' || dateStr > '2026-12-20') return null
  const start = new Date('2026-09-07')
  const current = new Date(dateStr)
  const days = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(15, Math.max(1, Math.floor(days / 7) + 1))
}

export function getSemesterProgress(now: Date): { weekNum: number; totalWeeks: number; pct: number } {
  const start = new Date('2026-09-07').getTime()
  const end = new Date('2026-12-20').getTime()
  const current = now.getTime()
  const totalMs = end - start
  const elapsedMs = Math.max(0, Math.min(totalMs, current - start))
  const pct = Math.round((elapsedMs / totalMs) * 100)
  const weekNum = Math.min(15, Math.max(1, Math.ceil((elapsedMs / (1000 * 60 * 60 * 24 * 7)))))
  return { weekNum, totalWeeks: 15, pct }
}
