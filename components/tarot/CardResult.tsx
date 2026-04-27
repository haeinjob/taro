'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { DrawnCard, Category, CATEGORY_META, TarotResult, getCardImage } from '@/lib/tarot-utils'
import { SPRING, BTN, POP } from '@/lib/animation'

interface Props {
  drawn: DrawnCard
  category: Category
  result: TarotResult | null
  onReset: () => void
}

const PARTICLE_COUNT = 16

function Particles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: 16 }}>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360
        const dist = 55 + Math.random() * 45
        const x = Math.cos((angle * Math.PI) / 180) * dist
        const y = Math.sin((angle * Math.PI) / 180) * dist
        const size = 2 + Math.random() * 3
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              background: color,
              top: '50%', left: '50%',
              marginTop: -size / 2, marginLeft: -size / 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0 }}
            transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut', delay: Math.random() * 0.12 }}
          />
        )
      })}
    </div>
  )
}

export default function CardResult({ drawn, category, result, onReset }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [copied, setCopied] = useState(false)
  const meta = CATEGORY_META[category]
  const { card, isReversed } = drawn
  const accentColor = result?.color?.hex ?? '#7c3aed'
  const loaded = result !== null

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true), 450)
    const t2 = setTimeout(() => setShowParticles(true), 750)
    const t3 = setTimeout(() => setShowParticles(false), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  async function copyMantra() {
    if (!result?.mantra) return
    await navigator.clipboard.writeText(result.mantra)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-4 px-5 w-full pb-10" style={{ maxWidth: 380 }}>

      {/* 배경 색깔 번짐 */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 20%, ${accentColor}, transparent 65%)`, zIndex: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: flipped ? 0.08 : 0 }}
        transition={{ duration: 1.4 }}
      />

      {/* 카테고리 배지 */}
      <motion.div {...POP} className="text-xs rounded-full px-3 py-1 border relative z-10"
        style={{ color: 'var(--color-text-dim)', borderColor: 'color-mix(in srgb, var(--color-gold) 30%, transparent)' }}>
        {meta.emoji} {meta.label}
      </motion.div>

      {/* 카드 플립 */}
      <div className="relative z-10" style={{ width: 144, height: 224, perspective: 1000 }}>
        <motion.div
          className="card-back absolute inset-0 rounded-2xl"
          animate={{ rotateY: flipped ? 90 : 0, opacity: flipped ? 0 : 1 }}
          transition={{ duration: 0.3, ease: 'easeIn' }}
          style={{ backfaceVisibility: 'hidden' }}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden border"
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: flipped ? 0 : -90, opacity: flipped ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: flipped ? 0.3 : 0 }}
          style={{ backfaceVisibility: 'hidden', borderColor: accentColor }}
        >
          {/* glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={flipped ? { opacity: [0, 0.7, 0.15] } : { opacity: 0 }}
            transition={{ duration: 1.4 }}
            style={{ boxShadow: `0 0 40px ${accentColor}99, 0 0 80px ${accentColor}44`, zIndex: 2 }}
          />
          <div style={{ transform: isReversed ? 'rotate(180deg)' : 'none', width: '100%', height: '100%' }}>
            <Image src={getCardImage(card)} alt={card.nameKo} fill style={{ objectFit: 'cover' }} sizes="144px" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center px-2 py-1"
            style={{ background: 'linear-gradient(transparent, #000000cc)', zIndex: 3 }}>
            <span className="text-[10px] font-medium" style={{ color: accentColor }}>{card.nameKo}</span>
            <span className="text-[9px]" style={{ color: 'var(--color-text-dim)' }}>{isReversed ? '역' : '정'}</span>
          </div>
          <AnimatePresence>{showParticles && <Particles color={accentColor} />}</AnimatePresence>
        </motion.div>
      </div>

      {/* 4섹션 */}
      <div className="w-full flex flex-col gap-3 relative z-10">

        {/* 로딩 중 */}
        {!loaded && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.1, repeat: Infinity }}
            className="text-sm text-center py-4"
            style={{ color: 'var(--color-text-dim)' }}
          >
            ✦ 카드를 읽는 중... ✦
          </motion.div>
        )}

        {/* 섹션 1 — 카드 해석 */}
        {loaded && (
          <ResultSection delay={0.9} accentColor={accentColor} icon="🃏" label="카드 해석">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
              {result!.cardInterpretation}
            </p>
          </ResultSection>
        )}

        {/* 섹션 2 — 나에게 하는 말 */}
        {loaded && (
          <ResultSection delay={1.15} accentColor={accentColor} icon="💬" label="지금 너에게 하는 말">
            <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--color-text-dim)', lineHeight: 1.8 }}>
              {result!.personalMessage}
            </p>
          </ResultSection>
        )}

        {/* 섹션 3 — 오늘의 신호 */}
        {loaded && (
          <ResultSection delay={1.4} accentColor={accentColor} icon="✨" label="오늘의 신호">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold px-3 py-1 rounded-full"
                style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}55` }}>
                {result!.keyword}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="rounded-full border border-white/20"
                  style={{ width: 16, height: 16, background: result!.color.hex }} />
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{result!.color.name}</span>
              </div>
            </div>
          </ResultSection>
        )}

        {/* 섹션 4 — 만트라 */}
        {loaded && (
          <ResultSection delay={1.65} accentColor={accentColor} icon="🌟" label="오늘의 행운 만트라">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium italic leading-relaxed flex-1"
                style={{ color: accentColor }}>
                "{result!.mantra}"
              </p>
              <motion.button onClick={copyMantra} {...BTN}
                className="text-xs px-2.5 py-1 rounded-full shrink-0 border"
                style={{
                  color: copied ? accentColor : 'var(--color-text-dim)',
                  borderColor: copied ? accentColor : 'color-mix(in srgb, var(--color-text-dim) 25%, transparent)',
                }}>
                {copied ? '복사됨 ✓' : '복사'}
              </motion.button>
            </div>
          </ResultSection>
        )}
      </div>

      {loaded && (
        <motion.button onClick={onReset} {...BTN}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, ...SPRING.smooth }}
          className="mt-1 px-6 py-2.5 rounded-full text-sm border relative z-10"
          style={{ color: 'var(--color-gold)', borderColor: 'color-mix(in srgb, var(--color-gold) 40%, transparent)' }}>
          다시 뽑기
        </motion.button>
      )}

      {loaded && result!.isFallback && (
        <p className="text-[10px] opacity-40 relative z-10" style={{ color: 'var(--color-text-dim)' }}>
          * API 키 없이 기본 운세를 표시하고 있어요
        </p>
      )}
    </div>
  )
}

function ResultSection({ children, delay, accentColor, icon, label }: {
  children: React.ReactNode
  delay: number
  accentColor: string
  icon: string
  label: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ...SPRING.smooth }}
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: 'color-mix(in srgb, var(--color-purple) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--color-purple) 20%, transparent)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-xs">{icon}</span>
        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: accentColor }}>{label}</span>
      </div>
      {children}
    </motion.div>
  )
}
