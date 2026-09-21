import { useState } from 'react'
import { BookOpen, FlaskConical, MapPin, Clock, ChevronRight, X, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { COURSES, Course } from '../data/courses'
import { ClassEvent, schedule } from '../data/schedule'
import { dateToString, toMinutes, currentTimeMinutes, formatTime, formatDateShort } from '../utils/time'
import { getAttendanceStats } from '../utils/storage'
import { useTheme } from '../context/ThemeContext'

interface Props {
  now: Date
}

interface CourseDetail {
  code: string
  course: Course
  events: ClassEvent[]
  alternateEvents: ClassEvent[]
  theory: ClassEvent[]
  practice: ClassEvent[]
  nextEvent: ClassEvent | null
}

function buildCourseDetails(now: Date): CourseDetail[] {
  const todayStr = dateToString(now)
  const nowMin = currentTimeMinutes(now)

  return Object.entries(COURSES).map(([code, course]) => {
    const sortByDate = (a: ClassEvent, b: ClassEvent) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.startTime.localeCompare(b.startTime)
    }
    const allForCourse = schedule.filter(e => e.courseCode === code)
    const events = allForCourse.filter(e => !e.isAlternate).sort(sortByDate)
    const alternateEvents = allForCourse.filter(e => e.isAlternate).sort(sortByDate)
    const theory = events.filter(e => e.type === 'T')
    const practice = events.filter(e => e.type === 'P')

    const nextEvent =
      events.find(e => {
        if (e.date > todayStr) return true
        if (e.date === todayStr && toMinutes(e.startTime) > nowMin) return true
        return false
      }) ?? null

    return { code, course, events, alternateEvents, theory, practice, nextEvent }
  })
}

export function CoursesView({ now }: Props) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const details = buildCourseDetails(now)

  const selected = selectedCode ? details.find(d => d.code === selectedCode) ?? null : null

  if (selected) {
    return <CourseDetailView detail={selected} onClose={() => setSelectedCode(null)} />
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-1 px-1" style={{ color: 'var(--s-muted)' }}>
        My Courses · 2026/2027 Q1
      </h2>
      {details.map(detail => (
        <CourseCard
          key={detail.code}
          detail={detail}
          onClick={() => setSelectedCode(detail.code)}
        />
      ))}
      <SemesterStats details={details} />
    </div>
  )
}

function CourseCard({ detail, onClick }: { detail: CourseDetail; onClick: () => void }) {
  const { course, theory, practice, nextEvent, events } = detail
  const { isDark } = useTheme()
  const pastEvents = events.filter(e => e.date < dateToString(new Date()))
  const attendance = getAttendanceStats(pastEvents.map(e => e.id))
  const lightBg = isDark ? course.color + '22' : course.lightColor
  const lightText = isDark ? course.color : course.textColor

  return (
    <button
      onClick={onClick}
      className="theme-card rounded-2xl p-4 text-left w-full active:scale-[0.98] transition-transform"
      style={{
        background: 'var(--s-card)',
        border: '1px solid var(--s-card-border)',
        boxShadow: 'var(--s-shadow)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-3 self-stretch rounded-full flex-shrink-0 min-h-[48px]"
          style={{ background: course.color }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold leading-tight" style={{ color: 'var(--s-text)' }}>{course.name}</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--s-muted)' }}>[{course.code}]</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--s-muted)', flexShrink: 0, marginTop: 2 }} />
          </div>

          <div className="flex items-center gap-3 mt-2">
            {theory.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--s-text2)' }}>
                <BookOpen size={10} />
                {theory.length} Theory
              </span>
            )}
            {practice.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--s-text2)' }}>
                <FlaskConical size={10} />
                {practice.length} Practice
              </span>
            )}
            {attendance.attended + attendance.missed > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium" style={{ color: attendance.pct >= 80 ? '#16A34A' : '#DC2626' }}>
                <CheckCircle2 size={10} />
                {attendance.pct}%
              </span>
            )}
          </div>

          {nextEvent ? (
            <div
              className="mt-2 rounded-xl px-2.5 py-1.5 flex items-center gap-2"
              style={{ background: lightBg }}
            >
              <Clock size={10} style={{ color: lightText }} />
              <p className="text-xs font-semibold" style={{ color: lightText }}>
                Next: {formatDateShort(nextEvent.date)} · {formatTime(nextEvent.startTime)}
              </p>
            </div>
          ) : (
            <div className="mt-2 rounded-xl px-2.5 py-1.5" style={{ background: 'var(--s-input)' }}>
              <p className="text-xs" style={{ color: 'var(--s-muted)' }}>No upcoming sessions</p>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function CourseDetailView({ detail, onClose }: { detail: CourseDetail; onClose: () => void }) {
  const { course, events, alternateEvents, theory, practice, nextEvent } = detail
  const [tab, setTab] = useState<'all' | 'T' | 'P'>('all')
  const { isDark } = useTheme()

  const filtered = tab === 'all' ? events : events.filter(e => e.type === tab)
  const pastEvents = events.filter(e => e.date < dateToString(new Date()))
  const attendance = getAttendanceStats(pastEvents.map(e => e.id))

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div
        className="theme-card rounded-3xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-mono mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>[{course.code}]</p>
            <h1 className="text-xl font-bold leading-tight">{course.name}</h1>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <X size={14} className="text-white" />
          </button>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="rounded-2xl px-4 py-2 text-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <p className="text-xl font-bold">{theory.length}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Theory</p>
          </div>
          <div className="rounded-2xl px-4 py-2 text-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <p className="text-xl font-bold">{practice.length}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Practice</p>
          </div>
          <div className="rounded-2xl px-4 py-2 text-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <p className="text-xl font-bold">{events.length}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Total</p>
          </div>
          {attendance.attended + attendance.missed > 0 && (
            <div className="rounded-2xl px-4 py-2 text-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <p className="text-xl font-bold">{attendance.pct}%</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Attended</p>
            </div>
          )}
        </div>
        {attendance.attended + attendance.missed > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <CheckCircle2 size={10} />
            <span>{attendance.attended} attended</span>
            <span>·</span>
            <XCircle size={10} />
            <span>{attendance.missed} missed</span>
            <span>·</span>
            <span>{pastEvents.length - attendance.attended - attendance.missed} unlogged</span>
          </div>
        )}
        {nextEvent && (
          <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>Next Session</p>
            <p className="font-semibold mt-0.5">
              {formatDateShort(nextEvent.date)} · {formatTime(nextEvent.startTime)}–{formatTime(nextEvent.endTime)}
            </p>
            {nextEvent.room && (
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <MapPin size={10} /> {nextEvent.room}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tab filter */}
      <div className="flex gap-2 rounded-2xl p-1" style={{ background: 'var(--s-input)' }}>
        {(['all', 'T', 'P'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t ? 'var(--s-card)' : 'transparent',
              color: tab === t ? 'var(--s-text)' : 'var(--s-muted)',
              boxShadow: tab === t ? 'var(--s-shadow)' : 'none',
            }}
          >
            {t === 'all' ? 'All' : t === 'T' ? 'Theory' : 'Practice'}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1 flex items-center gap-2" style={{ color: 'var(--s-muted)' }}>
          <Calendar size={11} />
          Schedule ({filtered.length} sessions)
        </h2>
        <div className="flex flex-col gap-2">
          {filtered.map(event => {
            const bg = isDark ? course.color + '22' : course.lightColor
            const textC = isDark ? course.color : course.textColor
            return (
              <div
                key={event.id}
                className="theme-card rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: 'var(--s-card)',
                  border: '1px solid var(--s-card-border)',
                  boxShadow: 'var(--s-shadow)',
                }}
              >
                <div
                  className="w-1 h-10 rounded-full"
                  style={{ background: event.type === 'T' ? course.color : course.color + '99' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--s-text)' }}>
                    {formatDateShort(event.date)}
                  </p>
                  <p className="text-xs flex items-center gap-2 mt-0.5" style={{ color: 'var(--s-text2)' }}>
                    <Clock size={9} />
                    {formatTime(event.startTime)}–{formatTime(event.endTime)}
                    {event.room && (
                      <>
                        <span style={{ color: 'var(--s-muted)' }}>·</span>
                        <MapPin size={9} />
                        {event.room}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: bg, color: textC }}
                  >
                    {event.type}
                  </span>
                  {event.note && (
                    <span className="text-xs rounded-full font-medium px-1.5 py-0.5" style={{ background: '#FEF3C7', color: '#92400E' }}>
                      {event.note}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alternative option (e.g. Schedule 2's Estadística group) */}
      {alternateEvents.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1 flex items-center gap-2" style={{ color: 'var(--s-muted)' }}>
            <Calendar size={11} />
            Alternative option ({alternateEvents.length} sessions)
          </h2>
          <p className="text-xs mb-2 px-1" style={{ color: 'var(--s-muted)' }}>
            A different group/day you could pick instead — not part of your actual schedule.
          </p>
          <div className="flex flex-col gap-2">
            {alternateEvents.map(event => {
              const bg = isDark ? course.color + '18' : course.lightColor
              const textC = isDark ? course.color : course.textColor
              return (
                <div
                  key={event.id}
                  className="rounded-xl px-4 py-3 flex items-center gap-3 opacity-80"
                  style={{
                    background: 'var(--s-card)',
                    border: `1.5px dashed ${course.color}88`,
                  }}
                >
                  <div className="w-1 h-10 rounded-full opacity-50" style={{ background: course.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--s-text)' }}>
                      {formatDateShort(event.date)}
                    </p>
                    <p className="text-xs flex items-center gap-2 mt-0.5" style={{ color: 'var(--s-text2)' }}>
                      <Clock size={9} />
                      {formatTime(event.startTime)}–{formatTime(event.endTime)}
                      {event.room && (
                        <>
                          <span style={{ color: 'var(--s-muted)' }}>·</span>
                          <MapPin size={9} />
                          {event.room}
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: bg, color: textC }}>
                    {event.type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function SemesterStats({ details }: { details: CourseDetail[] }) {
  const total = details.reduce((sum, d) => sum + d.events.length, 0)
  const theory = details.reduce((sum, d) => sum + d.theory.length, 0)
  const practice = details.reduce((sum, d) => sum + d.practice.length, 0)
  const todayStr = dateToString(new Date())
  const allPastIds = details.flatMap(d => d.events.filter(e => e.date < todayStr).map(e => e.id))
  const att = getAttendanceStats(allPastIds)

  return (
    <div
      className="theme-card rounded-2xl p-4 mt-2"
      style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
    >
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--s-muted)' }}>
        Semester Overview
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--s-text)' }}>{total}</p>
          <p className="text-xs" style={{ color: 'var(--s-muted)' }}>Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--s-text)' }}>{theory}</p>
          <p className="text-xs" style={{ color: 'var(--s-muted)' }}>Theory</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--s-text)' }}>{practice}</p>
          <p className="text-xs" style={{ color: 'var(--s-muted)' }}>Practice</p>
        </div>
      </div>
      {att.attended + att.missed > 0 && (
        <div className="pt-3" style={{ borderTop: '1px solid var(--s-separator)' }}>
          <div className="flex justify-between mb-1.5">
            <p className="text-xs font-medium" style={{ color: 'var(--s-text2)' }}>Overall Attendance</p>
            <p className="text-xs font-bold" style={{ color: att.pct >= 80 ? '#16A34A' : '#DC2626' }}>
              {att.pct}% ({att.attended}/{att.attended + att.missed})
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--s-input)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${att.pct}%`, background: att.pct >= 80 ? '#16A34A' : '#DC2626' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
