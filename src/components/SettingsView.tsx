import { useState, useEffect } from 'react'
import { Download, Bell, BellOff, MonitorSmartphone, Check } from 'lucide-react'
import { THEMES, Theme } from '../data/themes'
import { ACADEMIC_EVENTS, AcademicEvent } from '../data/academicCalendar'
import { useTheme } from '../context/ThemeContext'
import { downloadICS } from '../utils/ical'
import {
  notificationsSupported,
  getPermission,
  requestPermission,
  isNotificationsEnabled,
  setNotificationsEnabled,
  scheduleNotificationsForToday,
} from '../utils/notifications'
import { dateToString } from '../utils/time'

export function SettingsView() {
  const { themeId, setThemeId, followSystem, setFollowSystem, isDark } = useTheme()
  const [notifEnabled, setNotifEnabled] = useState(isNotificationsEnabled)
  const [notifPermission, setNotifPermission] = useState(getPermission)
  const [exportDone, setExportDone] = useState(false)

  const todayStr = dateToString(new Date())
  const upcomingEvents = ACADEMIC_EVENTS.filter(ev => (ev.date || ev.startDate || '') >= todayStr).slice(0, 6)

  const handleToggleNotifications = async () => {
    if (!notificationsSupported()) return

    if (!notifEnabled) {
      const perm = await requestPermission()
      setNotifPermission(perm)
      if (perm === 'granted') {
        setNotificationsEnabled(true)
        setNotifEnabled(true)
        scheduleNotificationsForToday()
      }
    } else {
      setNotificationsEnabled(false)
      setNotifEnabled(false)
    }
  }

  const handleExport = () => {
    downloadICS()
    setExportDone(true)
    setTimeout(() => setExportDone(false), 3000)
  }

  useEffect(() => {
    setNotifPermission(getPermission())
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Theme Picker */}
      <section>
        <SectionHeader>Theme</SectionHeader>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(theme => (
            <ThemeTile
              key={theme.id}
              theme={theme}
              isSelected={!followSystem && themeId === theme.id}
              onSelect={() => {
                setFollowSystem(false)
                setThemeId(theme.id)
              }}
              isDark={isDark}
            />
          ))}
        </div>
      </section>

      {/* System Sync */}
      <section
        className="theme-card rounded-2xl p-4"
        style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MonitorSmartphone size={18} style={{ color: 'var(--s-accent)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--s-text)' }}>Match system theme</p>
              <p className="text-xs" style={{ color: 'var(--s-muted)' }}>Auto-switches dark/light with device</p>
            </div>
          </div>
          <button
            onClick={() => setFollowSystem(!followSystem)}
            className="relative w-12 h-6 rounded-full transition-colors duration-200"
            style={{ background: followSystem ? 'var(--s-accent)' : 'var(--s-input)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
              style={{ left: followSystem ? '1.625rem' : '0.125rem' }}
            />
          </button>
        </div>
      </section>

      {/* Export to Calendar */}
      <section
        className="theme-card rounded-2xl p-4"
        style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
      >
        <SectionLabel>Export</SectionLabel>
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            background: exportDone ? '#DCFCE7' : `linear-gradient(135deg, var(--s-hero-from), var(--s-hero-to))`,
            color: exportDone ? '#166534' : '#ffffff',
          }}
        >
          {exportDone ? <Check size={16} /> : <Download size={16} />}
          {exportDone ? 'Exported! Open in Calendar' : 'Export entire semester to .ics'}
        </button>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--s-muted)' }}>
          Compatible with Google Calendar, Apple Calendar, Outlook
        </p>
      </section>

      {/* Notifications */}
      <section
        className="theme-card rounded-2xl p-4"
        style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
      >
        <SectionLabel>Notifications</SectionLabel>
        {!notificationsSupported() ? (
          <p className="text-xs" style={{ color: 'var(--s-muted)' }}>
            Push notifications aren't supported in this browser.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notifEnabled ? (
                  <Bell size={18} style={{ color: 'var(--s-accent)' }} />
                ) : (
                  <BellOff size={18} style={{ color: 'var(--s-muted)' }} />
                )}
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--s-text)' }}>15-min reminders</p>
                  <p className="text-xs" style={{ color: 'var(--s-muted)' }}>
                    {notifPermission === 'denied'
                      ? 'Blocked — enable in browser settings'
                      : 'Alert before each class today'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleNotifications}
                disabled={notifPermission === 'denied'}
                className="relative w-12 h-6 rounded-full transition-colors duration-200 disabled:opacity-40"
                style={{ background: notifEnabled ? 'var(--s-accent)' : 'var(--s-input)' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                  style={{ left: notifEnabled ? '1.625rem' : '0.125rem' }}
                />
              </button>
            </div>
            {notifPermission === 'denied' && (
              <p className="text-xs mt-2 px-1" style={{ color: '#DC2626' }}>
                Notifications blocked. Go to browser settings → Site settings → Notifications to allow.
              </p>
            )}
          </>
        )}
      </section>

      {/* Academic Calendar */}
      <section
        className="theme-card rounded-2xl p-4"
        style={{ background: 'var(--s-card)', border: '1px solid var(--s-card-border)', boxShadow: 'var(--s-shadow)' }}
      >
        <SectionLabel>Academic Calendar</SectionLabel>
        <div className="flex flex-col gap-2">
          {upcomingEvents.map(ev => (
            <AcademicEventRow key={ev.id} event={ev} />
          ))}
        </div>
      </section>

      {/* App info */}
      <div className="text-center pb-2">
        <p className="text-xs" style={{ color: 'var(--s-muted)' }}>
          Valencia UPV Schedule · 2026/27 Q1
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--s-muted)' }}>
          erikwas4-cloud.github.io/valencia-schedule
        </p>
      </div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--s-muted)' }}>
      {children}
    </h2>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--s-muted)' }}>
      {children}
    </p>
  )
}

function ThemeTile({ theme, isSelected, onSelect, isDark }: { theme: Theme; isSelected: boolean; onSelect: () => void; isDark: boolean }) {
  const isGlass = theme.id === 'glass'

  return (
    <button
      onClick={onSelect}
      className="relative rounded-2xl overflow-hidden transition-all duration-150 active:scale-95 text-left"
      style={{
        outline: isSelected ? `2px solid ${isGlass ? '#ffffff' : theme.preview.accent}` : '2px solid transparent',
        outlineOffset: isSelected ? '2px' : '2px',
      }}
    >
      {/* Preview area */}
      <div
        style={{
          background: isGlass
            ? 'linear-gradient(135deg, #f97316 0%, #a855f7 55%, #3b82f6 100%)'
            : theme.preview.bg,
          padding: '10px 10px 0',
          minHeight: 72,
        }}
      >
        {/* Mini card mockup */}
        <div
          style={{
            background: isGlass ? 'rgba(255,255,255,0.18)' : theme.preview.card,
            border: `1px solid ${isGlass ? 'rgba(255,255,255,0.25)' : theme.preview.border}`,
            borderRadius: 8,
            padding: '8px 10px',
            backdropFilter: isGlass ? 'blur(8px)' : undefined,
          }}
        >
          {/* Fake color bar + title */}
          <div className="flex items-center gap-2">
            <div style={{ width: 3, height: 28, borderRadius: 2, background: isGlass ? 'rgba(255,255,255,0.8)' : theme.preview.accent }} />
            <div>
              <div style={{ height: 7, width: 50, borderRadius: 3, background: isGlass ? 'rgba(255,255,255,0.9)' : theme.preview.text, opacity: 0.85 }} />
              <div style={{ height: 5, width: 34, borderRadius: 2, marginTop: 4, background: isGlass ? 'rgba(255,255,255,0.5)' : theme.preview.text, opacity: 0.35 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          background: isGlass ? 'rgba(30,30,80,0.7)' : isDark ? 'var(--s-card)' : theme.preview.bg,
          padding: '8px 10px 10px',
          borderTop: `1px solid ${isGlass ? 'rgba(255,255,255,0.15)' : theme.preview.border}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs font-bold leading-tight"
              style={{ color: isGlass ? '#ffffff' : theme.preview.text }}
            >
              {theme.emoji} {theme.name}
            </p>
            <p
              className="text-[10px] mt-0.5 leading-tight"
              style={{ color: isGlass ? 'rgba(255,255,255,0.65)' : theme.preview.text, opacity: isGlass ? 1 : 0.5 }}
            >
              {theme.description}
            </p>
          </div>
          {isSelected && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: isGlass ? '#ffffff' : theme.preview.accent }}
            >
              <Check size={10} style={{ color: isGlass ? '#6d28d9' : '#ffffff' }} strokeWidth={3} />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function AcademicEventRow({ event }: { event: AcademicEvent }) {
  const typeColors: Record<string, { bg: string; text: string }> = {
    'holiday': { bg: '#FEF3C7', text: '#92400E' },
    'break': { bg: '#DBEAFE', text: '#1E40AF' },
    'exam-period': { bg: '#FEE2E2', text: '#991B1B' },
    'special': { bg: '#EDE9FE', text: '#5B21B6' },
    'info': { bg: '#ECFDF5', text: '#065F46' },
  }
  const colors = typeColors[event.type] || typeColors['info']

  const dateLabel = event.date
    ? new Date(event.date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : event.startDate && event.endDate
    ? `${new Date(event.startDate + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(event.endDate + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : ''

  return (
    <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--s-separator)' }}>
      <span className="text-lg flex-shrink-0 leading-none mt-0.5">{event.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: 'var(--s-text)' }}>{event.title}</p>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: colors.bg, color: colors.text }}
          >
            {event.type}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--s-muted)' }}>{dateLabel}</p>
        {event.description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--s-text2)' }}>{event.description}</p>
        )}
      </div>
    </div>
  )
}
