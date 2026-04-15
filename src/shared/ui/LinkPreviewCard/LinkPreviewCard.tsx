'use client';

/**
 * LinkPreviewCard — OG-preview block for URLs in note cards.
 *
 * Figma node: 2644:126004
 *
 * Renders:
 * - OG image (65×65px, rounded) on the left, falls back to favicon / domain initial
 * - Domain + title + description on the right
 * - Chevron arrow on the far right
 * - Opens the URL in a new tab on click
 */

import classNames from 'classnames';
import { Icon } from '@/shared/ui/Icon/Icon';
import { useLinkPreview } from '@/shared/hooks/useLinkPreview';

interface LinkPreviewCardProps {
  url: string;
  className?: string;
}

export function LinkPreviewCard({ url, className }: LinkPreviewCardProps) {
  const { data, isLoading } = useLinkPreview(url);

  const domain =
    data?.domain ??
    (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return url;
      }
    })();

  if (isLoading) {
    return <LinkPreviewSkeleton className={className} />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(
        'flex items-center gap-[12px] p-[12px] rounded-radius-8',
        'bg-surfacegray-high backdrop-blur-effects-panel shadow-effects-panel',
        'no-underline hover:opacity-90 transition-opacity cursor-pointer',
        'not-prose',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* OG image or favicon/initial fallback */}
      <div className="shrink-0 size-[65px] rounded-radius-8 overflow-clip bg-white flex items-center justify-center">
        {data?.image ? (
          <img
            src={data.image}
            alt={data.title ?? domain}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = 'none';
              const next = img.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Favicon / initial fallback — hidden when image loads successfully */}
        <div
          className={classNames(
            'w-full h-full flex items-center justify-center bg-background-gray_high',
            data?.image ? 'hidden' : 'flex'
          )}
        >
          {data?.favicon ? (
            <img
              src={data.favicon}
              alt={domain}
              className="size-[32px] object-contain"
            />
          ) : (
            <span className="text-[20px] font-semibold text-blackinverse-a56 select-none">
              {domain.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
        <span className="text-[12px] font-normal leading-[16px] tracking-[-0.2px] text-blackinverse-a56 truncate">
          {domain}
        </span>

        {data?.title ? (
          <span className="text-[14px] font-semibold leading-[20px] tracking-[-0.2px] text-blackinverse-a100 line-clamp-2">
            {data.title}
          </span>
        ) : null}

        {data?.description ? (
          <span className="text-[12px] font-normal leading-[16px] tracking-[-0.2px] text-blackinverse-a56 line-clamp-3">
            {data.description}
          </span>
        ) : null}
      </div>

      {/* Navigation arrow */}
      <Icon
        variant="chevronRight"
        size={16}
        className="shrink-0 text-blackinverse-a56"
      />
    </a>
  );
}

function LinkPreviewSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={classNames(
        'flex items-center gap-[12px] p-[12px] rounded-radius-8 bg-surfacegray-high',
        className
      )}
    >
      <div className="shrink-0 size-[65px] rounded-radius-8 bg-skeleton-stroke animate-pulse" />
      <div className="flex-1 flex flex-col gap-[6px]">
        <div className="h-[12px] w-[80px] rounded-radius-4 bg-skeleton-stroke animate-pulse" />
        <div className="h-[16px] w-full rounded-radius-4 bg-skeleton-stroke animate-pulse" />
        <div className="h-[16px] w-[70%] rounded-radius-4 bg-skeleton-stroke animate-pulse" />
      </div>
    </div>
  );
}
