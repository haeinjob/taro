'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DrawnCard, Category, CATEGORY_META } from '@/lib/tarot-utils'
import { SPRING, BTN, POP } from '@/lib/animation'

interface Props {
  drawn: DrawnCard
  category: Category
  fortune: string
  isFallback: boolean
  onReset: () => void
}

export default function CardResult({ drawn, category, fortune, isFallback, onReset }: Props) {
  const [flipped, setFlipped] = useState(false)
  const meta = CATEGORY_META[category]
  const { card, isReversed } = drawn

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 450)
    return () => clearTimeout(t)
  }, [])

  const fortuneLines = fortune ? fortune.split('\n').filter(Boolean) : []

  return (
    <div className="flex flex-col items-center gap-6 px-6 w-full" style={{ maxWidth: 360 }}>
      {/* Category badge */}
      <motion.div
        {...POP}
        className="text-xs rounded-full px-3 py-1 border"
        style={{ color: 'var(--color-text-dim)', borderColor: 'color-mix(in srgb, var(--color-gold) 30%, transparent)' }}
      >
        {meta.emoji} {meta.label}
      </motion.div>

      {/* Card flip */}
      <div className="relative" style={{ width: 144, height: 224, perspective: 1000 }}>
        {/* Back face */}
        <motion.div
          className="card-back absolute inset-0 rounded-2xl"
          animate={{ rotateY: flipped ? 90 : 0, opacity: flipped ? 0 : 1 }}
          transition={{ duration: 0.3, ease: 'easeIn' }}
          style={{ backfaceVisibility: 'hidden' }}
        />
        {/* Front face */}
        <motion.div
          className="card-front absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3"
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: flipped ? 0 : -90, opacity: flipped ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: flipped ? 0.3 : 0 }}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span
            className="text-5xl leading-none"
            style={{ display: 'inline-block', transform: isReversed ? 'rotate(180deg)' : 'none' }}
          >
            {card.emoji}
          </span>
          <span className="text-xs text-center px-2" style={{ color: 'var(--color-gold)' }}>
            {card.nameKo}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
            {isReversed ? '역방향' : '정방향'}
          </span>
        </motion.div>
      </div>

      {/* Fortune text */}
      {fortuneLines.length > 0 ? (
        <motion.div className="text-center w-full" style={{ lineHeight: 1.75 }}>
          {fortuneLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + i * 0.18, ...SPRING.smooth }}
              className={i === 0 ? 'font-semibold text-base mb-3' : 'text-sm'}
              style={{
                color: i === 0 ? 'var(--color-gold)' : 'var(--color-text-dim)',
              }}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
          className="text-sm"
          style={{ color: 'var(--color-text-dim)' }}
        >
          운세를 불러오는 중...
        </motion.div>
      )}

      {/* Reset button */}
      {fortuneLines.length > 0 && (
        <motion.button
          onClick={onReset}
          {...BTN}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, ...SPRING.smooth }}
          className="mt-1 px-6 py-2.5 rounded-full text-sm border"
          style={{
            color: 'var(--color-gold)',
            borderColor: 'color-mix(in srgb, var(--color-gold) 40%, transparent)',
          }}
        >
          다시 뽑기
        </motion.button>
      )}

      {isFallback && fortuneLines.length > 0 && (
        <p className="text-[10px] opacity-40" style={{ color: 'var(--color-text-dim)' }}>
          * API 키 없이 기본 운세를 표시하고 있어요
        </p>
      )}
    </div>
  )
}
