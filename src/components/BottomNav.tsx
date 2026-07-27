import { Sun, CalendarDays, GraduationCap, Settings } from 'lucide-react'

export type Tab = 'today' | 'week' | 'courses' | 'settings'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: typeof Sun }[] = [
  { id: 'today', label: 'Today', Icon: Sun },
  { id: 'week', label: 'Week', Icon: CalendarDays },
  { id: 'courses', label: 'Courses', Icon: GraduationCap },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="theme-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        background: 'var(--s-nav)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--s-nav-border)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
        paddingTop: '10px',
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center gap-1 px-5 py-1 rounded-2xl transition-all duration-150 active:scale-90"
            style={{ minWidth: 60 }}
          >
            <Icon
              size={21}
              strokeWidth={isActive ? 2.5 : 1.8}
              style={{ color: isActive ? 'var(--s-accent)' : 'var(--s-muted)', transition: 'color 0.15s' }}
            />
            <span
              className="text-[10px] font-semibold transition-colors"
              style={{ color: isActive ? 'var(--s-accent)' : 'var(--s-muted)' }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
