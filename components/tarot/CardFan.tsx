'use client'
import { motion } from 'framer-motion'
import { DrawnCard } from '@/lib/tarot-utils'
import { SPRING } from '@/lib/animation'

interface Props {
  cards: DrawnCard[]
  onPick: (drawn: DrawnCard) => void
}

const FAN = [
  { x: -80, rotate: -20, zIndex: 1 },
  { x: -40, rotate: -10, zIndex: 2 },
  { x:   0, rotate:   0, zIndex: 5 },
  { x:  40, rotate:  10, zIndex: 2 },
  { x:  80, rotate:  20, zIndex: 1 },
]

export default function CardFan({ cards, onPick }: Props) {
  return (
    <div className="flex flex-col items-center gap-12">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING.smooth}
        className="text-sm"
        style={{ color: 'var(--color-text-dim)' }}
      >
        마음이 끌리는 카드를 하나 선택하세요
      </motion.p>

      {/* Fan container */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 200 }}>
        {cards.map((drawn, i) => {
          const f = FAN[i]
          return (
            <motion.button
              key={drawn.card.id}
              onClick={() => onPick(drawn)}
              className="card-back absolute rounded-xl cursor-pointer"
              style={{ width: 72, height: 112, zIndex: f.zIndex, left: '50%', top: '50%', marginLeft: -36, marginTop: -56 }}
              initial={{ x: f.x, y: 40, rotate: f.rotate, opacity: 0 }}
              animate={{ x: f.x, y: 0, rotate: f.rotate, opacity: 1 }}
              transition={{ ...SPRING.settle, delay: i * 0.07 }}
              whileHover={{
                y: -44,
                scale: 1.12,
                zIndex: 20,
                transition: SPRING.jelly,
              }}
              whileTap={{ scale: 0.95, transition: SPRING.snappy }}
            />
          )
        })}
      </div>
    </div>
  )
}
