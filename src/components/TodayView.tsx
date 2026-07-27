import { Sun, Coffee, Sunset, Moon, ArrowRight, Calendar } from 'lucide-react'
import { ClassEvent, getEventsForDate } from '../data/schedule'
import { COURSES } from '../data/courses'
import { ClassCard } from './ClassCard'
import {
  dateToString,
  toMinutes,
  currentTimeMinutes,
  formatDuration,
  formatTime,
  getGreeting,
} from '../utils/time'

interface Props {
  now: Date
}

function getEventStatus(event: ClassEvent, nowMin: number): 'past' | 'current' | 'upcoming' {
  const s = toMinutes(event.startTime)
  const e = toMinutes(event.endTime)
  if (nowMin >= e) return 'past'
  if (nowMin >= s) return 'current'
  return 'upcoming'
}

function GreetingIcon({ hour }: { hour: number }) {
  if (hour < 6) return <Moon size={18} className="text-indigo-300" />
  if (hour < 12) return <Sun size={18} className="text-amber-400" />
  if (hour < 18) return <Coffee size={18} className="text-orange-400" />
  return <Sunset size={18} className="text-rose-400" />
}

export function TodayView({ now }: Props) {
  const todayStr = dateToString(now)
  const nowMin = currentTimeMinutes(now)
  const events = getEventsForDate(todayStr)
  const hour = now.getHours()
  const greeting = getGreeting(now)

  const currentEvent = events.find(e => getEventStatus(e, nowMin) === 'current')
  const nextEvent = events.find(e => getEventStatus(e, nowMin) === 'upcoming')
  const allDone = events.length > 0 && events.every(e => getEventStatus(e, nowMin) === 'past')
  const hasClasses = events.length > 0

  const nextMinsAway = nextEvent ? toMinutes(nextEvent.startTime) - nowMin : null
  const semesterStart = new Date('2026-09-07')
  const semesterEnd = new Date('2026-12-20')
  const beforeSemester = now < semesterStart
  const afterSemester = now > semesterEnd

  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-4">

      {/* Greeting + clock */}
      <div
        className="rounded-3xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <GreetingIcon hour={hour} />
          <span className="text-sm font-medium text-orange-100">{greeting}</span>
        </div>
        <div className="text-4xl font-bold tracking-tight font-mono">{timeStr}</div>
        <div className="text-sm text-orange-100 mt-1">
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>

        {/* Status pill */}
        <div className="mt-4">
          {beforeSemester && (
            <div className="bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold">Semester starts September 7</p>
              <p className="text-xs text-orange-100 mt-0.5">Enjoy the rest of summer ☀️</p>
            </div>
          )}
          {afterSemester && (
            <div className="bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold">Semester complete!</p>
              <p className="text-xs text-orange-100 mt-0.5">Great work this semester 🎉</p>
            </div>
          )}
          {!beforeSemester && !afterSemester && !hasClasses && (
            <div className="bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold">Free day!</p>
              <p className="text-xs text-orange-100 mt-0.5">Go explore Valencia 🌊</p>
            </div>
          )}
          {currentEvent && (
            <div className="bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-xs text-orange-100 font-medium uppercase tracking-wide">Now in class</p>
              <p className="text-base font-bold mt-0.5">{COURSES[currentEvent.courseCode]?.name}</p>
              <p className="text-xs text-orange-100">
                Ends {formatTime(currentEvent.endTime)} · {toMinutes(currentEvent.endTime) - nowMin}min left
              </p>
            </div>
          )}
          {!currentEvent && nextEvent && (
            <div className="bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-xs text-orange-100 font-medium uppercase tracking-wide">Next class</p>
              <div className="flex items-center justify-between mt-0.5">
                <div>
                  <p className="text-base font-bold">{COURSES[nextEvent.courseCode]?.name}</p>
                  <p className="text-xs text-orange-100">
                    {formatTime(nextEvent.startTime)}
                    {nextEvent.room && ` · ${nextEvent.room}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatDuration(nextMinsAway ?? 0)}</p>
                  <p className="text-xs text-orange-100">away</p>
                </div>
              </div>
            </div>
          )}
          {allDone && (
            <div className="bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold">All done for today! 🎉</p>
              <p className="text-xs text-orange-100 mt-0.5">No more classes — enjoy your evening</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's schedule */}
      {hasClasses && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
            Today's Schedule
          </h2>
          <div className="flex flex-col gap-2.5">
            {events.map((event) => (
              <ClassCard
                key={event.id}
                event={event}
                status={getEventStatus(event, nowMin)}
                nowMin={nowMin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tomorrow preview */}
      <TomorrowPreview now={now} nowMin={nowMin} />
    </div>
  )
}

function TomorrowPreview({ now }: { now: Date; nowMin: number }) {
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = dateToString(tomorrow)
  const events = getEventsForDate(tomorrowStr)
  if (events.length === 0) return null

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1 flex items-center gap-2">
        <Calendar size={12} />
        Tomorrow
      </h2>
      <div
        className="rounded-2xl p-4 flex flex-col gap-2"
        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
      >
        {events.slice(0, 4).map((event) => {
          const course = COURSES[event.courseCode]
          return (
            <div key={event.id} className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: course.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{course.shortName}</p>
                <p className="text-xs text-slate-400">{formatTime(event.startTime)} – {formatTime(event.endTime)}</p>
              </div>
              <div className="flex-shrink-0">
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: course.lightColor, color: course.textColor }}
                >
                  {event.type}
                </span>
              </div>
            </div>
          )
        })}
        {events.length > 4 && (
          <p className="text-xs text-slate-400 flex items-center gap-1 pl-4">
            <ArrowRight size={10} /> +{events.length - 4} more classes
          </p>
        )}
      </div>
    </div>
  )
}
