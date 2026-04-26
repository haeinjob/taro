import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '오늘의 타로 운세',
  description: '매일 하나의 타로 카드로 오늘의 운세를 읽어드려요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
