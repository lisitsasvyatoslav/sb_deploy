import type { MetadataRoute } from 'next';
import { getServerBrand } from '@/shared/config/server-brand';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const brand = await getServerBrand();
  const prefix = `/favicons/${brand}`;
  const themeColor = brand === 'lime' ? '#A9DC4D' : '#7863F6';

  return {
    name: 'Trading Diary',
    short_name: 'Trading Diary',
    description: 'Trading Diary - Interactive Board for Trading Ideas',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: themeColor,
    icons: [
      { src: `${prefix}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${prefix}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  };
}
