'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { DrawnCard } from '@/lib/tarot-utils'
import { SPRING } from '@/lib/animation'

interface Props {
  cards: DrawnCard[]
  onPick: (drawn: DrawnCard) => void
}

export default function CardFan({ cards, onPick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING.smooth}
        className="text-center"
      >
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-dim)' }}>
          마음이 끌리는 카드를 하나 선택하세요
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-dim)', opacity: 0.5 }}>
          ← 스크롤해서 전체 카드 보기 →
        </p>
      </motion.div>

      {/* 카드 전체 가로 스크롤 */}
      <div className="relative w-full" style={{ maxWidth: '100vw' }}>
        {/* 좌우 페이드 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #09090f, transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #09090f, transparent)' }}
        />

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto px-8"
          style={{
            scrollbarWidth: 'none',
            paddingTop: 48,
            paddingBottom: 24,
          }}
        >
          {cards.map((drawn, i) => {
            const wobble = [0, -8, 4, -4, 8, -2, 6][i % 7]
            return (
              <motion.button
                key={drawn.card.id}
                onClick={() => onPick(drawn)}
                className="card-back flex-shrink-0 rounded-xl cursor-pointer"
                style={{ width: 52, height: 82 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: wobble }}
                transition={{ ...SPRING.settle, delay: Math.min(i * 0.008, 0.4) }}
                whileHover={{
                  y: wobble - 36,
                  scale: 1.18,
                  zIndex: 20,
                  transition: SPRING.jelly,
                }}
                whileTap={{ scale: 0.92, transition: SPRING.snappy }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
