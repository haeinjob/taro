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

export interface IntakeAnswers {
  q1: string   // 짧은 텍스트
  q2: string   // 버튼 선택
  q3: string   // 버튼 선택
}

export interface TarotResult {
  cardInterpretation: string
  personalMessage: string
  keyword: string
  color: { name: string; hex: string }
  mantra: string
  isFallback: boolean
}

export interface IntakeQuestion {
  text: string
  type: 'text' | 'buttons'
  options?: string[]
}

export const INTAKE_QUESTIONS: Record<Category, [IntakeQuestion, IntakeQuestion, IntakeQuestion]> = {
  today: [
    { text: '지금 가장 마음에 걸리는 게 하나만 말해줘요.', type: 'text' },
    { text: '지금 나의 에너지는?', type: 'buttons', options: ['지쳐있어', '불안해', '뭔가 기대돼', '그냥 평범해'] },
    { text: '오늘 어떤 말을 듣고 싶어요?', type: 'buttons', options: ['응원', '솔직한 조언', '그냥 내 편 들어줘', '방향 잡아줘'] },
  ],
  love: [
    { text: '지금 그 사람 생각하면 드는 감정 하나만.', type: 'text' },
    { text: '이 관계에서 지금 내가 원하는 건?', type: 'buttons', options: ['더 가까워지고 싶어', '명확히 하고 싶어', '그냥 안심하고 싶어', '잊고 싶어'] },
    { text: '상대에게 지금 가장 바라는 건?', type: 'buttons', options: ['관심', '솔직함', '행동', '그냥 곁에 있어줬으면'] },
  ],
  career: [
    { text: '요즘 일하면서 가장 힘든 게 뭐예요?', type: 'text' },
    { text: '지금 내 상황은?', type: 'buttons', options: ['새로운 시작 앞', '막혀있어', '선택 기로', '지쳐서 쉬고 싶어'] },
    { text: '오늘 일에서 원하는 건?', type: 'buttons', options: ['돌파구', '버텨낼 힘', '방향 확신', '작은 성취'] },
  ],
  money: [
    { text: '요즘 돈 얘기 나오면 드는 감정이 뭐예요?', type: 'text' },
    { text: '지금 금전 상황은?', type: 'buttons', options: ['여유있어', '빠듯해', '큰 결정 앞', '불확실해'] },
    { text: '오늘 바라는 건?', type: 'buttons', options: ['안심', '기회 신호', '절약 팁', '그냥 잘 될 거라는 말'] },
  ],
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

export function getCardImage(card: TarotCard): string {
  if (card.arcana === 'major') {
    return `/cards/major-${String(card.id).padStart(2, '0')}.jpg`
  }
  const offsets: Record<string, number> = { wands: 21, cups: 35, swords: 49, pentacles: 63 }
  const suit = card.suit === 'pentacles' ? 'pents' : card.suit!
  const num = String(card.id - offsets[card.suit!]).padStart(2, '0')
  return `/cards/${suit}-${num}.jpg`
}

export const CATEGORY_META: Record<Category, { label: string; emoji: string; prompt: string }> = {
  today:  { label: '오늘의 운세', emoji: '🌟', prompt: '오늘 하루 전반적인 운세와 흐름을 읽어주세요.' },
  love:   { label: '연애운',      emoji: '💕', prompt: '오늘의 연애운과 관계에서의 감정 흐름을 읽어주세요.' },
  career: { label: '직업운',      emoji: '💼', prompt: '오늘의 직업운과 일에서의 흐름을 읽어주세요.' },
  money:  { label: '금전운',      emoji: '💰', prompt: '오늘의 금전운과 재물 흐름을 읽어주세요.' },
}
