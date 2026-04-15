'use client';

import {
  isBulletItem,
  isSubtitle,
  splitContent,
} from '@/features/legal/utils/legalDocUtils';

interface LegalDocContentProps {
  content: string;
  loading?: boolean;
  error?: string | null;
}

export default function LegalDocContent({
  content,
  loading,
  error,
}: LegalDocContentProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-blackinverse-a12 border-t-blackinverse-a56 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-14 font-normal leading-20 tracking-tight-1 text-blackinverse-a56">
        {error}
      </p>
    );
  }

  const { title, paragraphs } = splitContent(content);

  return (
    <>
      {title && (
        <h1 className="text-24 font-semibold leading-32 tracking-tight-2 text-blackinverse-a100 mb-spacing-24">
          {title}
        </h1>
      )}

      <div className="flex flex-col gap-spacing-12">
        {paragraphs.map((paragraph, index) => {
          const key = `${index}-${paragraph.slice(0, 32)}`;
          if (isSubtitle(paragraph)) {
            return (
              <p
                key={key}
                className="text-18 font-semibold leading-24 tracking-tight-2 text-blackinverse-a100"
              >
                {paragraph}
              </p>
            );
          }
          if (isBulletItem(paragraph)) {
            return (
              <div key={key} className="flex gap-spacing-8">
                <span className="text-14 font-normal leading-20 text-blackinverse-a56 shrink-0">
                  •
                </span>
                <p className="text-14 font-normal leading-20 tracking-tight-1 text-blackinverse-a56">
                  {paragraph}
                </p>
              </div>
            );
          }
          return (
            <p
              key={key}
              className="text-14 font-normal leading-20 tracking-tight-1 text-blackinverse-a56"
            >
              {paragraph}
            </p>
          );
        })}
      </div>
    </>
  );
}
