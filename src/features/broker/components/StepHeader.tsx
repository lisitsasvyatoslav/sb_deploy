import { cn } from '@/shared/utils/cn';
import React from 'react';

interface StepHeaderProps {
  title: string;
  description: string;
}

/**
 * Step header with title and description for broker wizard steps.
 *
 * Figma node: 3096:38039
 */
const StepHeader: React.FC<StepHeaderProps> = ({ title, description }) => (
  <div className="flex flex-col gap-base-6 w-full">
    <h2
      className={cn(
        'text-24 font-semibold leading-32 tracking-tight-2',
        'text-[var(--text-primary)]'
      )}
    >
      {title}
    </h2>
    <p className="text-16 tracking-tight-1 text-blackinverse-a32">
      {description}
    </p>
  </div>
);

export default StepHeader;
