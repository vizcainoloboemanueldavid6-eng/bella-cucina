import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { site } from '@/config/site';
import { restaurantJsonLd } from '@/lib/structuredData';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.seo.url),
  title: {
    default: site.seo.title,
    template: `%s · ${site.name}`,
  },
  description: site.seo.description,
  applicationName: site.name,
  generator: null,
  keywords: [
    'Italian restaurant',
    'handmade pasta',
    'wood-fired pizza',
    'trattoria',
    'Italian wine',
    site.address.city,
    site.name,
  ],
  authors: [{ name: site.name, url: site.seo.url }],
  creator: site.name,
  publisher: site.name,
  category: 'restaurant',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    url: site.seo.url,
    locale: site.seo.locale,
    images: [
      {
        url: site.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
    images: [site.seo.ogImage],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBF7F0',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/*
          Arms the scroll-reveal styles only when scripting is available. Without this,
          a visitor with JavaScript disabled would see a page of invisible sections.
          It is inline and render-blocking on purpose, so there is no flash.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        {/* No hero preload here on purpose: React 19 emits one automatically for the hero's
            fetchPriority="high" <img>, and adding our own only put a second, identical record
            in the exported HTML. */}
        <link rel="preconnect" href="https://www.openstreetmap.org" />
        <script
          type="application/ld+json"
          // Static, build-time JSON derived from site.ts — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
