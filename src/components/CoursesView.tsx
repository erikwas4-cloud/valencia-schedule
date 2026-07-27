import { useState } from 'react'
import { BookOpen, FlaskConical, MapPin, Clock, ChevronRight, X, Calendar } from 'lucide-react'
import { COURSES, Course } from '../data/courses'
import { ClassEvent, schedule } from '../data/schedule'
import { dateToString, toMinutes, currentTimeMinutes, formatTime, formatDateShort } from '../utils/time'

interface Props {
  now: Date
}

interface CourseDetail {
  code: string
  course: Course
  events: ClassEvent[]
  theory: ClassEvent[]
  practice: ClassEvent[]
  nextEvent: ClassEvent | null
}

function buildCourseDetails(now: Date): CourseDetail[] {
  const todayStr = dateToString(now)
  const nowMin = currentTimeMinutes(now)

  return Object.entries(COURSES).map(([code, course]) => {
    const events = schedule
      .filter(e => e.courseCode === code)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.startTime.localeCompare(b.startTime)
      })
    const theory = events.filter(e => e.type === 'T')
    const practice = events.filter(e => e.type === 'P')

    const nextEvent = events.find(e => {
      if (e.date > todayStr) return true
      if (e.date === todayStr && toMinutes(e.startTime) > nowMin) return true
      return false
    }) ?? null

    return { code, course, events, theory, practice, nextEvent }
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
    <div className="flex flex-col gap-3 animate-fade-in pb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 px-1">
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
  const { course, theory, practice, nextEvent } = detail

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm text-left w-full active:scale-[0.98] transition-transform"
      style={{ border: '1px solid #F1F5F9' }}
    >
      <div className="flex items-center gap-3">
        {/* Color pill */}
        <div
          className="w-3 self-stretch rounded-full flex-shrink-0 min-h-[48px]"
          style={{ background: course.color }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-slate-800 leading-tight">{course.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">[{course.code}]</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-1" />
          </div>

          <div className="flex items-center gap-3 mt-2">
            {theory.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                <BookOpen size={10} />
                {theory.length} Theory
              </span>
            )}
            {practice.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                <FlaskConical size={10} />
                {practice.length} Practice
              </span>
            )}
          </div>

          {nextEvent && (
            <div
              className="mt-2 rounded-xl px-2.5 py-1.5 flex items-center gap-2"
              style={{ background: course.lightColor }}
            >
              <Clock size={10} style={{ color: course.textColor }} />
              <p className="text-xs font-semibold" style={{ color: course.textColor }}>
                Next: {formatDateShort(nextEvent.date)} · {formatTime(nextEvent.startTime)}
              </p>
            </div>
          )}
          {!nextEvent && (
            <div className="mt-2 rounded-xl px-2.5 py-1.5 bg-slate-50">
              <p className="text-xs text-slate-400">No upcoming sessions</p>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function CourseDetailView({ detail, onClose }: { detail: CourseDetail; onClose: () => void }) {
  const { course, events, theory, practice, nextEvent } = detail
  const [tab, setTab] = useState<'all' | 'T' | 'P'>('all')

  const filtered = tab === 'all' ? events : events.filter(e => e.type === tab)

  return (
    <div className="flex flex-col gap-4 animate-slide-up pb-4">
      {/* Header */}
      <div
        className="rounded-3xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-mono text-white/70 mb-1">[{course.code}]</p>
            <h1 className="text-xl font-bold leading-tight">{course.name}</h1>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-xl font-bold">{theory.length}</p>
            <p className="text-xs text-white/70">Theory</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-xl font-bold">{practice.length}</p>
            <p className="text-xs text-white/70">Practice</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-xl font-bold">{events.length}</p>
            <p className="text-xs text-white/70">Total</p>
          </div>
        </div>
        {nextEvent && (
          <div className="mt-4 bg-white/20 rounded-2xl px-4 py-3">
            <p className="text-xs text-white/70 uppercase tracking-wide font-medium">Next Session</p>
            <p className="font-semibold mt-0.5">
              {formatDateShort(nextEvent.date)} · {formatTime(nextEvent.startTime)}–{formatTime(nextEvent.endTime)}
            </p>
            {nextEvent.room && (
              <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {nextEvent.room}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tab filter */}
      <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
        {(['all', 'T', 'P'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
            }`}
          >
            {t === 'all' ? 'All' : t === 'T' ? 'Theory' : 'Practice'}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1 flex items-center gap-2">
          <Calendar size={11} />
          Schedule ({filtered.length} sessions)
        </h2>
        <div className="flex flex-col gap-2">
          {filtered.map(event => {
            const rooms = event.room ? (
              <span className="flex items-center gap-1">
                <MapPin size={9} />
                {event.room}
              </span>
            ) : null
            return (
              <div
                key={event.id}
                className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
                style={{ border: '1px solid #F1F5F9' }}
              >
                <div className="w-1 h-10 rounded-full" style={{ background: event.type === 'T' ? course.color : course.color + '99' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDateShort(event.date)}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <Clock size={9} />
                    {formatTime(event.startTime)}–{formatTime(event.endTime)}
                    {rooms && <span className="text-slate-300">·</span>}
                    {rooms}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: course.lightColor, color: course.textColor }}
                  >
                    {event.type}
                  </span>
                  {event.note && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                      {event.note}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SemesterStats({ details }: { details: CourseDetail[] }) {
  const total = details.reduce((sum, d) => sum + d.events.length, 0)
  const theory = details.reduce((sum, d) => sum + d.theory.length, 0)
  const practice = details.reduce((sum, d) => sum + d.practice.length, 0)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mt-2" style={{ border: '1px solid #F1F5F9' }}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        Semester Overview
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{total}</p>
          <p className="text-xs text-slate-400">Total sessions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{theory}</p>
          <p className="text-xs text-slate-400">Theory</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{practice}</p>
          <p className="text-xs text-slate-400">Practice</p>
        </div>
      </div>
    </div>
  )
}
