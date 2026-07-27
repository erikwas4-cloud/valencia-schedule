export type ThemeId = 'default' | 'dark' | 'glass' | 'minimal' | 'terra'

export interface Theme {
  id: ThemeId
  name: string
  emoji: string
  description: string
  preview: {
    bg: string
    card: string
    text: string
    accent: string
    border: string
  }
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    emoji: '☀️',
    description: 'Clean light with warm orange accents',
    preview: { bg: '#F8FAFC', card: '#ffffff', text: '#0F172A', accent: '#f97316', border: '#F1F5F9' },
  },
  {
    id: 'dark',
    name: 'Dark Midnight',
    emoji: '🌙',
    description: 'Deep navy, vibrant course colors',
    preview: { bg: '#0F172A', card: '#1E293B', text: '#F1F5F9', accent: '#f97316', border: '#334155' },
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    emoji: '💎',
    description: 'Frosted glass over a vivid gradient',
    preview: { bg: 'linear-gradient(135deg,#f97316,#8b5cf6,#3b82f6)', card: 'rgba(255,255,255,0.15)', text: '#ffffff', accent: '#ffffff', border: 'rgba(255,255,255,0.25)' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '◻',
    description: 'Pure white, bold typography, no decoration',
    preview: { bg: '#ffffff', card: '#ffffff', text: '#111111', accent: '#111111', border: '#E5E7EB' },
  },
  {
    id: 'terra',
    name: 'Valencia Terra',
    emoji: '🏺',
    description: 'Terracotta & azulejo — soul of Valencia',
    preview: { bg: '#FDF6EC', card: '#ffffff', text: '#3D1F0F', accent: '#C1440E', border: '#F3E8D5' },
  },
]
