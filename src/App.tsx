import { useState } from 'react'
import { BottomNav, Tab } from './components/BottomNav'
import { TodayView } from './components/TodayView'
import { WeekView } from './components/WeekView'
import { CoursesView } from './components/CoursesView'
import { useNow } from './hooks/useNow'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const now = useNow(30000)

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: '#F8FAFC', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
        style={{
          background: 'rgba(248, 250, 252, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(241, 245, 249, 0.8)',
          paddingTop: 'max(env(safe-area-inset-top), 12px)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-bold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}
          >
            V
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-800 leading-none">Valencia</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">UPV Schedule</p>
          </div>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: '#FFF7ED', color: '#EA580C' }}
        >
          2026/27 Q1
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pt-4 max-w-lg mx-auto">
        {tab === 'today' && <TodayView now={now} />}
        {tab === 'week' && <WeekView now={now} />}
        {tab === 'courses' && <CoursesView now={now} />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
