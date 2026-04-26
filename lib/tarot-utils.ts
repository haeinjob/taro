import { TAROT_CARDS, TarotCard } from '@/data/tarot-cards'

export type Category = 'today' | 'love' | 'career' | 'money'

export interface DrawnCard {
  card: TarotCard
  isReversed: boolean
}

export interface SavedDraw {
  date: string
  cardId: number
  isReversed: boolean
  category: Category
  fortune: string
}

export function drawCard(): DrawnCard {
  const idx = Math.floor(Math.random() * TAROT_CARDS.length)
  const isReversed = Math.random() < 0.5
  return { card: TAROT_CARDS[idx], isReversed }
}

export function drawFanCards(count = 5): DrawnCard[] {
  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(card => ({
    card,
    isReversed: Math.random() < 0.5,
  }))
}

export function getTodayKey(category: Category): string {
  const today = new Date().toISOString().slice(0, 10)
  return `tarot_${today}_${category}`
}

export function saveDraw(draw: SavedDraw, category: Category): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getTodayKey(category), JSON.stringify(draw))
}

export function loadDraw(category: Category): SavedDraw | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(getTodayKey(category))
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export const CATEGORY_META: Record<Category, { label: string; emoji: string; prompt: string }> = {
  today:  { label: '오늘의 운세', emoji: '🌟', prompt: '오늘 하루 전반적인 운세와 흐름을 읽어주세요.' },
  love:   { label: '연애운',      emoji: '💕', prompt: '오늘의 연애운과 관계에서의 감정 흐름을 읽어주세요.' },
  career: { label: '직업운',      emoji: '💼', prompt: '오늘의 직업운과 일에서의 흐름을 읽어주세요.' },
  money:  { label: '금전운',      emoji: '💰', prompt: '오늘의 금전운과 재물 흐름을 읽어주세요.' },
}
