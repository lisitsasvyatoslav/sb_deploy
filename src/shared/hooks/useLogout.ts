import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/services/api';
import { logger } from '@/shared/utils/logger';

export function useLogout() {
  const router = useRouter();

  return useCallback(async () => {
    try {
      await auth.logout();
    } catch (error) {
      logger.error('useLogout', 'Logout error', error);
    }
    router.push('/login');
  }, [router]);
}
