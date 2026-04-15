import React from 'react';
import Image from 'next/image';
import Tag from '@/shared/ui/Tag';
import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer';
import { sanitizeHtml } from '@/shared/utils/sanitizeHtml';
import { useTranslation } from '@/shared/i18n/client';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';
import type { Tag as TagInterface } from '@/types/tag';

export interface NewsDetailContentProps {
  title: string;
  content?: string;
  htmlContent?: string;
  ogImage?: string;
  tags?: TagInterface[];
  date?: string;
}

const HTML_CONTENT_CLASSES =
  'mb-6 text-[var(--text-primary)] leading-relaxed text-[15px] [&_p]:mb-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_figure]:my-6 [&_figure_img]:w-full [&_figure_img]:block [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_figcaption]:text-[var(--text-secondary)] [&_figcaption]:italic [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-semibold [&_h4]:mt-6 [&_h4]:mb-3 [&_h4]:font-semibold [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_a]:text-primary-500 [&_a]:no-underline hover:[&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary-500 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-[var(--text-secondary)]';

const NewsDetailContent: React.FC<NewsDetailContentProps> = ({
  title,
  content,
  htmlContent,
  ogImage,
  tags,
  date,
}) => {
  const { i18n } = useTranslation('common');

  return (
    <div className="p-6">
      {/* Image */}
      {ogImage && (
        <div className="mb-6 rounded-lg overflow-hidden bg-[var(--bg-card)]">
          <Image
            src={ogImage}
            alt={title || 'News image'}
            className="w-full h-auto max-h-[400px] object-contain"
            width={800}
            height={400}
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
        {title}
      </h3>

      {/* Meta info */}
      {date && (
        <div className="flex items-center gap-2 mb-4 text-sm text-[var(--text-secondary)]">
          <span>
            {isISODate(date)
              ? new Date(date).toLocaleDateString(
                  getDateLocaleTag(i18n.language),
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )
              : date}
          </span>
        </div>
      )}

      {/* Content */}
      {htmlContent ? (
        <div
          className={HTML_CONTENT_CLASSES}
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(htmlContent),
          }}
        />
      ) : (
        content && (
          <div className="mb-6 text-[var(--text-primary)] leading-relaxed text-[15px] prose prose-sm max-w-none">
            <MarkdownRenderer content={content} />
          </div>
        )
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[var(--border-light)]">
          {tags.map((tag, index) => (
            <Tag key={`${tag.type}-${tag.text}-${index}`} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Check if a string is an ISO-8601 date (e.g. "2026-04-10T12:45:00Z").
 * Strict check to avoid false positives on pre-formatted display strings
 * like "April 10" which JS parses as year 2001.
 */
function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

export default NewsDetailContent;
