import { Sun, Coffee, Sunset, Moon, ArrowRight, Calendar, AlertCircle } from 'lucide-react'
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
import { getSemesterProgress, getEventsForDate as getAcademicEventsForDate, getNextEvent } from '../data/academicCalendar'
import { useTheme } from '../context/ThemeContext'

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

function getFreeGaps(events: ClassEvent[]): Array<{ afterTime: string; beforeTime: string; minutes: number }> {
  const sorted = [...events].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
  const gaps: Array<{ afterTime: string; beforeTime: string; minutes: number }> = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = toMinutes(sorted[i + 1].startTime) - toMinutes(sorted[i].endTime)
    if (gap >= 30) {
      gaps.push({ afterTime: sorted[i].endTime, beforeTime: sorted[i + 1].startTime, minutes: gap })
    }
  }
  return gaps
}

function GreetingIcon({ hour }: { hour: number }) {
  if (hour < 6) return <Moon size={18} className="text-indigo-300" />
  if (hour < 12) return <Sun size={18} className="text-amber-300" />
  if (hour < 18) return <Coffee size={18} className="text-orange-300" />
  return <Sunset size={18} className="text-rose-300" />
}

export function TodayView({ now }: Props) {
  const todayStr = dateToString(now)
  const nowMin = currentTimeMinutes(now)
  const events = getEventsForDate(todayStr)
  const hour = now.getHours()
  const greeting = getGreeting(now)
  const { isDark } = useTheme()

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

  const conflictIds = getConflictIds(events)
  const freeGaps = getFreeGaps(events)

  // Build interleaved list of events + gaps
  const sortedEvents = [...events].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
  type ListItem =
    | { kind: 'event'; event: ClassEvent }
    | { kind: 'gap'; afterTime: string; beforeTime: string; minutes: number }

  const listItems: ListItem[] = []
  for (let i = 0; i < sortedEvents.length; i++) {
    listItems.push({ kind: 'event', event: sortedEvents[i] })
    if (i < sortedEvents.length - 1) {
      const gap = toMinutes(sortedEvents[i + 1].startTime) - toMinutes(sortedEvents[i].endTime)
      if (gap >= 30) {
        listItems.push({ kind: 'gap', afterTime: sortedEvents[i].endTime, beforeTime: sortedEvents[i + 1].startTime, minutes: gap })
      }
    }
  }

  // Academic events for today
  const academicToday = getAcademicEventsForDate(todayStr)
  const nextAcademic = getNextEvent(todayStr)

  // Semester progress
  const { weekNum, totalWeeks, pct } = getSemesterProgress(now)
  const inSemester = !beforeSemester && !afterSemester

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* Academic event banner (for today's special events) */}
      {academicToday.length > 0 && academicToday.map(ev => (
        <div
          key={ev.id}
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: ev.type === 'holiday' || ev.type === 'break'
              ? isDark ? '#1E293B' : '#FEF3C7'
              : ev.type === 'special'
              ? isDark ? '#1E293B' : '#EFF6FF'
              : isDark ? '#1E293B' : '#F0FDF4',
            border: `1px solid var(--s-card-border)`,
          }}
        >
          <span className="text-xl">{ev.icon}</span>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--s-text)' }}>{ev.title}</p>
            {ev.description && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--s-text2)' }}>{ev.description}</p>
            )}
          </div>
        </div>
      ))}

      {/* Hero clock card */}
      <div
        className="theme-card rounded-3xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, var(--s-hero-from) 0%, var(--s-hero-to) 100%)` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <GreetingIcon hour={hour} />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{greeting}</span>
        </div>
        <div className="text-4xl font-bold tracking-tight font-mono">{timeStr}</div>
        <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>

        {/* Status pill */}
        <div className="mt-4">
          {beforeSemester && (
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <p className="text-sm font-semibold">Semester starts September 7</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>Enjoy the rest of summer ☀️</p>
            </div>
          )}
          {afterSemester && (
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <p className="text-sm font-semibold">Semester complete!</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>Great work this semester 🎉</p>
            </div>
          )}
          {!beforeSemester && !afterSemester && !hasClasses && (
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <p className="text-sm font-semibold">Free day!</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>Go explore Valencia 🌊</p>
            </div>
          )}
          {currentEvent && (
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>Now in class</p>
              <p className="text-base font-bold mt-0.5">{COURSES[currentEvent.courseCode]?.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Ends {formatTime(currentEvent.endTime)} · {toMinutes(currentEvent.endTime) - nowMin}min left
              </p>
            </div>
          )}
          {!currentEvent && nextEvent && (
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>Next class</p>
              <div className="flex items-center justify-between mt-0.5">
                <div>
                  <p className="text-base font-bold">{COURSES[nextEvent.courseCode]?.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {formatTime(nextEvent.startTime)}{nextEvent.room && ` · ${nextEvent.room}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatDuration(nextMinsAway ?? 0)}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>away</p>
                </div>
              </div>
            </div>
          )}
          {allDone && (
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <p className="text-sm font-semibold">All done for today! 🎉</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>No more classes — enjoy your evening</p>
            </div>
          )}
        </div>
      </div>

      {/* Semester progress */}
      {inSemester && (
        <div
          className="theme-card rounded-2xl px-4 py-3"
          style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--s-muted)' }}>
              Semester Progress
            </p>
            <p className="text-xs font-bold" style={{ color: 'var(--s-accent)' }}>
              Week {weekNum} of {totalWeeks}
            </p>
          </div>
          <div className="rounded-full overflow-hidden h-2" style={{ background: 'var(--s-input)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, var(--s-hero-from), var(--s-hero-to))` }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--s-muted)' }}>{pct}% complete</p>
        </div>
      )}

      {/* Upcoming academic event chip */}
      {inSemester && nextAcademic && !academicToday.includes(nextAcademic) && (
        <div
          className="theme-card rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
        >
          <AlertCircle size={14} style={{ color: 'var(--s-accent)', flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="text-xs font-bold" style={{ color: 'var(--s-text)' }}>
              {nextAcademic.icon} Upcoming: {nextAcademic.title}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--s-text2)' }}>
              {nextAcademic.date
                ? new Date(nextAcademic.date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : nextAcademic.startDate
                ? new Date(nextAcademic.startDate + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : ''
              }
              {nextAcademic.description && ` · ${nextAcademic.description}`}
            </p>
          </div>
        </div>
      )}

      {/* Today's schedule */}
      {hasClasses && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--s-muted)' }}>
            Today's Schedule
          </h2>
          <div className="flex flex-col gap-2.5">
            {listItems.map((item, idx) => {
              if (item.kind === 'event') {
                return (
                  <ClassCard
                    key={item.event.id}
                    event={item.event}
                    status={getEventStatus(item.event, nowMin)}
                    nowMin={nowMin}
                    isConflict={conflictIds.has(item.event.id)}
                  />
                )
              }
              return (
                <div key={`gap-${idx}`} className="flex items-center gap-3 px-2">
                  <div className="flex-1 h-px" style={{ background: 'var(--s-separator)' }} />
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--s-muted)' }}>
                    {Math.floor(item.minutes / 60) > 0 ? `${Math.floor(item.minutes / 60)}h ` : ''}
                    {item.minutes % 60 > 0 ? `${item.minutes % 60}min free` : 'free'}
                    {' '}· {formatTime(item.afterTime)} – {formatTime(item.beforeTime)}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--s-separator)' }} />
                </div>
              )
            })}
          </div>
          {freeGaps.length === 0 && events.length > 1 && (
            <p className="text-xs mt-3 px-1" style={{ color: 'var(--s-muted)' }}>
              No significant gaps today
            </p>
          )}
        </div>
      )}

      {/* Tomorrow preview */}
      <TomorrowPreview now={now} />
    </div>
  )
}

function TomorrowPreview({ now }: { now: Date }) {
  const { isDark } = useTheme()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = dateToString(tomorrow)
  const events = getEventsForDate(tomorrowStr)
  if (events.length === 0) return null

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1 flex items-center gap-2" style={{ color: 'var(--s-muted)' }}>
        <Calendar size={12} />
        Tomorrow
      </h2>
      <div
        className="theme-card rounded-2xl p-4 flex flex-col gap-2"
        style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
      >
        {events.slice(0, 4).map((event) => {
          const course = COURSES[event.courseCode]
          const bg = isDark ? course.color + '25' : course.lightColor
          const textC = isDark ? course.color : course.textColor
          return (
            <div key={event.id} className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: course.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--s-text)' }}>{course.shortName}</p>
                <p className="text-xs" style={{ color: 'var(--s-text2)' }}>
                  {formatTime(event.startTime)} – {formatTime(event.endTime)}
                </p>
              </div>
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ background: bg, color: textC }}
              >
                {event.type}
              </span>
            </div>
          )
        })}
        {events.length > 4 && (
          <p className="text-xs flex items-center gap-1 pl-4" style={{ color: 'var(--s-muted)' }}>
            <ArrowRight size={10} /> +{events.length - 4} more classes
          </p>
        )}
      </div>
    </div>
  )
}
