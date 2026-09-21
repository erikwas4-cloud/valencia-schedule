export type ExamKind = 'partial' | 'final'

export interface ExamEvent {
  id: string
  courseCode: string
  date: string // YYYY-MM-DD
  kind: ExamKind
  label: string // as printed on the official UPV exam schedule (e.g. "No oficial", "Única A")
}

// Extracted from the official UPV "Exam Schedule" calendar (Was, Erik · 2026-2027).
export const EXAMS: ExamEvent[] = [
  { id: 'ex-pde-1', courseCode: 'PDE', date: '2026-10-22', kind: 'partial', label: 'No oficial' },
  { id: 'ex-sau-1', courseCode: 'SAU', date: '2026-10-23', kind: 'partial', label: 'No oficial' },
  { id: 'ex-emp-1', courseCode: 'EMP', date: '2026-10-27', kind: 'partial', label: 'No oficial' },
  { id: 'ex-est-1', courseCode: 'EST', date: '2026-10-28', kind: 'partial', label: 'No oficial' },
  { id: 'ex-lca-1', courseCode: 'LCA', date: '2026-10-29', kind: 'partial', label: 'No oficial' },
  { id: 'ex-cma-1', courseCode: 'CMA', date: '2026-10-30', kind: 'partial', label: 'No oficial' },
  { id: 'ex-lca-2', courseCode: 'LCA', date: '2026-12-18', kind: 'partial', label: 'No oficial' },
  { id: 'ex-cma-2', courseCode: 'CMA', date: '2026-12-22', kind: 'partial', label: 'No oficial' },
  { id: 'ex-sau-2', courseCode: 'SAU', date: '2026-12-22', kind: 'partial', label: 'No oficial' },
  { id: 'ex-est-2', courseCode: 'EST', date: '2027-01-08', kind: 'partial', label: 'No oficial' },
  { id: 'ex-emp-2', courseCode: 'EMP', date: '2027-01-08', kind: 'partial', label: 'No oficial' },
  { id: 'ex-pde-2', courseCode: 'PDE', date: '2027-01-12', kind: 'partial', label: 'No oficial' },
  { id: 'ex-cma-final', courseCode: 'CMA', date: '2027-01-20', kind: 'final', label: 'Única A' },
  { id: 'ex-sau-final', courseCode: 'SAU', date: '2027-01-20', kind: 'final', label: 'Única A' },
  { id: 'ex-pde-final', courseCode: 'PDE', date: '2027-01-20', kind: 'final', label: 'Única A' },
  { id: 'ex-lca-final', courseCode: 'LCA', date: '2027-01-21', kind: 'final', label: 'Única A' },
  { id: 'ex-emp-final', courseCode: 'EMP', date: '2027-01-21', kind: 'final', label: 'Única A' },
  { id: 'ex-est-final', courseCode: 'EST', date: '2027-01-25', kind: 'final', label: 'Única A' },
]

export function getExamsSorted(): ExamEvent[] {
  return [...EXAMS].sort((a, b) => a.date.localeCompare(b.date))
}

export function getNextExam(fromDate: string): ExamEvent | null {
  const upcoming = getExamsSorted().filter(e => e.date >= fromDate)
  return upcoming.length > 0 ? upcoming[0] : null
}

export function getExamsForCourse(courseCode: string): ExamEvent[] {
  return getExamsSorted().filter(e => e.courseCode === courseCode)
}

export function daysUntil(dateStr: string, fromDate: string): number {
  const from = new Date(fromDate + 'T00:00:00')
  const to = new Date(dateStr + 'T00:00:00')
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}
