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
    <div className="flex flex-col items-center gap-6 w-full">
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

      {/* 좌우 페이드 + 스크롤 컨테이너 */}
      <div className="relative w-full">
        <div
          className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #09090f, transparent)', zIndex: 10 }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #09090f, transparent)', zIndex: 10 }}
        />

        <div
          ref={scrollRef}
          style={{
            overflowX: 'scroll',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingTop: 100,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
            cursor: 'grab',
          }}
        >
          <div style={{ display: 'flex', width: 'max-content', position: 'relative' }}>
            {cards.map((drawn, i) => {
              const yWobble = [0, -6, 3, -3, 5, -2, 4][i % 7]
              return (
                <motion.button
                  key={drawn.card.id}
                  onClick={() => onPick(drawn)}
                  className="card-back rounded-xl cursor-pointer"
                  style={{
                    width: 60,
                    height: 92,
                    flexShrink: 0,
                    marginLeft: i === 0 ? 0 : -32,
                    position: 'relative',
                    zIndex: i,
                  }}
                  initial={{ opacity: 0, y: yWobble + 24 }}
                  animate={{ opacity: 1, y: yWobble }}
                  transition={{ ...SPRING.settle, delay: Math.min(i * 0.006, 0.35) }}
                  whileHover={{
                    y: yWobble - 52,
                    scale: 1.25,
                    zIndex: 300,
                    transition: SPRING.jelly,
                  }}
                  whileTap={{ scale: 0.92, zIndex: 300, transition: SPRING.snappy }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
