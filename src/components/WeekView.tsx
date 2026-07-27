import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

export function WeekView({ now }: Props) {
  const todayStr = dateToString(now)
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOf(now))
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const weekDates = useMemo(() => getWeekDates(currentMonday), [currentMonday])
  const nowMin = currentTimeMinutes(now)

  // Make sure selected date is within the current week view
  const isSelectedInWeek = weekDates.includes(selectedDate)
  const displayDate = isSelectedInWeek ? selectedDate : weekDates[0]

  const events = getEventsForDate(displayDate)

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
    <div className="flex flex-col gap-4 animate-fade-in pb-4">
      {/* Week navigator */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden" style={{ border: '1px solid #F1F5F9' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button
            onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800">{formatWeekRange(currentMonday)}</p>
            {!isCurrentWeek && (
              <button
                onClick={goToToday}
                className="text-xs text-orange-500 font-semibold mt-0.5"
              >
                → This week
              </button>
            )}
          </div>
          <button
            onClick={goForward}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <ChevronRight size={18} className="text-slate-600" />
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
            const hasPractice = dayEvents.some(e => e.type === 'P')

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'text-white shadow-md'
                    : isToday
                    ? 'text-orange-600'
                    : 'text-slate-500'
                }`}
                style={isSelected ? { background: 'linear-gradient(135deg, #f97316, #ea580c)' } : {}}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                  {dayName}
                </span>
                <span className={`text-lg font-bold leading-none mt-0.5 ${isToday && !isSelected ? 'text-orange-500' : ''}`}>
                  {dayNum}
                </span>
                <div className="flex gap-0.5 mt-1.5 h-3 items-center">
                  {dayEvents.length > 0 && (
                    <DayDots events={dayEvents} isSelected={isSelected} hasPractice={hasPractice} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day classes */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
          {new Date(displayDate + 'T12:00:00').toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
          {displayDate === todayStr && (
            <span className="ml-2 text-orange-400 normal-case">· Today</span>
          )}
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🌴</p>
            <p className="text-slate-500 font-medium">No classes</p>
            <p className="text-slate-400 text-sm">Free day — enjoy Valencia!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {events.map(event => (
              <ClassCard
                key={event.id}
                event={event}
                status={getStatus(event, nowMin, todayStr)}
                nowMin={nowMin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Week overview mini grid */}
      <WeekMiniGrid weekDates={weekDates} todayStr={todayStr} nowMin={nowMin} />
    </div>
  )
}

function DayDots({ events, isSelected, hasPractice }: { events: ClassEvent[]; isSelected: boolean; hasPractice: boolean }) {
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
      {hasPractice && !isSelected && (
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
      )}
    </>
  )
}

function WeekMiniGrid({ weekDates, todayStr, nowMin }: { weekDates: string[]; todayStr: string; nowMin: number }) {
  const allEvents = weekDates.flatMap(d => getEventsForDate(d))
  if (allEvents.length === 0) return null

  const uniqueCourses = [...new Set(allEvents.map(e => e.courseCode))]

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
        Week Summary
      </h2>
      <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #F1F5F9' }}>
        {uniqueCourses.map(code => {
          const course = COURSES[code]
          const courseEvents = allEvents.filter(e => e.courseCode === code)
          const theory = courseEvents.filter(e => e.type === 'T').length
          const practice = courseEvents.filter(e => e.type === 'P').length
          const nextUpcoming = courseEvents.find(e => {
            if (e.date > todayStr) return true
            if (e.date === todayStr && toMinutes(e.startTime) > nowMin) return true
            return false
          })
          return (
            <div key={code} className="flex items-center gap-3 py-2.5 border-b last:border-0 border-slate-50">
              <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: course.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{course.shortName}</p>
                <p className="text-xs text-slate-400">
                  {theory > 0 && `${theory}T`}
                  {theory > 0 && practice > 0 && ' · '}
                  {practice > 0 && `${practice}P`}
                  {nextUpcoming && ` · Next: ${formatTime(nextUpcoming.startTime)}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
