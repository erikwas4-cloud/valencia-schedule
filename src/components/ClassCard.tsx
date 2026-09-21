import { useState, useRef, useEffect } from 'react'
import { MapPin, Clock, FlaskConical, BookOpen, CheckCircle2, XCircle, PenLine, AlertTriangle } from 'lucide-react'
import { COURSES } from '../data/courses'
import { ClassEvent } from '../data/schedule'
import { formatTime, toMinutes, progressPercent } from '../utils/time'
import { getAttendance, setAttendance, AttendanceStatus, getNote, setNote } from '../utils/storage'
import { useTheme } from '../context/ThemeContext'

interface Props {
  event: ClassEvent
  status: 'past' | 'current' | 'upcoming'
  nowMin?: number
  compact?: boolean
  onClick?: () => void
  isConflict?: boolean
}

export function ClassCard({ event, status, nowMin = 0, compact = false, onClick, isConflict }: Props) {
  const course = COURSES[event.courseCode]
  const { isDark, isGlass } = useTheme()

  const [attendance, setAttendanceState] = useState<AttendanceStatus | null>(() => getAttendance(event.id))
  const [note, setNoteState] = useState(() => getNote(event.id))
  const [showNote, setShowNote] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (showNote && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [showNote])

  if (!course) return null

  const isPast = status === 'past'
  const isCurrent = status === 'current'
  const progress = isCurrent ? progressPercent(event.startTime, event.endTime, nowMin) : 0
  const minsLeft = isCurrent ? toMinutes(event.endTime) - nowMin : 0

  // Course colors — adapt to dark/glass themes
  const courseBadgeBg = isCurrent
    ? 'rgba(255,255,255,0.25)'
    : isGlass || isDark
    ? course.color + '30'
    : course.lightColor
  const courseBadgeText = isCurrent ? '#ffffff' : isGlass || isDark ? course.color : course.textColor

  const handleAttendanceTap = (e: React.MouseEvent) => {
    e.stopPropagation()
    const current = getAttendance(event.id)
    const next: AttendanceStatus | null = current === null ? 'present' : current === 'present' ? 'absent' : null
    setAttendance(event.id, next)
    setAttendanceState(next)
  }

  const handleNoteChange = (text: string) => {
    setNoteState(text)
    setNote(event.id, text)
  }

  const toggleNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNote(v => !v)
  }

  const isAlternate = !!event.isAlternate

  return (
    <div
      onClick={onClick}
      className={`theme-card relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      } ${isPast ? 'opacity-50' : ''} ${isAlternate ? 'opacity-70' : ''}`}
      style={{
        borderRadius: 'var(--s-radius)',
        background: isCurrent ? course.color : isPast ? 'var(--s-past)' : 'var(--s-card)',
        border: isCurrent
          ? 'none'
          : isAlternate
          ? `1.5px dashed ${course.color}88`
          : `1px solid ${isPast ? 'var(--s-past-border)' : 'var(--s-card-border)'}`,
        boxShadow: isCurrent ? 'var(--s-shadow-md)' : 'var(--s-shadow)',
        outline: isCurrent ? `2px solid ${course.color}` : 'none',
        outlineOffset: isCurrent ? '0px' : undefined,
      }}
    >
      {/* Left color bar (non-current) */}
      {!isCurrent && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{
            borderRadius: 'var(--s-radius) 0 0 var(--s-radius)',
            background: isPast ? 'var(--s-past-border)' : course.color,
            opacity: isAlternate ? 0.5 : 1,
          }}
        />
      )}

      {/* Alternate-option badge */}
      {isAlternate && !isCurrent && (
        <div
          className="absolute top-2 right-2 flex items-center gap-1 rounded-full px-1.5 py-0.5"
          style={{ background: isGlass || isDark ? course.color + '30' : course.lightColor }}
        >
          <span
            className="text-[9px] font-bold uppercase tracking-wide"
            style={{ color: isGlass || isDark ? course.color : course.textColor }}
          >
            Alt. option
          </span>
        </div>
      )}

      {/* Conflict badge */}
      {isConflict && !isCurrent && !isAlternate && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">
          <AlertTriangle size={9} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase tracking-wide">Overlap</span>
        </div>
      )}

      <div className={compact ? 'pl-4 pr-3 py-3' : 'pl-4 pr-4 py-4'}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: courseBadgeBg, color: courseBadgeText }}
              >
                {event.type === 'T' ? (
                  <span className="flex items-center gap-1">
                    <BookOpen size={9} strokeWidth={2.5} /> Theory
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <FlaskConical size={9} strokeWidth={2.5} /> Practice
                  </span>
                )}
              </span>
              {event.note && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: isCurrent ? 'rgba(255,255,255,0.2)' : '#FEF3C7',
                    color: isCurrent ? 'white' : '#92400E',
                  }}
                >
                  {event.note}
                </span>
              )}
            </div>
            <p
              className={`font-semibold leading-tight mt-1 ${compact ? 'text-sm' : 'text-base'}`}
              style={{
                color: isCurrent ? '#ffffff' : isPast ? 'var(--s-past-text)' : 'var(--s-text)',
              }}
            >
              {course.shortName}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className="text-xs font-mono font-semibold"
              style={{ color: isCurrent ? 'rgba(255,255,255,0.9)' : isPast ? 'var(--s-past-text)' : 'var(--s-text2)' }}
            >
              {formatTime(event.startTime)}
            </p>
            <p
              className="text-xs font-mono"
              style={{ color: isCurrent ? 'rgba(255,255,255,0.65)' : 'var(--s-muted)' }}
            >
              {formatTime(event.endTime)}
            </p>
          </div>
        </div>

        {/* Room & status row */}
        {!compact && (
          <div className="flex items-center justify-between mt-2">
            {event.room ? (
              <div className="flex items-center gap-1">
                <MapPin size={11} style={{ color: isCurrent ? 'rgba(255,255,255,0.65)' : 'var(--s-muted)' }} />
                <span className="text-xs font-medium" style={{ color: isCurrent ? 'rgba(255,255,255,0.85)' : 'var(--s-text2)' }}>
                  {event.room}
                </span>
              </div>
            ) : (
              <span />
            )}
            {isCurrent && minsLeft > 0 && (
              <div className="flex items-center gap-1">
                <Clock size={10} style={{ color: 'rgba(255,255,255,0.7)' }} />
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {minsLeft}min left
                </span>
              </div>
            )}
          </div>
        )}

        {/* Progress bar for current class */}
        {isCurrent && (
          <div className="mt-3 rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: 'rgba(255,255,255,0.8)' }}
            />
          </div>
        )}

        {/* Attendance + Note footer */}
        {!compact && (
          <div
            className="flex items-center gap-2 mt-3 pt-2.5"
            style={{ borderTop: `1px solid ${isCurrent ? 'rgba(255,255,255,0.15)' : 'var(--s-separator)'}` }}
          >
            {/* Attendance toggle */}
            <button
              onClick={handleAttendanceTap}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95"
              style={{
                background: attendance === 'present'
                  ? isCurrent ? 'rgba(255,255,255,0.2)' : '#DCFCE7'
                  : attendance === 'absent'
                  ? isCurrent ? 'rgba(255,255,255,0.15)' : '#FEE2E2'
                  : isCurrent ? 'rgba(255,255,255,0.1)' : 'var(--s-input)',
                color: attendance === 'present'
                  ? isCurrent ? '#ffffff' : '#166534'
                  : attendance === 'absent'
                  ? isCurrent ? 'rgba(255,255,255,0.8)' : '#991B1B'
                  : isCurrent ? 'rgba(255,255,255,0.6)' : 'var(--s-muted)',
              }}
            >
              {attendance === 'present' ? (
                <CheckCircle2 size={11} strokeWidth={2.5} />
              ) : attendance === 'absent' ? (
                <XCircle size={11} strokeWidth={2.5} />
              ) : (
                <CheckCircle2 size={11} strokeWidth={1.8} />
              )}
              {attendance === 'present' ? 'Present' : attendance === 'absent' ? 'Absent' : 'Log'}
            </button>

            {/* Note toggle */}
            <button
              onClick={toggleNote}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95"
              style={{
                background: note
                  ? isCurrent ? 'rgba(255,255,255,0.2)' : '#FEF3C7'
                  : isCurrent ? 'rgba(255,255,255,0.1)' : 'var(--s-input)',
                color: note
                  ? isCurrent ? '#ffffff' : '#92400E'
                  : isCurrent ? 'rgba(255,255,255,0.6)' : 'var(--s-muted)',
              }}
            >
              <PenLine size={11} strokeWidth={note ? 2.5 : 1.8} />
              {note ? 'Note' : 'Add note'}
            </button>
          </div>
        )}

        {/* Inline note editor */}
        {!compact && showNote && (
          <div className="mt-2">
            <textarea
              ref={textareaRef}
              value={note}
              onChange={e => handleNoteChange(e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder="Add a personal note…"
              rows={2}
              className="w-full text-xs rounded-xl px-3 py-2 resize-none outline-none"
              style={{
                background: isCurrent ? 'rgba(255,255,255,0.15)' : 'var(--s-input)',
                color: isCurrent ? '#ffffff' : 'var(--s-text)',
                border: `1px solid ${isCurrent ? 'rgba(255,255,255,0.2)' : 'var(--s-card-border)'}`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
