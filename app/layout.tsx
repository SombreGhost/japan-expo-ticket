import type { Metadata, Viewport } from 'next'
import { Orbitron, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Japan Expo ESP 2026 | Egghead Arc Edition',
  description: 'Rejoins-nous pour Japan Expo ESP 2026 - Edition Egghead Arc! Cosplay, manga, anime, jeux vidéo et plus encore. Barcelona, 15-16 Novembre 2026.',
  keywords: ['Japan Expo', 'ESP 2026', 'anime', 'manga', 'cosplay', 'One Piece', 'Egghead', 'Barcelona'],
  authors: [{ name: 'Japan Expo ESP' }],
  openGraph: {
    title: 'Japan Expo ESP 2026 | Egghead Arc Edition',
    description: 'Rejoins-nous pour Japan Expo ESP 2026 - Edition Egghead Arc! Cosplay, manga, anime, jeux vidéo et plus encore.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${orbitron.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
