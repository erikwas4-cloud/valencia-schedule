import { schedule } from '../data/schedule'
import { COURSES } from '../data/courses'

function toICSDate(date: string, time: string): string {
  const [y, m, d] = date.split('-')
  const [h, min] = time.split(':')
  return `${y}${m}${d}T${h}${min}00`
}

function escapeICS(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

export function generateICS(): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Valencia Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:UPV Valencia Q1 2026/27',
    'X-WR-TIMEZONE:Europe/Madrid',
  ]

  for (const event of schedule) {
    const course = COURSES[event.courseCode]
    if (!course) continue

    const typeLabel = event.type === 'T' ? 'Theory' : 'Practice'
    const summary = escapeICS(`${course.shortName} [${typeLabel}]`)
    const descParts = [course.name, typeLabel]
    if (event.room) descParts.push(event.room)
    if (event.note) descParts.push(event.note)
    const description = escapeICS(descParts.join(' · '))

    lines.push('BEGIN:VEVENT')
    lines.push(`DTSTART;TZID=Europe/Madrid:${toICSDate(event.date, event.startTime)}`)
    lines.push(`DTEND;TZID=Europe/Madrid:${toICSDate(event.date, event.endTime)}`)
    lines.push(`SUMMARY:${summary}`)
    lines.push(`DESCRIPTION:${description}`)
    if (event.room) lines.push(`LOCATION:${escapeICS(event.room)}`)
    lines.push(`UID:${event.id}@upv-valencia-schedule`)
    lines.push(`CATEGORIES:${escapeICS(course.name)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadICS(): void {
  const content = generateICS()
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'valencia-upv-q1-2026.ics'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
