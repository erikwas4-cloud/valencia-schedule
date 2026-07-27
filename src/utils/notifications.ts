import { schedule } from '../data/schedule'
import { COURSES } from '../data/courses'
import { dateToString, toMinutes } from './time'

let pendingTimers: number[] = []

export function notificationsSupported(): boolean {
  return 'Notification' in window
}

export function getPermission(): NotificationPermission {
  if (!notificationsSupported()) return 'denied'
  return Notification.permission
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

export function isNotificationsEnabled(): boolean {
  return localStorage.getItem('upv-notifications') === 'on'
}

export function setNotificationsEnabled(on: boolean): void {
  localStorage.setItem('upv-notifications', on ? 'on' : 'off')
  if (on) {
    scheduleNotificationsForToday()
  } else {
    clearPendingNotifications()
  }
}

export function clearPendingNotifications(): void {
  pendingTimers.forEach(id => clearTimeout(id))
  pendingTimers = []
}

export function scheduleNotificationsForToday(minutesBefore = 15): void {
  clearPendingNotifications()
  if (!isNotificationsEnabled() || getPermission() !== 'granted') return

  const now = new Date()
  const todayStr = dateToString(now)
  const nowMin = toMinutes(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)

  const todayEvents = schedule.filter(e => e.date === todayStr)

  for (const event of todayEvents) {
    const startMin = toMinutes(event.startTime)
    const notifyMin = startMin - minutesBefore
    const delayMin = notifyMin - nowMin

    if (delayMin <= 0) continue
    const delayMs = delayMin * 60 * 1000
    if (delayMs > 12 * 60 * 60 * 1000) continue

    const course = COURSES[event.courseCode]
    if (!course) continue

    const timerId = window.setTimeout(() => {
      if (getPermission() === 'granted') {
        const n = new Notification(`Class in ${minutesBefore} min`, {
          body: `${course.name} [${event.type === 'T' ? 'Theory' : 'Practice'}]${event.room ? ' · ' + event.room : ''}`,
          icon: './favicon.svg',
          tag: event.id,
        })
        n.onclick = () => window.focus()
      }
    }, delayMs)

    pendingTimers.push(timerId)
  }
}
