import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { TAROT_CARDS } from '@/data/tarot-cards'
import { CATEGORY_META, Category, IntakeAnswers } from '@/lib/tarot-utils'

const SYSTEM_PROMPT = `당신은 사용자가 가장 믿는 친구이자 솔직한 응원자입니다.
타로 카드를 읽지만, 신비롭거나 모호하게 말하지 않습니다.
"너 지금 이런 거 아냐?" 하고 꿰뚫어보는 직접성과, 진심으로 내 편인 따뜻함이 공존합니다.

[페르소나]
- 2인칭 직접 호칭: "너", "네가", "지금 네 상황"
- 말투: 반말에 가까운 편안한 해요체. "~거잖아요", "~해봐요", "알죠?"
- 모호한 위로 금지. 근거 없는 낙관 금지.
- 카드의 상징과 에너지를 실제 상황에 연결해 해석.

[출력 형식 — 반드시 JSON]
{
  "cardInterpretation": "이 카드 자체가 가진 에너지와 상징 (2-3문장, 카드 이름 없이)",
  "personalMessage": "사용자의 상황을 반영한 직접적인 메시지. 인테이크 답변을 구체적으로 언급하거나 반영. 3-4문장.",
  "keyword": "오늘의 핵심 키워드 (1-2단어)",
  "color": { "name": "색이름 (한국어)", "hex": "#RRGGBB" },
  "mantra": "오늘 하루 마음에 품고 다닐 짧은 문장. 직접적이고 힘있게."
}

[색깔 선택 기준]
카드의 에너지와 어울리는 색. 예: 열정/행동→진홍(#dc2626), 직관/영성→보라(#7c3aed),
감정/관계→장미(#f43f5e), 성장/새시작→에메랄드(#059669), 안정/물질→황금(#d97706),
지성/명료→하늘(#0284c7), 균형/조화→라벤더(#8b5cf6)

[절대 금지]
"우주가", "끌어당김", "에너지가 흐른다", "긍정적으로", "파이팅", "화이팅",
"걱정하지 마세요", "잘 될 거예요", "행운이 함께", "모든 것이 잘"

[길이]
cardInterpretation: 70-100자, personalMessage: 100-140자, keyword: 10자 이내, mantra: 25자 이내`

type FallbackResult = {
  cardInterpretation: string
  personalMessage: string
  keyword: string
  color: { name: string; hex: string }
  mantra: string
}

const FALLBACKS: Record<Category, FallbackResult[]> = {
  today: [
    {
      cardInterpretation: '지금 이 카드는 멈춰서 자신을 돌아보길 요청하고 있어요. 바깥이 아니라 안쪽을 봐야 할 때입니다.',
      personalMessage: '오늘은 많이 하려 하지 말아요. 지금 네가 느끼는 게 뭔지, 그것만 제대로 알아도 충분한 하루예요. 서두르면 놓치는 게 생겨요.',
      keyword: '내면 집중',
      color: { name: '라벤더', hex: '#8b5cf6' },
      mantra: '오늘 나는 나 자신에게 충분하다.',
    },
  ],
  love: [
    {
      cardInterpretation: '감정이 복잡하게 얽혀있을 때 나오는 카드예요. 마음이 원하는 것과 두려워하는 것이 충돌하고 있어요.',
      personalMessage: '지금 네 감정이 뭔지, 그 사람한테 뭘 원하는 건지 먼저 네가 알아야 해요. 상대보다 나 자신한테 솔직해지는 게 먼저예요.',
      keyword: '솔직함',
      color: { name: '장미', hex: '#f43f5e' },
      mantra: '내 마음에 솔직한 것이 용기다.',
    },
  ],
  career: [
    {
      cardInterpretation: '막혀있는 것처럼 느껴지지만, 실제로는 다음 단계를 위한 준비가 진행 중인 상태예요.',
      personalMessage: '지금 답답하다고 느끼는 거 맞아요. 근데 이 막힘이 무능함의 신호가 아니라 쌓이고 있다는 신호예요. 오늘 하나만 제대로 마무리해봐요.',
      keyword: '묵묵히 전진',
      color: { name: '황금', hex: '#d97706' },
      mantra: '작은 완료가 큰 흐름을 만든다.',
    },
  ],
  money: [
    {
      cardInterpretation: '지금 당장의 숫자보다 흐름을 봐야 할 때예요. 작은 구멍들을 먼저 막는 게 중요한 시기입니다.',
      personalMessage: '큰 변화보다 오늘 작은 것 하나 점검하는 게 더 효과적이에요. 지금 쓰는 돈 중에 "없어도 됐던 것"이 반드시 있어요.',
      keyword: '신중한 점검',
      color: { name: '에메랄드', hex: '#059669' },
      mantra: '내가 가진 것을 먼저 제대로 본다.',
    },
  ],
}

export async function POST(req: NextRequest) {
  try {
    const { cardId, isReversed, category = 'today', intakeAnswers } = await req.json() as {
      cardId: number
      isReversed: boolean
      category: Category
      intakeAnswers?: IntakeAnswers
    }

    const card = TAROT_CARDS.find(c => c.id === cardId)
    if (!card) return NextResponse.json({ error: 'INVALID_CARD' }, { status: 400 })

    const catMeta = CATEGORY_META[category]
    const direction = isReversed ? '역방향' : '정방향'
    const meaning   = isReversed ? card.reversedMeaning : card.uprightMeaning
    const keywords  = isReversed ? card.reversedKeywords : card.uprightKeywords

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    })

    const intakeSection = intakeAnswers
      ? `\n[사용자가 말한 상황]\n- 고민/상황: "${intakeAnswers.q1}"\n- 현재 에너지/감정: "${intakeAnswers.q2}"\n- 듣고 싶은 것: "${intakeAnswers.q3}"`
      : ''

    const userMessage = `날짜: ${today}
카드: ${card.nameKo} (${card.nameEn}) — ${direction}
카드 의미: ${meaning}
카드 키워드: ${keywords.join(', ')}
운세 종류: ${catMeta.label}${intakeSection}

위 정보를 바탕으로 JSON을 출력하세요.`

    if (!process.env.ANTHROPIC_API_KEY) {
      const pool = FALLBACKS[category] ?? FALLBACKS.today
      const fallback = pool[Math.floor(Math.random() * pool.length)]
      return NextResponse.json({ ...fallback, isFallback: true })
    }

    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''

    // JSON 파싱 — 마크다운 코드블록 제거 후 파싱
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON not found in response')
    const parsed = JSON.parse(jsonMatch[0])

    return NextResponse.json({ ...parsed, isFallback: false })
  } catch (err) {
    console.error('[tarot/route]', err)
    // fallback 반환
    const fallback = FALLBACKS.today[0]
    return NextResponse.json({ ...fallback, isFallback: true })
  }
}
