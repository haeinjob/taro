export const SPRING = {
  snappy: { type: 'spring' as const, stiffness: 500, damping: 20 },
  jelly:  { type: 'spring' as const, stiffness: 600, damping: 12 },
  smooth: { type: 'spring' as const, stiffness: 400, damping: 30 },
  settle: { type: 'spring' as const, stiffness: 300, damping: 35 },
}

export const BTN = {
  whileHover: { scale: 1.05, y: -3 },
  whileTap:   { scale: 0.93 },
  transition:  SPRING.snappy,
}

export const PAGE_ENTER = {
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -16 },
  transition: { ...SPRING.smooth },
}

export const POP = {
  initial:    { scale: 0, opacity: 0 },
  animate:    { scale: 1, opacity: 1 },
  transition: SPRING.jelly,
}
