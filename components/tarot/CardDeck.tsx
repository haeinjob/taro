'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPRING, BTN } from '@/lib/animation'

interface Props {
  onDone: () => void
}

const DECK_COUNT = 7

function makeOffsets(count: number) {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 150,
    y: (Math.random() - 0.5) * 80,
    rotate: (Math.random() - 0.5) * 40,
  }))
}

export default function CardDeck({ onDone }: Props) {
  const [shuffling, setShuffling] = useState(false)
  const [done, setDone] = useState(false)
  const offsets = useRef(makeOffsets(DECK_COUNT))

  useEffect(() => {
    if (!shuffling) return
    const t = setTimeout(() => {
      setDone(true)
      onDone()
    }, 1500)
    return () => clearTimeout(t)
  }, [shuffling, onDone])

  return (
    <div className="flex flex-col items-center gap-12">
      <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
        카드를 섞어 오늘의 운명을 불러와요
      </p>

      <div className="relative" style={{ width: 112, height: 176 }}>
        {offsets.current.map((off, i) => (
          <motion.div
            key={i}
            className="card-back absolute inset-0 rounded-xl"
            style={{ zIndex: i }}
            animate={
              shuffling
                ? { x: [0, off.x, 0], y: [0, off.y, 0], rotate: [0, off.rotate, 0] }
                : { x: -i, y: -i * 1.5, rotate: 0 }
            }
            transition={
              shuffling
                ? { duration: 0.65, ease: 'easeInOut', delay: i * 0.04 }
                : SPRING.settle
            }
          />
        ))}
      </div>

      <AnimatePresence>
        {!done && (
          <motion.button
            onClick={() => !shuffling && setShuffling(true)}
            {...BTN}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            disabled={shuffling}
            className="px-8 py-3 rounded-full text-white font-medium text-sm disabled:opacity-50"
            style={{ background: 'var(--color-purple)' }}
          >
            {shuffling ? '섞는 중...' : '카드 섞기 ✦'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
