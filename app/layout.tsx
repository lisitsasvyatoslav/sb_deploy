import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { MobileGuard } from '@/shared/ui/MobileGuard';
import {
  LANGUAGE_COOKIE,
  FALLBACK_LOCALE,
  SUPPORTED_LOCALES,
} from '@/shared/i18n/settings';
import { getServerBrand } from '@/shared/config/server-brand';
import './globals.css';
import './scrollbar.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getServerBrand();
  const prefix = `/favicons/${brand}`;

  return {
    title: 'Trading Diary',
    description: 'Trading journal with Multi-LLM integration',
    icons: {
      icon: [
        { url: `${prefix}/favicon.ico`, sizes: '32x32' },
        { url: `${prefix}/icon.svg`, type: 'image/svg+xml' },
      ],
      apple: `${prefix}/apple-touch-icon.png`,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const locale =
    localeCookie &&
    (SUPPORTED_LOCALES as readonly string[]).includes(localeCookie)
      ? localeCookie
      : FALLBACK_LOCALE;

  const brand = await getServerBrand();

  return (
    <html
      lang={locale}
      data-brand={brand}
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!localStorage.getItem('theme')){var s=localStorage.getItem('app-view-state');if(s){var p=JSON.parse(s);if(p.state&&p.state.theme){localStorage.setItem('theme',p.state.theme)}}}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <MobileGuard>{children}</MobileGuard>
        </Providers>
      </body>
    </html>
  );
}
