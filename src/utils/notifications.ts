import { schedule } from '../data/schedule'
import { COURSES } from '../data/courses'
import { dateToString, toMinutes } from './time'

let pendingTimers: number[] = []

// ─── Browser Notifications ────────────────────────────────────────────────────

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
  if (on) scheduleNotificationsForToday()
  else clearPendingNotifications()
}

// ─── NTFY ─────────────────────────────────────────────────────────────────────

export function getNtfyTopic(): string {
  return localStorage.getItem('upv-ntfy-topic') || ''
}

export function setNtfyTopic(topic: string): void {
  localStorage.setItem('upv-ntfy-topic', topic.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))
}

export function isNtfyEnabled(): boolean {
  return localStorage.getItem('upv-ntfy-enabled') === 'on'
}

export function setNtfyEnabled(on: boolean): void {
  localStorage.setItem('upv-ntfy-enabled', on ? 'on' : 'off')
  if (on) scheduleNtfyForToday()
  else clearPendingNotifications()
}

async function sendNtfy(topic: string, title: string, body: string, tags: string[]): Promise<void> {
  await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: 'POST',
    headers: {
      Title: title,
      Priority: 'high',
      Tags: tags.join(','),
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body,
  })
}

// ─── Shared scheduler ─────────────────────────────────────────────────────────

export function clearPendingNotifications(): void {
  pendingTimers.forEach(id => clearTimeout(id))
  pendingTimers = []
}

function buildEventTimers(minutesBefore: number, onFire: (label: string, body: string, tags: string[]) => void): void {
  const now = new Date()
  const todayStr = dateToString(now)
  const nowMin = toMinutes(
    `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  )

  const todayEvents = schedule.filter(e => e.date === todayStr)

  for (const event of todayEvents) {
    const startMin = toMinutes(event.startTime)
    const delayMin = (startMin - minutesBefore) - nowMin
    if (delayMin <= 0) continue
    const delayMs = delayMin * 60 * 1000
    if (delayMs > 12 * 60 * 60 * 1000) continue

    const course = COURSES[event.courseCode]
    if (!course) continue

    const title = `${course.shortName} in ${minutesBefore}min`
    const bodyText = [
      event.type === 'T' ? 'Theory' : 'Practice',
      event.room || '',
      event.startTime,
    ].filter(Boolean).join(' · ')
    const tags = ['bell', 'school']

    const id = window.setTimeout(() => onFire(title, bodyText, tags), delayMs)
    pendingTimers.push(id)
  }
}

export function scheduleNotificationsForToday(minutesBefore = 15): void {
  clearPendingNotifications()
  const useNtfy = isNtfyEnabled() && getNtfyTopic()
  const useBrowser = isNotificationsEnabled() && getPermission() === 'granted'
  if (!useNtfy && !useBrowser) return

  buildEventTimers(minutesBefore, (title, body, tags) => {
    if (useNtfy) {
      sendNtfy(getNtfyTopic(), title, body, tags).catch(() => {})
    }
    if (useBrowser && getPermission() === 'granted') {
      const n = new Notification(title, { body, icon: './favicon.svg' })
      n.onclick = () => window.focus()
    }
  })
}

export function scheduleNtfyForToday(minutesBefore = 15): void {
  clearPendingNotifications()
  if (!isNtfyEnabled() || !getNtfyTopic()) return
  buildEventTimers(minutesBefore, (title, body, tags) => {
    sendNtfy(getNtfyTopic(), title, body, tags).catch(() => {})
  })
}
