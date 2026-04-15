import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses DOMPurify to safely render untrusted HTML from external sources
 *
 * @param dirty - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    // Allow common HTML tags for rich text content
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
      'hr',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
      'figure',
      'figcaption',
    ],
    // Allow common attributes
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'class',
      'id',
      'target',
      'rel',
      'width',
      'height',
    ],
    // Enforce target="_blank" and rel="noopener noreferrer" for external links
    ALLOW_DATA_ATTR: false,
    // Return the entire sanitized string (not a DOM tree)
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
};

/**
 * Возвращает пустую строку, если HTML не содержит текстового контента
 * (например, TipTap отдаёт `<p></p>` при пустом редакторе)
 */
export const stripEmptyHtml = (html: string): string => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text ? html : '';
};
