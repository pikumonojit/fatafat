import './globals.css'

export const metadata = {
  metadataBase: new URL('https://matkakingfatafat-bice.vercel.app'),
  title: 'Matka King Fatafat – Daily Results & Game Timing',
  description: 'Matka King Fatafat publishes daily results, historical results and game timing information for informational purposes only.',
  keywords: ['Matka King Fatafat', 'daily results', 'old results', 'game timing', 'result chart'],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
  },
  openGraph: {
    title: 'Matka King Fatafat – Daily Results & Game Timing',
    description: 'Daily published results, historical results and game timing information.',
    url: 'https://matkakingfatafat-bice.vercel.app',
    siteName: 'Matka King Fatafat',
    type: 'website'
  }
}

export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}
