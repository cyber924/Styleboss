import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | StyleWise AI',
    default: 'StyleWise AI - AI가 찾아주는 나만의 스타일',
  },
  description: 'StyleWise AI와 함께 당신의 완벽한 룩을 발견하세요. 최신 트렌드부터 숨겨진 보석까지, AI가 모두 찾아드립니다.',
  openGraph: {
    title: 'StyleWise AI',
    description: 'AI 패션 큐레이션 플랫폼',
    url: 'https://stylewise-ai.web.app',
    siteName: 'StyleWise AI',
    images: [
      {
        url: 'https://stylewise-ai.web.app/og-image.png', // It's good practice to have a default OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
   robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
   twitter: {
    card: 'summary_large_image',
    title: 'StyleWise AI - AI가 찾아주는 나만의 스타일',
    description: 'AI 패션 큐레이션 플랫폼. 당신의 완벽한 룩을 발견하세요.',
    images: ['https://stylewise-ai.web.app/og-image.png'],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
