import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
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
  title: {
    default: 'Vallalar Jeevakarunyam',
    template: '%s | Vallalar Jeevakarunyam',
  },
  description: 'A public service platform for Annadhanam, Jeeva Samadhi, temples and meditation centres, affordable stays, affordable healthcare, affordable education and compassionate community service.',
  applicationName: 'Vallalar Jeevakarunyam',
  keywords: ['Vallalar', 'Jeevakarunyam', 'Annadhanam', 'Jeeva Samadhi', 'Temples', 'Meditation Centres', 'Affordable Healthcare', 'Affordable Education', 'Community Service'],
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Navigation />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
