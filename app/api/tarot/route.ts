import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { TAROT_CARDS } from '@/data/tarot-cards'
import { CATEGORY_META, Category } from '@/lib/tarot-utils'

const SYSTEM_PROMPT = `당신은 친절하고 전문적인 타로 리딩 전문가입니다.

[말투]
- 해요체 기반 부드러운 구어체 ("~해요", "~거예요", "~세요")
- 따뜻하지만 현실적. 근거 없는 낙관 금지.

[출력 구조 — 반드시 이 순서]
1. 헤드라인: 대괄호로 감싼 오늘의 운세 제목. 예: [환하게 빛나는 확신의 하루]
2. 카드 해석: 카드 이미지·상징 활용한 상황 묘사 + 핵심 메시지 (2~3문장)
3. 행동 조언: 오늘 구체적으로 취할 행동 또는 태도 1가지 (1~2문장)

[길이] 헤드라인 제외 본문 150~200자 (공백 포함).

[금지] "망한다", "걱정하지 마", "잘 될 거야", "파이팅", "화이팅",
"우주가", "끌어당김", "행운이 함께", "긍정적으로 생각하면"

[출력] 헤드라인 + 본문만. 카드 이름·레이블 없이.`

const FEW_SHOT = [
  {
    role: 'user' as const,
    content: `날짜: 오늘\n카드: 태양 (The Sun) — 정방향\n의미: 순수한 기쁨과 성공, 자신감과 활력\n키워드: 성공, 기쁨, 활력\n운세 종류: 오늘 하루 전반적인 운세와 흐름을 읽어주세요.`
  },
  {
    role: 'assistant' as const,
    content: `[환하게 빛나는 확신의 하루]\n구름 한 점 없는 태양 아래 서 있는 것처럼 당신의 앞길이 명확해지는 날입니다. 그동안 고민하던 문제가 있다면 오늘 드디어 해답을 찾게 될 거예요. 카드 속 어린아이처럼 순수한 마음으로 사람들을 대하세요. 오늘은 스스로를 의심하지 말고, 가장 하고 싶었던 일을 제1순위로 추진해 보세요.`
  },
  {
    role: 'user' as const,
    content: `날짜: 오늘\n카드: 탑 (The Tower) — 역방향\n의미: 붕괴가 지연되거나 회피됨, 두려움\n키워드: 변화 저항, 두려움, 내실 점검\n운세 종류: 오늘 하루 전반적인 운세와 흐름을 읽어주세요.`
  },
  {
    role: 'assistant' as const,
    content: `[폭풍이 지나간 자리의 평온]\n갑작스러운 변화나 계획의 수정이 생길 수 있지만, 너무 당황하지 마세요. 역방향의 탑은 위태로웠던 상황이 완전히 무너지기 직전에 멈추거나, 오히려 불필요한 것들이 정리되는 과정임을 뜻합니다. 억지로 상황을 되돌리려 애쓰기보다는 오늘은 기존 환경을 점검하고 내실을 다지는 데 집중하는 것이 훨씬 이롭습니다.`
  },
  {
    role: 'user' as const,
    content: `날짜: 오늘\n카드: 펜타클 3 (Three of Pentacles) — 정방향\n의미: 팀워크와 협업, 전문성 인정\n키워드: 협동, 성취, 전문성\n운세 종류: 오늘 하루 전반적인 운세와 흐름을 읽어주세요.`
  },
  {
    role: 'assistant' as const,
    content: `[협동과 성취의 즐거움]\n혼자 끙끙 앓던 일에 든든한 조력자가 나타나거나, 팀 프로젝트에서 당신의 능력을 인정받게 되는 날입니다. 전문적인 지식을 나누거나 타인의 조언을 경청할 때 성과가 극대화됩니다. 오후 시간대에는 동료나 지인과의 소통을 주저하지 마세요. 성실함이 곧 수익으로 연결되는 운의 흐름입니다.`
  },
]

const FALLBACK_FORTUNES: Record<string, string[]> = {
  today: [
    '[오늘을 온전히 느끼는 하루]\n오늘은 특별히 무언가를 이루려 하기보다, 지금 이 순간에 집중해 보세요. 작은 것들이 모여 큰 흐름을 만들어요. 오늘 하루 한 가지만 제대로 해내도 충분해요.',
    '[조용한 확신의 날]\n서두르지 않아도 괜찮아요. 오늘은 천천히, 하지만 확실하게 나아가는 날이에요. 자신을 믿고 한 발씩 내딛어 보세요.',
  ],
  love: [
    '[마음이 열리는 순간]\n오늘 주변을 조금 더 따뜻한 눈으로 바라봐 보세요. 연애운은 결국 내 마음의 상태에서 시작돼요. 먼저 자신을 사랑하는 하루를 만들어 보세요.',
    '[감정에 솔직해지는 날]\n오늘은 하고 싶었던 말을 조금 더 솔직하게 표현해 보세요. 진심은 언제나 통한답니다.',
  ],
  career: [
    '[집중력이 빛나는 날]\n오늘 시작한 일은 끝까지 마무리할 에너지가 있어요. 하나에 집중하면 생각보다 빠르게 성과가 나올 거예요.',
    '[새로운 시각이 열리는 날]\n익숙한 방식 말고 다른 접근을 시도해 보세요. 오늘은 관점을 바꾸는 것만으로도 돌파구가 생길 수 있어요.',
  ],
  money: [
    '[신중함이 답인 날]\n오늘은 큰 결정보다 작은 것들을 점검하는 날이에요. 지출을 한 번 더 확인하고, 불필요한 것은 과감히 줄여보세요.',
    '[기회를 알아보는 눈]\n오늘 주변의 작은 정보들에 귀 기울여 보세요. 재물운은 조용히 신호를 보내고 있을지도 몰라요.',
  ],
}

export async function POST(req: NextRequest) {
  try {
    const { cardId, isReversed, category = 'today' } = await req.json()

    const card = TAROT_CARDS.find(c => c.id === cardId)
    if (!card) return NextResponse.json({ error: 'INVALID_CARD' }, { status: 400 })

    const catMeta = CATEGORY_META[category as Category]
    const direction = isReversed ? '역방향' : '정방향'
    const meaning   = isReversed ? card.reversedMeaning : card.uprightMeaning
    const keywords  = isReversed ? card.reversedKeywords : card.uprightKeywords

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    })

    const userMessage = `날짜: ${today}\n카드: ${card.nameKo} (${card.nameEn}) — ${direction}\n의미: ${meaning}\n키워드: ${keywords.join(', ')}\n운세 종류: ${catMeta.prompt}`

    if (!process.env.ANTHROPIC_API_KEY) {
      const pool = FALLBACK_FORTUNES[category] ?? FALLBACK_FORTUNES.today
      const fortune = pool[Math.floor(Math.random() * pool.length)]
      return NextResponse.json({
        fortune,
        card: { id: card.id, nameKo: card.nameKo, nameEn: card.nameEn, isReversed, keywords },
        isFallback: true,
      })
    }

    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [...FEW_SHOT, { role: 'user', content: userMessage }],
    })

    const fortune = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({
      fortune,
      card: { id: card.id, nameKo: card.nameKo, nameEn: card.nameEn, isReversed, keywords },
      isFallback: false,
    })
  } catch (err) {
    console.error('[tarot/route]', err)
    return NextResponse.json({ error: 'LLM_ERROR' }, { status: 500 })
  }
}
