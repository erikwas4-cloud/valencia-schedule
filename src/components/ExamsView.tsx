import { ClipboardCheck, GraduationCap } from 'lucide-react'
import { COURSES } from '../data/courses'
import { getExamsSorted, daysUntil, ExamEvent } from '../data/exams'
import { dateToString, formatDateLong } from '../utils/time'
import { useTheme } from '../context/ThemeContext'

interface Props {
  now: Date
}

export function ExamsView({ now }: Props) {
  const todayStr = dateToString(now)
  const exams = getExamsSorted()
  const upcoming = exams.filter(e => e.date >= todayStr)
  const past = exams.filter(e => e.date < todayStr)
  const { isDark } = useTheme()

  const nextExam = upcoming[0] ?? null

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-1 px-1" style={{ color: 'var(--s-muted)' }}>
        Exam Schedule · 2026/2027 Q1
      </h2>

      {nextExam && (
        <div
          className="theme-card rounded-3xl p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${COURSES[nextExam.courseCode].color}, ${COURSES[nextExam.courseCode].color}cc)` }}
        >
          <div className="flex items-center gap-2 mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <ClipboardCheck size={16} />
            <span className="text-sm font-medium">Next exam</span>
          </div>
          <p className="text-xl font-bold leading-tight mt-1">{COURSES[nextExam.courseCode].name}</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {formatDateLong(nextExam.date)}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            >
              {nextExam.kind === 'final' ? 'Final · ' + nextExam.label : 'Partial · ' + nextExam.label}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {formatCountdown(daysUntil(nextExam.date, todayStr))}
            </span>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--s-muted)' }}>
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-2.5">
            {upcoming.map(exam => (
              <ExamCard key={exam.id} exam={exam} todayStr={todayStr} isDark={isDark} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--s-muted)' }}>
            Past
          </h2>
          <div className="flex flex-col gap-2.5">
            {past.map(exam => (
              <ExamCard key={exam.id} exam={exam} todayStr={todayStr} isDark={isDark} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatCountdown(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days > 0) return `In ${days} days`
  return `${Math.abs(days)} days ago`
}

function ExamCard({ exam, todayStr, isDark, isPast }: { exam: ExamEvent; todayStr: string; isDark: boolean; isPast?: boolean }) {
  const course = COURSES[exam.courseCode]
  const badgeBg = isDark ? course.color + '25' : course.lightColor
  const badgeText = isDark ? course.color : course.textColor
  const days = daysUntil(exam.date, todayStr)
  const soon = !isPast && days <= 7

  return (
    <div
      className={`theme-card relative overflow-hidden rounded-2xl ${isPast ? 'opacity-50' : ''}`}
      style={{
        background: 'var(--s-card)',
        border: '1px solid var(--s-card-border)',
        boxShadow: 'var(--s-shadow)',
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: course.color }} />
      <div className="pl-4 pr-4 py-3.5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: badgeBg, color: badgeText }}>
              {exam.kind === 'final' ? 'Final' : 'Partial'}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--s-muted)' }}>{exam.label}</span>
          </div>
          <p className="font-semibold leading-tight mt-1 text-sm" style={{ color: 'var(--s-text)' }}>
            {course.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--s-text2)' }}>
            {formatDateLong(exam.date)}
          </p>
        </div>
        {soon && (
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold" style={{ color: 'var(--s-accent)' }}>{days === 0 ? 'Today' : days}</p>
            {days > 0 && <p className="text-[10px]" style={{ color: 'var(--s-muted)' }}>days</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <GraduationCap size={32} className="mx-auto mb-3" style={{ color: 'var(--s-muted)' }} />
      <p className="font-medium" style={{ color: 'var(--s-text2)' }}>No exams left</p>
      <p className="text-sm" style={{ color: 'var(--s-muted)' }}>You're all caught up!</p>
    </div>
  )
}
