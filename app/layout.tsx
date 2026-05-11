import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'PRplatforma.sk — Bezplatné PR články',
    template: '%s | PRplatforma.sk',
  },
  description: 'Publikuj PR články, buduj autoritu a získavaj zákazníkov. Každý článok sa indexuje vo vyhľadávačoch a má transparentné štatistiky.',
  metadataBase: new URL('https://prplatforma.sk'),
  openGraph: {
    siteName: 'PRplatforma.sk',
    type: 'website',
    locale: 'sk_SK',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
