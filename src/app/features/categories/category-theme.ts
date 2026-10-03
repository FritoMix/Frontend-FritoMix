export interface CategoryTheme {
  bg: string;
  solidBg: string;
  color: string;
  gradient: string;
  shadow: string;
  icon: string;
  textColor: string;
}

const THEMES: { key: string; theme: Omit<CategoryTheme, 'gradient' | 'shadow'> }[] = [
  { key: 'bebida', theme: { bg: 'from-[#006BB4] to-[#004A80]', solidBg: '#006BB4', color: '#006BB4', icon: '🥤', textColor: 'text-white' } },
  { key: 'extruid', theme: { bg: 'from-[#8A2BE2] to-[#5F11A6]', solidBg: '#8A2BE2', color: '#8A2BE2', icon: '🥨', textColor: 'text-white' } },
  { key: 'galleta', theme: { bg: 'from-[#8B4513] to-[#54290B]', solidBg: '#8B4513', color: '#8B4513', icon: '🍪', textColor: 'text-white' } },
  { key: 'panader', theme: { bg: 'from-[#DC2626] to-[#991B1B]', solidBg: '#DC2626', color: '#DC2626', icon: '🥖', textColor: 'text-white' } },
  { key: 'papa', theme: { bg: 'from-[#D97706] to-[#92400E]', solidBg: '#D97706', color: '#D97706', icon: '🍟', textColor: 'text-white' } },
  { key: 'pelet', theme: { bg: 'from-[#EA580C] to-[#9A3412]', solidBg: '#EA580C', color: '#EA580C', icon: '🌾', textColor: 'text-white' } },
  { key: 'platano', theme: { bg: 'from-[#059669] to-[#064E3B]', solidBg: '#059669', color: '#059669', icon: '🍌', textColor: 'text-white' } },
  { key: 'dulc', theme: { bg: 'from-[#EC4899] to-[#9D174D]', solidBg: '#EC4899', color: '#EC4899', icon: '🍬', textColor: 'text-white' } },
  { key: 'mani', theme: { bg: 'from-[#B45309] to-[#78350F]', solidBg: '#B45309', color: '#B45309', icon: '🥜', textColor: 'text-white' } },
  { key: 'frutos sec', theme: { bg: 'from-[#B45309] to-[#78350F]', solidBg: '#B45309', color: '#B45309', icon: '🥜', textColor: 'text-white' } },
  { key: 'snack', theme: { bg: 'from-[#0055FF] to-[#0033AA]', solidBg: '#0055FF', color: '#0055FF', icon: '🍿', textColor: 'text-white' } },
];

const ALTERNATES: Record<string, string> = {
  'pelet': 'pellet',
};

const DEFAULT: Omit<CategoryTheme, 'gradient' | 'shadow'> = {
  bg: 'from-[#2563EB] to-[#1E40AF]',
  solidBg: '#2563EB',
  color: '#2563EB',
  icon: '📦',
  textColor: 'text-white'
};

function normalize(value: string): string {
  return (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function categoryTheme(name: string): CategoryTheme {
  const norm = normalize(name);
  const singular = norm.endsWith('s') ? norm.slice(0, -1) : norm;
  const entry = THEMES.find(t =>
    norm.includes(t.key) ||
    singular.includes(t.key) ||
    (ALTERNATES[t.key] ?? '').split(' ').filter(Boolean).some(p => norm.includes(p))
  );
  const base = entry?.theme ?? DEFAULT;
  return {
    ...base,
    gradient: `linear-gradient(135deg, ${base.color} 0%, ${toHex(base.bg)} 100%)`,
    shadow: hexToRgba(base.color, 0.3)
  };
}

export function categoryColor(name: string): string {
  return categoryTheme(name).color;
}

export function categoryGradient(name: string): string {
  return categoryTheme(name).gradient;
}

export function categoryShadow(name: string): string {
  return categoryTheme(name).shadow;
}

export function categoryIcon(name: string): string {
  return categoryTheme(name).icon;
}

function toHex(bg: string): string {
  const match = /to-\[(#[\dA-F]{6})\]/i.exec(bg);
  return match ? match[1] : '#1E40AF';
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}