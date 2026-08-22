import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navigation from '@/components/Navigation'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Vallalar Jeevakarunyam',
  description:
    'A common platform for people who practice Jeevakarunyam and righteous conduct, serving all living beings without causing harm.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />

        {children}
      </body>
    </html>
  )
}