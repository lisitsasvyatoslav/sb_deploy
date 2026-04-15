import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';
import { Icon } from '@/shared/ui/Icon/Icon';

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'u',
    'figure',
    'figcaption',
    'file-attachment',
  ],
  attributes: {
    ...defaultSchema.attributes,
    'file-attachment': [
      'data-file-id',
      'data-filename',
      'data-file-size',
      'data-mime-type',
      'data-file-type',
    ],
  },
};

/** Compact file attachment block for canvas card previews */
function FileAttachmentPreview({
  node,
}: {
  node?: { properties?: Record<string, unknown> };
}) {
  const props = node?.properties ?? {};
  const filename = String(
    props['dataFilename'] ?? props['data-filename'] ?? ''
  );
  const mimeType = String(
    props['dataMimeType'] ?? props['data-mime-type'] ?? ''
  );
  const isImage = mimeType.startsWith('image/');

  return (
    <span className="inline-flex items-center gap-2 px-3 py-2 my-1 rounded border border-[var(--blackinverse-a4)] bg-[var(--background-gray_high)]">
      <Icon
        variant={isImage ? 'image' : 'doc'}
        size={16}
        className="shrink-0 text-[var(--text-secondary)]"
      />
      <span className="text-12 text-[var(--text-secondary)] truncate">
        {filename || 'Attachment'}
      </span>
    </span>
  );
}

/**
 * Shared Markdown component configuration for theme-aware rendering.
 * Used by chat messages, board card content, and other Markdown displays.
 */
/** Returns true when a react-markdown <a> child node looks like a bare auto-link (href === text). */
function isBareUrl(
  href: string | undefined,
  children: React.ReactNode
): boolean {
  if (!href) return false;
  const text = typeof children === 'string' ? children : null;
  if (!text) return false;
  return (
    text.trim() === href.trim() ||
    text.trim() === href.replace(/\/$/, '').trim()
  );
}

export const markdownComponents: Components = {
  p: ({ children }) => {
    // Detect a paragraph that contains only a bare auto-link and render OG preview instead.
    const childArray = React.Children.toArray(children);
    if (childArray.length === 1 && React.isValidElement(childArray[0])) {
      const child = childArray[0] as React.ReactElement<{
        href?: string;
        children?: React.ReactNode;
      }>;
      const href = child.props?.href;
      if (href && isBareUrl(href, child.props?.children)) {
        return <LinkPreviewCard url={href} className="my-[8px]" />;
      }
    }
    return <p className="mb-[8px] last:mb-0">{children}</p>;
  },
  h1: ({ children }) => (
    <h1 className="font-semibold text-[18px] leading-[24px] mt-[16px] mb-[8px] first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-semibold text-[16px] leading-[24px] mt-[12px] mb-[8px] first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-semibold text-[14px] leading-[20px] mt-[12px] mb-[6px] first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-semibold text-[14px] leading-[20px] mt-[8px] mb-[4px] first:mt-0">
      {children}
    </h4>
  ),
  ul: ({ children }) => (
    <ul className="my-[8px] pl-[24px] list-disc">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-[8px] pl-[24px] list-decimal">{children}</ol>
  ),
  li: ({ children }) => <li className="my-[4px]">{children}</li>,
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="px-[6px] py-[2px] rounded-[4px] text-[0.875em] bg-background-secondary text-text-primary">
          {children}
        </code>
      );
    }
    return <code className="text-text-primary">{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="p-[12px] rounded-[8px] overflow-x-auto my-[8px] text-[14px] leading-[20px] bg-background-secondary">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-[3px] pl-[16px] my-[8px] italic border-border-medium text-text-secondary">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent underline hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-[8px]">
      <table className="border-collapse w-full text-[14px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-background-card">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-[12px] py-[8px] text-left font-semibold border border-border-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-[12px] py-[8px] border border-border-medium">
      {children}
    </td>
  ),
  hr: () => <hr className="my-[16px] border-border-light" />,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
};

// Register custom HTML element renderer for file attachment round-trip display.
// Must be done after object creation to avoid TypeScript excess property check.
(markdownComponents as Record<string, unknown>)['file-attachment'] =
  FileAttachmentPreview;

interface MarkdownRendererProps {
  content: string;
  className?: string;
  components?: Partial<Components>;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  components: overrides,
}) => {
  const mergedComponents = overrides
    ? { ...markdownComponents, ...overrides }
    : markdownComponents;

  const markdown = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      components={mergedComponents}
    >
      {content}
    </ReactMarkdown>
  );

  if (className) {
    return <div className={className}>{markdown}</div>;
  }

  return markdown;
};
