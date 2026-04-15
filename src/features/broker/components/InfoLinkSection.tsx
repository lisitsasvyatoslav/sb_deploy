import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import React from 'react';

interface InfoLinkSectionProps {
  title: string;
  description: React.ReactNode;
  onClick?: () => void;
}

/**
 * InfoLinkSection — always-visible info block with title, description, and chevron icon.
 * Used in broker connection wizard for "How to do it" and "Not a client" sections.
 *
 * Figma node: 3096:35920 (wrap), 3310:11323 (wrap2)
 */
const InfoLinkSection: React.FC<InfoLinkSectionProps> = ({
  title,
  description,
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group flex flex-col gap-spacing-8 w-full text-left',
        onClick && 'cursor-pointer transition-colors'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-16 font-semibold leading-24 tracking-tight text-blackinverse-a56 group-hover:text-blackinverse-a100">
          {title}
        </span>
        {onClick && (
          <Icon
            variant="chevronRight"
            size={16}
            className="text-blackinverse-a56 flex-shrink-0"
          />
        )}
      </div>
      <div className="flex items-center pr-spacing-24">
        <span className="w-full text-12 font-medium leading-16 tracking-0 text-blackinverse-a32 group-hover:text-blackinverse-a100 [&_a]:underline [&_a]:text-inherit group-hover:[&_a]:text-brand-base">
          {description}
        </span>
      </div>
    </Component>
  );
};

export default InfoLinkSection;
