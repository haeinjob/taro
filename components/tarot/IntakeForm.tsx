'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category, IntakeAnswers, INTAKE_QUESTIONS, CATEGORY_META } from '@/lib/tarot-utils'
import { SPRING, BTN } from '@/lib/animation'

interface Props {
  category: Category
  onDone: (answers: IntakeAnswers) => void
}

export default function IntakeForm({ category, onDone }: Props) {
  const questions = INTAKE_QUESTIONS[category]
  const meta = CATEGORY_META[category]
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({})
  const [textInput, setTextInput] = useState('')

  function handleText() {
    if (!textInput.trim()) return
    const next = { ...answers, q1: textInput.trim() }
    setAnswers(next)
    setStep(1)
  }

  function handleButton(key: 'q2' | 'q3', value: string) {
    const next = { ...answers, [key]: value }
    setAnswers(next)
    if (key === 'q2') {
      setStep(2)
    } else {
      onDone(next as IntakeAnswers)
    }
  }

  const q = questions[step]

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full" style={{ maxWidth: 380 }}>
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING.smooth}
        className="text-center"
      >
        <div
          className="text-xs rounded-full px-3 py-1 border inline-block mb-3"
          style={{
            color: 'var(--color-text-dim)',
            borderColor: 'color-mix(in srgb, var(--color-gold) 30%, transparent)',
          }}
        >
          {meta.emoji} {meta.label}
        </div>
        {/* 진행 바 */}
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ height: 3, background: i <= step ? 'var(--color-gold)' : 'var(--color-text-dim)', opacity: i <= step ? 1 : 0.25 }}
              animate={{ width: i === step ? 24 : 8 }}
              transition={SPRING.smooth}
            />
          ))}
        </div>
      </motion.div>

      {/* 질문 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={SPRING.smooth}
          className="w-full flex flex-col items-center gap-5"
        >
          <p
            className="text-base font-medium text-center"
            style={{ color: 'var(--color-text-dim)', lineHeight: 1.6 }}
          >
            {q.text}
          </p>

          {q.type === 'text' ? (
            <div className="w-full flex flex-col gap-3">
              <textarea
                autoFocus
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleText() } }}
                placeholder="짧게 적어줘도 괜찮아요"
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                style={{
                  background: 'color-mix(in srgb, var(--color-purple) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-purple) 40%, transparent)',
                  color: 'var(--color-text-dim)',
                }}
              />
              <motion.button
                onClick={handleText}
                disabled={!textInput.trim()}
                {...BTN}
                className="self-end px-6 py-2.5 rounded-full text-sm font-medium text-white disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, var(--color-purple), #9333ea)' }}
              >
                다음 →
              </motion.button>
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 gap-2">
              {q.options!.map(opt => (
                <motion.button
                  key={opt}
                  onClick={() => handleButton(step === 1 ? 'q2' : 'q3', opt)}
                  whileHover={{ scale: 1.03, transition: SPRING.jelly }}
                  whileTap={{ scale: 0.95, transition: SPRING.snappy }}
                  className="rounded-xl px-3 py-3 text-sm text-left"
                  style={{
                    background: 'color-mix(in srgb, var(--color-purple) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-purple) 35%, transparent)',
                    color: 'var(--color-text-dim)',
                    lineHeight: 1.4,
                  }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
