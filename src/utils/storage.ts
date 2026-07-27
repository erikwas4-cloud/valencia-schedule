export type AttendanceStatus = 'present' | 'absent'

export function getNote(eventId: string): string {
  return localStorage.getItem(`upv-note-${eventId}`) || ''
}

export function setNote(eventId: string, note: string): void {
  if (note.trim()) {
    localStorage.setItem(`upv-note-${eventId}`, note.trim())
  } else {
    localStorage.removeItem(`upv-note-${eventId}`)
  }
}

export function getAttendance(eventId: string): AttendanceStatus | null {
  const v = localStorage.getItem(`upv-attend-${eventId}`)
  if (v === 'present' || v === 'absent') return v
  return null
}

export function setAttendance(eventId: string, status: AttendanceStatus | null): void {
  if (status) {
    localStorage.setItem(`upv-attend-${eventId}`, status)
  } else {
    localStorage.removeItem(`upv-attend-${eventId}`)
  }
}

export function cycleAttendance(eventId: string): AttendanceStatus | null {
  const current = getAttendance(eventId)
  const next: AttendanceStatus | null = current === null ? 'present' : current === 'present' ? 'absent' : null
  setAttendance(eventId, next)
  return next
}

export function getAttendanceStats(eventIds: string[]): { attended: number; missed: number; total: number; pct: number } {
  let attended = 0
  let missed = 0
  for (const id of eventIds) {
    const s = getAttendance(id)
    if (s === 'present') attended++
    else if (s === 'absent') missed++
  }
  const recorded = attended + missed
  return {
    attended,
    missed,
    total: eventIds.length,
    pct: recorded > 0 ? Math.round((attended / recorded) * 100) : 0,
  }
}
