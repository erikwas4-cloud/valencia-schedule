import { Sun, CalendarDays, GraduationCap } from 'lucide-react'

export type Tab = 'today' | 'week' | 'courses'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: typeof Sun }[] = [
  { id: 'today', label: 'Today', Icon: Sun },
  { id: 'week', label: 'Week', Icon: CalendarDays },
  { id: 'courses', label: 'Courses', Icon: GraduationCap },
]

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 pb-safe"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #F1F5F9',
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
            className="flex flex-col items-center gap-1 px-6 py-1 rounded-2xl transition-all duration-150 active:scale-90"
            style={{ minWidth: 72 }}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              style={{ color: isActive ? '#f97316' : '#94A3B8', transition: 'color 0.15s' }}
            />
            <span
              className="text-[11px] font-semibold transition-colors"
              style={{ color: isActive ? '#f97316' : '#94A3B8' }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
