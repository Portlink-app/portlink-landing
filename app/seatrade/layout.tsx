import type { Metadata } from 'next'

const title = 'Port Call Friction Score · Seatrade Cruise Med 2026'
const description =
  'Seven taps, about a minute. See how much of your port call still runs on email, and how you compare with the rest of Seatrade Cruise Med in Las Palmas.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://portlink.app/seatrade/' },
  openGraph: {
    title,
    description,
    url: 'https://portlink.app/seatrade/',
    siteName: 'Portlink',
    type: 'website',
    images: [{ url: 'https://portlink.app/seatrade/og.png', width: 1200, height: 630, alt: 'What is your port call friction score?' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['https://portlink.app/seatrade/og.png'],
  },
}

export default function SeatradeLayout({ children }: { children: React.ReactNode }) {
  return children
}
