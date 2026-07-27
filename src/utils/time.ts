export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function dateToString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function currentTimeMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes()
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long' })
}

export function getDayShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short' })
}

export function getWeekDates(monday: string): string[] {
  const start = new Date(monday + 'T12:00:00')
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export function addWeeks(monday: string, weeks: number): string {
  const d = new Date(monday + 'T12:00:00')
  d.setDate(d.getDate() + weeks * 7)
  return d.toISOString().slice(0, 10)
}

export function formatWeekRange(monday: string): string {
  const dates = getWeekDates(monday)
  const start = new Date(dates[0] + 'T12:00:00')
  const end = new Date(dates[4] + 'T12:00:00')
  const sDay = start.getDate()
  const eDay = end.getDate()
  const month = end.toLocaleDateString('en-GB', { month: 'short' })
  const year = end.getFullYear()
  if (start.getMonth() === end.getMonth()) {
    return `${sDay}–${eDay} ${month} ${year}`
  }
  const sMonth = start.toLocaleDateString('en-GB', { month: 'short' })
  return `${sDay} ${sMonth} – ${eDay} ${month} ${year}`
}

export function getGreeting(now: Date): string {
  const h = now.getHours()
  if (h < 6) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function progressPercent(startTime: string, endTime: string, nowMin: number): number {
  const s = toMinutes(startTime)
  const e = toMinutes(endTime)
  if (nowMin <= s) return 0
  if (nowMin >= e) return 100
  return Math.round(((nowMin - s) / (e - s)) * 100)
}
