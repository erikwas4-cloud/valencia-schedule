export interface Course {
  code: string
  name: string
  shortName: string
  color: string       // hex background
  lightColor: string  // lighter variant for backgrounds
  textColor: string   // text on lightColor
  darkTextColor: string // text on color
}

export const COURSES: Record<string, Course> = {
  EST: {
    code: '13032',
    name: 'Estadística',
    shortName: 'Estadística',
    color: '#059669',
    lightColor: '#D1FAE5',
    textColor: '#065F46',
    darkTextColor: '#ffffff',
  },
  SAU: {
    code: '11407',
    name: 'Sistemas Automáticos',
    shortName: 'Sist. Automáticos',
    color: '#65A30D',
    lightColor: '#ECFCCB',
    textColor: '#365314',
    darkTextColor: '#ffffff',
  },
  EMP: {
    code: '11406',
    name: 'Empresa y Economía Industrial',
    shortName: 'Empresa',
    color: '#7C3AED',
    lightColor: '#EDE9FE',
    textColor: '#4C1D95',
    darkTextColor: '#ffffff',
  },
  CMA: {
    code: '11411',
    name: 'Ciencia de Materiales',
    shortName: 'Ciencia Mat.',
    color: '#16A34A',
    lightColor: '#DCFCE7',
    textColor: '#14532D',
    darkTextColor: '#ffffff',
  },
  LCA: {
    code: '13755',
    name: 'Life Cycle Assessment',
    shortName: 'LCA',
    color: '#EA580C',
    lightColor: '#FFEDD5',
    textColor: '#7C2D12',
    darkTextColor: '#ffffff',
  },
  PDE: {
    code: '13884',
    name: 'Product Design',
    shortName: 'Product Design',
    color: '#DC2626',
    lightColor: '#FEE2E2',
    textColor: '#7F1D1D',
    darkTextColor: '#ffffff',
  },
}
