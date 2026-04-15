import { cookies } from 'next/headers';
import { currentRegionConfig, regionConfig } from '@/shared/config/region';

export type Brand = 'lime' | 'finam';

export async function getServerBrand(): Promise<Brand> {
  if (process.env.NODE_ENV === 'development') {
    const cookieStore = await cookies();
    const override = cookieStore.get('dev-region-override')?.value;
    if (override === 'ru') return regionConfig.ru.theme;
    if (override === 'us') return regionConfig.us.theme;
  }
  return currentRegionConfig.theme;
}
