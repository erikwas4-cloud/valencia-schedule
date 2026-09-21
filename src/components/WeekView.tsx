import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { ClassEvent, getEventsForDate, getMondayOf } from '../data/schedule'
import { COURSES } from '../data/courses'
import { ClassCard } from './ClassCard'
import {
  dateToString,
  toMinutes,
  currentTimeMinutes,
  getWeekDates,
  addWeeks,
  formatWeekRange,
  getDayShort,
  formatTime,
} from '../utils/time'
import { useTheme } from '../context/ThemeContext'

interface Props {
  now: Date
}

function getStatus(event: ClassEvent, nowMin: number, todayStr: string): 'past' | 'current' | 'upcoming' {
  if (event.date < todayStr) return 'past'
  if (event.date > todayStr) return 'upcoming'
  const s = toMinutes(event.startTime)
  const e = toMinutes(event.endTime)
  if (nowMin >= e) return 'past'
  if (nowMin >= s) return 'current'
  return 'upcoming'
}

function getConflictIds(events: ClassEvent[]): Set<string> {
  const conflicts = new Set<string>()
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i], b = events[j]
      if (toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime)) {
        conflicts.add(a.id)
        conflicts.add(b.id)
      }
    }
  }
  return conflicts
}

function getWeeklyMinutes(events: ClassEvent[]): number {
  return events.reduce((sum, e) => sum + toMinutes(e.endTime) - toMinutes(e.startTime), 0)
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  if (h === 0) return `${m}min`
  return `${h}h ${m}min`
}

export function WeekView({ now }: Props) {
  const todayStr = dateToString(now)
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOf(now))
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const { isDark } = useTheme()

  const weekDates = useMemo(() => getWeekDates(currentMonday), [currentMonday])
  const nowMin = currentTimeMinutes(now)

  const isSelectedInWeek = weekDates.includes(selectedDate)
  const displayDate = isSelectedInWeek ? selectedDate : weekDates[0]

  const events = getEventsForDate(displayDate)
  const conflictIds = getConflictIds(events.filter(e => !e.isAlternate))

  const allWeekEvents = useMemo(() => weekDates.flatMap(d => getEventsForDate(d)), [weekDates])
  const weeklyMinutes = getWeeklyMinutes(allWeekEvents.filter(e => !e.isAlternate))

  const goBack = () => {
    const newMonday = addWeeks(currentMonday, -1)
    setCurrentMonday(newMonday)
    setSelectedDate(getWeekDates(newMonday)[0])
  }

  const goForward = () => {
    const newMonday = addWeeks(currentMonday, 1)
    setCurrentMonday(newMonday)
    setSelectedDate(getWeekDates(newMonday)[0])
  }

  const goToToday = () => {
    const todayMonday = getMondayOf(now)
    setCurrentMonday(todayMonday)
    setSelectedDate(todayStr)
  }

  const isCurrentWeek = currentMonday === getMondayOf(now)

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Week navigator card */}
      <div
        className="theme-card rounded-3xl overflow-hidden"
        style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button
            onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
            style={{ background: 'var(--s-input)' }}
          >
            <ChevronLeft size={18} style={{ color: 'var(--s-text2)' }} />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: 'var(--s-text)' }}>{formatWeekRange(currentMonday)}</p>
            {!isCurrentWeek && (
              <button onClick={goToToday} className="text-xs font-semibold mt-0.5" style={{ color: 'var(--s-accent)' }}>
                → This week
              </button>
            )}
            {weeklyMinutes > 0 && (
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Clock size={10} style={{ color: 'var(--s-muted)' }} />
                <p className="text-[11px]" style={{ color: 'var(--s-muted)' }}>
                  {formatMinutes(weeklyMinutes)} · {allWeekEvents.length} classes
                </p>
              </div>
            )}
          </div>
          <button
            onClick={goForward}
            className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
            style={{ background: 'var(--s-input)' }}
          >
            <ChevronRight size={18} style={{ color: 'var(--s-text2)' }} />
          </button>
        </div>

        {/* Day picker strip */}
        <div className="grid grid-cols-5 gap-1 px-3 pb-4">
          {weekDates.map((date) => {
            const dayEvents = getEventsForDate(date)
            const isToday = date === todayStr
            const isSelected = date === displayDate
            const dayNum = new Date(date + 'T12:00:00').getDate()
            const dayName = getDayShort(date)
            const dayConflicts = getConflictIds(dayEvents.filter(e => !e.isAlternate))
            const hasConflict = dayConflicts.size > 0

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className="flex flex-col items-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-95 relative"
                style={isSelected ? { background: `linear-gradient(135deg, var(--s-hero-from), var(--s-hero-to))` } : {}}
              >
                {hasConflict && !isSelected && (
                  <div
                    className="absolute top-1 right-1 w-2 h-2 rounded-full"
                    style={{ background: '#F59E0B' }}
                  />
                )}
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    color: isSelected ? 'rgba(255,255,255,0.8)' : isToday ? 'var(--s-accent)' : 'var(--s-muted)',
                  }}
                >
                  {dayName}
                </span>
                <span
                  className="text-lg font-bold leading-none mt-0.5"
                  style={{
                    color: isSelected ? '#ffffff' : isToday ? 'var(--s-accent)' : 'var(--s-text)',
                  }}
                >
                  {dayNum}
                </span>
                <div className="flex gap-0.5 mt-1.5 h-3 items-center">
                  {dayEvents.length > 0 && (
                    <DayDots events={dayEvents} isSelected={isSelected} isDark={isDark} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day classes */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--s-muted)' }}>
          {new Date(displayDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          {displayDate === todayStr && (
            <span className="ml-2 normal-case" style={{ color: 'var(--s-accent)' }}>· Today</span>
          )}
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🌴</p>
            <p className="font-medium" style={{ color: 'var(--s-text2)' }}>No classes</p>
            <p className="text-sm" style={{ color: 'var(--s-muted)' }}>Free day — enjoy Valencia!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {events.map(event => (
              <ClassCard
                key={event.id}
                event={event}
                status={getStatus(event, nowMin, todayStr)}
                nowMin={nowMin}
                isConflict={conflictIds.has(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Week summary mini grid */}
      <WeekMiniGrid weekDates={weekDates} todayStr={todayStr} nowMin={nowMin} isDark={isDark} />
    </div>
  )
}

function DayDots({ events, isSelected, isDark }: { events: ClassEvent[]; isSelected: boolean; isDark: boolean }) {
  const codes = [...new Set(events.map(e => e.courseCode))].slice(0, 3)
  return (
    <>
      {codes.map(code => {
        const course = COURSES[code]
        return (
          <div
            key={code}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isSelected ? 'rgba(255,255,255,0.7)' : course.color }}
          />
        )
      })}
      {!isSelected && !isDark && events.some(e => e.type === 'P') && (
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--s-muted)' }} />
      )}
    </>
  )
}

function WeekMiniGrid({ weekDates, todayStr, nowMin, isDark }: { weekDates: string[]; todayStr: string; nowMin: number; isDark: boolean }) {
  const allEvents = weekDates.flatMap(d => getEventsForDate(d)).filter(e => !e.isAlternate)
  if (allEvents.length === 0) return null

  const uniqueCourses = [...new Set(allEvents.map(e => e.courseCode))]

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--s-muted)' }}>
        Week Summary
      </h2>
      <div
        className="theme-card rounded-2xl p-4"
        style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
      >
        {uniqueCourses.map((code, idx) => {
          const course = COURSES[code]
          const courseEvents = allEvents.filter(e => e.courseCode === code)
          const theory = courseEvents.filter(e => e.type === 'T').length
          const practice = courseEvents.filter(e => e.type === 'P').length
          const nextUpcoming = courseEvents.find(e => {
            if (e.date > todayStr) return true
            if (e.date === todayStr && toMinutes(e.startTime) > nowMin) return true
            return false
          })
          const bg = isDark ? course.color + '25' : course.lightColor
          const textC = isDark ? course.color : course.textColor
          return (
            <div
              key={code}
              className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: idx < uniqueCourses.length - 1 ? '1px solid var(--s-separator)' : 'none' }}
            >
              <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: course.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--s-text)' }}>{course.shortName}</p>
                <p className="text-xs" style={{ color: 'var(--s-text2)' }}>
                  {theory > 0 && `${theory}T`}
                  {theory > 0 && practice > 0 && ' · '}
                  {practice > 0 && `${practice}P`}
                  {nextUpcoming && ` · Next: ${formatTime(nextUpcoming.startTime)}`}
                </p>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: bg, color: textC }}
              >
                {theory + practice}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
