import { MapPin, Clock, FlaskConical, BookOpen } from 'lucide-react'
import { COURSES } from '../data/courses'
import { ClassEvent } from '../data/schedule'
import { formatTime, toMinutes, progressPercent } from '../utils/time'

interface Props {
  event: ClassEvent
  status: 'past' | 'current' | 'upcoming'
  nowMin?: number
  compact?: boolean
  onClick?: () => void
}

export function ClassCard({ event, status, nowMin = 0, compact = false, onClick }: Props) {
  const course = COURSES[event.courseCode]
  if (!course) return null

  const isPast = status === 'past'
  const isCurrent = status === 'current'
  const progress = isCurrent ? progressPercent(event.startTime, event.endTime, nowMin) : 0
  const minsLeft = isCurrent
    ? toMinutes(event.endTime) - nowMin
    : 0

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl transition-all duration-200
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${isPast ? 'opacity-45' : ''}
        ${isCurrent ? 'shadow-lg ring-2' : 'shadow-sm'}
      `}
      style={{
        background: isCurrent ? course.color : isPast ? '#F1F5F9' : 'white',
        outline: isCurrent ? `2px solid ${course.color}` : 'none',
        border: isCurrent ? 'none' : `1px solid ${isPast ? '#E2E8F0' : '#F1F5F9'}`,
      }}
    >
      {/* Left color bar */}
      {!isCurrent && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: isPast ? '#CBD5E1' : course.color }}
        />
      )}

      <div className={compact ? 'pl-4 pr-3 py-3' : 'pl-4 pr-4 py-4'}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: isCurrent ? 'rgba(255,255,255,0.25)' : course.lightColor,
                  color: isCurrent ? 'white' : course.textColor,
                }}
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
              style={{ color: isCurrent ? 'white' : isPast ? '#94A3B8' : '#0F172A' }}
            >
              {course.shortName}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className="text-xs font-mono font-semibold"
              style={{ color: isCurrent ? 'rgba(255,255,255,0.9)' : isPast ? '#94A3B8' : '#64748B' }}
            >
              {formatTime(event.startTime)}
            </p>
            <p
              className="text-xs font-mono"
              style={{ color: isCurrent ? 'rgba(255,255,255,0.7)' : isPast ? '#CBD5E1' : '#94A3B8' }}
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
                <MapPin
                  size={11}
                  style={{ color: isCurrent ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: isCurrent ? 'rgba(255,255,255,0.85)' : '#64748B' }}
                >
                  {event.room}
                </span>
              </div>
            ) : (
              <span />
            )}
            {isCurrent && minsLeft > 0 && (
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-white/70" />
                <span className="text-xs text-white/90 font-semibold">{minsLeft}min left</span>
              </div>
            )}
          </div>
        )}

        {/* Progress bar for current class */}
        {isCurrent && (
          <div className="mt-3 bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
