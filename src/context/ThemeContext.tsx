import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeId } from '../data/themes'

interface ThemeCtx {
  themeId: ThemeId
  setThemeId: (id: ThemeId) => void
  isDark: boolean
  isGlass: boolean
  isMinimal: boolean
  followSystem: boolean
  setFollowSystem: (v: boolean) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

function getSystemPreference(): ThemeId {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
}

function loadTheme(): ThemeId {
  const saved = localStorage.getItem('upv-theme') as ThemeId | null
  const valid: ThemeId[] = ['default', 'dark', 'glass', 'minimal', 'terra']
  if (saved && valid.includes(saved)) return saved
  return 'default'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdRaw] = useState<ThemeId>(loadTheme)
  const [followSystem, setFollowSystemRaw] = useState(() => localStorage.getItem('upv-follow-system') === 'true')

  const effectiveTheme: ThemeId = followSystem ? getSystemPreference() : themeId

  const setThemeId = (id: ThemeId) => {
    setThemeIdRaw(id)
    localStorage.setItem('upv-theme', id)
  }

  const setFollowSystem = (v: boolean) => {
    setFollowSystemRaw(v)
    localStorage.setItem('upv-follow-system', String(v))
  }

  // Apply theme attribute to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
  }, [effectiveTheme])

  // Listen for system preference changes
  useEffect(() => {
    if (!followSystem) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute('data-theme', getSystemPreference())
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [followSystem])

  return (
    <Ctx.Provider
      value={{
        themeId,
        setThemeId,
        isDark: effectiveTheme === 'dark' || effectiveTheme === 'glass',
        isGlass: effectiveTheme === 'glass',
        isMinimal: effectiveTheme === 'minimal',
        followSystem,
        setFollowSystem,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
