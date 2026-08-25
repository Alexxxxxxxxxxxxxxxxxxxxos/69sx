import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://69sx.com'),
  title: '69sx',
  description: '69sx.com',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    url: 'https://69sx.com',
    title: '69sx',
    description: '69sx.com',
    images: [{ url: '/assets/central-london.jpg', width: 1024, height: 683, alt: 'Night-time Central London' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '69sx',
    description: '69sx.com',
    images: ['/assets/central-london.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050606',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
