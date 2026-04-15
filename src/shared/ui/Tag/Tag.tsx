import TickerIcon from '@/shared/ui/TickerIcon';
import Button from '@/shared/ui/Button';
import {
  Tag as TagType,
  isAiResponseTag,
  isEntityTag,
  isKeywordTag,
  isLinkTag,
  isSentimentTag,
  isSignalTag,
  isTickerTag,
} from '@/types';
import {
  AutoAwesome,
  Link as LinkIcon,
  Notifications,
} from '@mui/icons-material';
import React from 'react';

interface TagProps {
  tag: TagType;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ tag, className = '' }) => {
  if (isTickerTag(tag)) {
    const symbol = tag.meta?.symbol || tag.text;
    // Support both camelCase (securityId) and snake_case (security_id) for backwards compatibility
    const securityId = tag.meta?.securityId || tag.meta?.security_id;

    return (
      <div
        className={`inline-flex items-center gap-1 bg-background-tagFocused rounded-[20px] px-2 py-1 ${className}`}
      >
        <TickerIcon symbol={symbol} securityId={securityId} size={16} />
        <span className="text-xs font-medium text-text-primary leading-4 tracking-[-0.096px]">
          {tag.text}
        </span>
      </div>
    );
  }

  if (isAiResponseTag(tag)) {
    return (
      <div
        className={`inline-flex items-center gap-1 bg-primary-500/8 rounded-[20px] px-2 py-1 ${className}`}
      >
        <AutoAwesome className="text-primary-500" sx={{ fontSize: 16 }} />
        <span className="text-xs font-medium text-primary-500 leading-4 tracking-[-0.096px]">
          {tag.text}
        </span>
      </div>
    );
  }

  if (isKeywordTag(tag)) {
    return (
      <div
        className={`inline-flex items-center gap-1 bg-background-tagFocused rounded-[20px] px-2 py-1 ${className}`}
      >
        <span className="text-xs font-medium text-text-primary leading-4 tracking-[-0.096px]">
          {tag.text}
        </span>
      </div>
    );
  }

  if (isEntityTag(tag)) {
    const entityType = tag.meta?.entityType;
    return (
      <div
        className={`inline-flex items-center gap-1 bg-tag-entity-bg rounded-[20px] px-2 py-1 ${className}`}
      >
        <span className="text-[10px] font-semibold uppercase text-blue-700 leading-4 tracking-[-0.096px]">
          {entityType || 'entity'}
        </span>
        <span className="text-xs font-medium text-text-primary leading-4 tracking-[-0.096px]">
          {tag.text}
        </span>
      </div>
    );
  }

  if (isSentimentTag(tag)) {
    const label = (tag.meta?.label || tag.text || '').toLowerCase();
    const color = label.includes('neg')
      ? 'var(--status-negative)'
      : label.includes('pos')
        ? 'var(--status-success)'
        : 'var(--blackinverse-a56)';
    const bg = label.includes('neg')
      ? 'bg-tag-negative-bg'
      : label.includes('pos')
        ? 'bg-tag-positive-bg'
        : 'bg-tag-neutral-bg';
    return (
      <div
        className={`inline-flex items-center gap-1 ${bg} rounded-[20px] px-2 py-1 ${className}`}
      >
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span
          className="text-xs font-medium leading-4 tracking-[-0.096px]"
          style={{ color }}
        >
          {tag.text}
        </span>
      </div>
    );
  }

  if (isLinkTag(tag)) {
    const url = tag.meta?.url || tag.meta?.link || '#';

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card selection
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <Button
        onClick={handleClick}
        variant="ghost"
        size="xs"
        icon={<LinkIcon />}
        className={`!rounded-[20px] !bg-background-tagFocused hover:!bg-background-secondary !h-auto !py-1 !px-2 !text-xs !font-medium !text-text-primary !leading-4 !tracking-[-0.096px] ${className}`}
      >
        {tag.text}
      </Button>
    );
  }

  if (isSignalTag(tag)) {
    return (
      <div
        className={`inline-flex items-center gap-1 bg-tag-signal-bg rounded-[20px] px-2 py-1 ${className}`}
      >
        <Notifications className="text-orange-500" sx={{ fontSize: 16 }} />
        <span className="text-xs font-medium text-orange-500 leading-4 tracking-[-0.096px]">
          {tag.text}
        </span>
      </div>
    );
  }

  // Fallback for unknown tag types
  return (
    <div
      className={`inline-flex items-center gap-1 bg-background-tagFocused rounded-[20px] px-2 py-1 ${className}`}
    >
      <span className="text-xs font-medium text-text-primary leading-4 tracking-[-0.096px]">
        {tag.text}
      </span>
    </div>
  );
};

export default Tag;
