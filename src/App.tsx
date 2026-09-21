import { useState, useEffect } from 'react'
import { BottomNav, Tab } from './components/BottomNav'
import { TodayView } from './components/TodayView'
import { WeekView } from './components/WeekView'
import { CoursesView } from './components/CoursesView'
import { ExamsView } from './components/ExamsView'
import { SettingsView } from './components/SettingsView'
import { useNow } from './hooks/useNow'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { scheduleNotificationsForToday, isNotificationsEnabled } from './utils/notifications'

function AppShell() {
  const [tab, setTab] = useState<Tab>('today')
  const now = useNow(30000)
  const { isDark, isGlass } = useTheme()

  // Schedule today's notifications on mount
  useEffect(() => {
    if (isNotificationsEnabled()) {
      scheduleNotificationsForToday()
    }
  }, [])

  // Re-schedule daily (at midnight) — simple approach via interval
  useEffect(() => {
    const midnight = new Date()
    midnight.setDate(midnight.getDate() + 1)
    midnight.setHours(0, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - Date.now()
    const id = setTimeout(() => {
      if (isNotificationsEnabled()) scheduleNotificationsForToday()
    }, msUntilMidnight)
    return () => clearTimeout(id)
  }, [])

  const headerBg = isGlass
    ? 'rgba(255,255,255,0.08)'
    : isDark
    ? 'rgba(15,23,42,0.95)'
    : 'rgba(248,250,252,0.92)'

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: 'var(--s-bg)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        transition: 'background 0.25s ease',
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5"
        style={{
          background: headerBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--s-nav-border)',
          paddingTop: 'max(env(safe-area-inset-top), 12px)',
          paddingBottom: '12px',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-bold text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, var(--s-hero-from), var(--s-hero-to))` }}
          >
            V
          </div>
          <div>
            <p className="text-[13px] font-bold leading-none" style={{ color: 'var(--s-text)' }}>Valencia</p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--s-muted)' }}>UPV Schedule</p>
          </div>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: isGlass ? 'rgba(255,255,255,0.15)' : 'var(--s-input)', color: 'var(--s-accent)' }}
        >
          2026/27 Q1
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pt-4 max-w-lg mx-auto">
        {tab === 'today' && <TodayView now={now} />}
        {tab === 'week' && <WeekView now={now} />}
        {tab === 'courses' && <CoursesView now={now} />}
        {tab === 'exams' && <ExamsView now={now} />}
        {tab === 'settings' && <SettingsView />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
