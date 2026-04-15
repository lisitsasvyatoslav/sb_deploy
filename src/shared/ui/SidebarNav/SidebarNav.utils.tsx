import type { ReactNode } from 'react';

import { Icon, type IconVariant } from '@/shared/ui/Icon';

/** Renders an IconVariant string or custom ReactNode as a 20px icon. */
export const renderIcon = (icon: IconVariant | ReactNode): ReactNode =>
  typeof icon === 'string' ? (
    <Icon variant={icon as IconVariant} size={20} />
  ) : (
    icon
  );
