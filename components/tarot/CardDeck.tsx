'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPRING, BTN } from '@/lib/animation'

interface Props {
  onDone: () => void
}

const DECK_COUNT = 12

function makeOffsets(count: number) {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 340,
    y: (Math.random() - 0.5) * 220,
    rotate: (Math.random() - 0.5) * 90,
    scale: 0.7 + Math.random() * 0.6,
  }))
}

export default function CardDeck({ onDone }: Props) {
  const [phase, setPhase] = useState<'idle' | 'scatter' | 'gather' | 'done'>('idle')
  const offsets = useRef(makeOffsets(DECK_COUNT))

  useEffect(() => {
    if (phase !== 'scatter') return
    const t1 = setTimeout(() => setPhase('gather'), 700)
    return () => clearTimeout(t1)
  }, [phase])

  useEffect(() => {
    if (phase !== 'gather') return
    const t2 = setTimeout(() => {
      setPhase('done')
      onDone()
    }, 800)
    return () => clearTimeout(t2)
  }, [phase, onDone])

  const shuffling = phase === 'scatter' || phase === 'gather'

  return (
    <div className="flex flex-col items-center gap-12">
      <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
        카드를 섞어 오늘의 운명을 불러와요
      </p>

      <div className="relative" style={{ width: 120, height: 180 }}>
        {offsets.current.map((off, i) => (
          <motion.div
            key={i}
            className="card-back absolute inset-0 rounded-xl"
            style={{ zIndex: i }}
            animate={
              phase === 'scatter'
                ? { x: off.x, y: off.y, rotate: off.rotate, scale: off.scale }
                : phase === 'gather'
                ? { x: off.x * 0.15, y: off.y * 0.15, rotate: off.rotate * 0.2, scale: 1 }
                : { x: -i * 0.8, y: -i * 1.2, rotate: 0, scale: 1 }
            }
            transition={
              phase === 'scatter'
                ? { type: 'spring', stiffness: 400, damping: 10, delay: i * 0.025 }
                : phase === 'gather'
                ? { type: 'spring', stiffness: 300, damping: 20, delay: i * 0.02 }
                : SPRING.settle
            }
          />
        ))}

        {/* 셔플 중 글로우 */}
        {shuffling && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.6, repeat: 2 }}
            style={{ boxShadow: '0 0 60px #7c3aed, 0 0 120px #f59e0b44', zIndex: 50 }}
          />
        )}
      </div>

      <AnimatePresence>
        {phase === 'idle' && (
          <motion.button
            onClick={() => setPhase('scatter')}
            {...BTN}
            exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
            className="px-8 py-3 rounded-full text-white font-medium text-sm"
            style={{ background: 'linear-gradient(135deg, var(--color-purple), #9333ea)' }}
          >
            카드 섞기 ✦
          </motion.button>
        )}
        {shuffling && (
          <motion.p
            key="shuffling"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="text-sm"
            style={{ color: 'var(--color-gold)' }}
          >
            ✦ 섞는 중... ✦
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
