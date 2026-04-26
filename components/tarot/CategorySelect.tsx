'use client'
import { motion } from 'framer-motion'
import { CATEGORY_META, Category } from '@/lib/tarot-utils'
import { BTN, POP } from '@/lib/animation'

const CATEGORIES: Category[] = ['today', 'love', 'career', 'money']

interface Props {
  onSelect: (cat: Category) => void
}

export default function CategorySelect({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 px-6">
      <motion.div {...POP} className="text-center">
        <h1 className="text-4xl font-bold glow-gold mb-2" style={{ color: 'var(--color-gold)' }}>
          ✦ 타로 운세 ✦
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          오늘 어떤 운세가 궁금하세요?
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {CATEGORIES.map((cat, i) => {
          const meta = CATEGORY_META[cat]
          return (
            <motion.button
              key={cat}
              onClick={() => onSelect(cat)}
              {...BTN}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 500, damping: 20 }}
              className="card-front flex flex-col items-center gap-2 p-5 rounded-2xl"
              style={{ color: 'var(--color-text)' }}
            >
              <span className="text-3xl">{meta.emoji}</span>
              <span className="text-sm font-medium">{meta.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
