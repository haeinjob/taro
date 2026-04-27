'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CategorySelect from '@/components/tarot/CategorySelect'
import CardDeck from '@/components/tarot/CardDeck'
import CardFan from '@/components/tarot/CardFan'
import CardResult from '@/components/tarot/CardResult'
import { Category, DrawnCard, drawFanCards } from '@/lib/tarot-utils'
import { PAGE_ENTER } from '@/lib/animation'

type Stage = 'category' | 'shuffle' | 'fan' | 'result'

export default function TarotGame() {
  const [stage, setStage] = useState<Stage>('category')
  const [category, setCategory] = useState<Category>('today')
  const [fanCards, setFanCards] = useState<DrawnCard[]>([])
  const [picked, setPicked] = useState<DrawnCard | null>(null)
  const [fortune, setFortune] = useState('')
  const [isFallback, setIsFallback] = useState(false)

  function handleCategorySelect(cat: Category) {
    setCategory(cat)
    setFanCards(drawFanCards(78))
    setStage('shuffle')
  }

  function handleShuffleDone() {
    setStage('fan')
  }

  async function handleCardPick(drawn: DrawnCard) {
    setPicked(drawn)
    setFortune('')
    setStage('result')
    try {
      const res = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: drawn.card.id, isReversed: drawn.isReversed, category }),
      })
      const data = await res.json()
      setFortune(data.fortune ?? '')
      setIsFallback(data.isFallback ?? false)
    } catch {
      setFortune('운세를 불러오지 못했어요. 잠시 후 다시 시도해 보세요.')
      setIsFallback(true)
    }
  }

  function handleReset() {
    setStage('category')
    setPicked(null)
    setFortune('')
  }

  return (
    <main
      className={`relative min-h-screen flex flex-col items-center justify-center ${stage === 'fan' ? '' : 'overflow-hidden'}`}
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="stars-bg" />
      <AnimatePresence mode="wait">
        {stage === 'category' && (
          <motion.div key="category" {...PAGE_ENTER} className="relative z-10 w-full flex justify-center">
            <CategorySelect onSelect={handleCategorySelect} />
          </motion.div>
        )}
        {stage === 'shuffle' && (
          <motion.div key="shuffle" {...PAGE_ENTER} className="relative z-10 w-full flex justify-center">
            <CardDeck onDone={handleShuffleDone} />
          </motion.div>
        )}
        {stage === 'fan' && (
          <motion.div key="fan" {...PAGE_ENTER} className="relative z-10 w-full flex justify-center">
            <CardFan cards={fanCards} onPick={handleCardPick} />
          </motion.div>
        )}
        {stage === 'result' && picked && (
          <motion.div key="result" {...PAGE_ENTER} className="relative z-10 w-full flex justify-center">
            <CardResult
              drawn={picked}
              category={category}
              fortune={fortune}
              isFallback={isFallback}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
