import React, { useState } from 'react';

// ─── Source badge ─────────────────────────────────────────────────────────────

export type Source =
  | { type: 'token'; files: string | string[] }
  | { type: 'hardcoded'; editIn: string; note?: string }
  | {
      type: 'mixed';
      tokenFiles: string | string[];
      hardcodedIn: string;
      note?: string;
    };

export function SourceBadge({ source }: { source: Source }) {
  const pill = (
    key: string,
    bg: string,
    border: string,
    color: string,
    label: string
  ) => (
    <span
      key={key}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 7px',
        borderRadius: 4,
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: 600,
        background: bg,
        border: `1px solid ${border}`,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );

  const tokenFiles =
    source.type === 'token'
      ? Array.isArray(source.files)
        ? source.files
        : [source.files]
      : source.type === 'mixed'
        ? Array.isArray(source.tokenFiles)
          ? source.tokenFiles
          : [source.tokenFiles]
        : [];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      {tokenFiles.map((f) =>
        pill(
          f,
          'rgba(34,197,94,0.10)',
          'rgba(34,197,94,0.40)',
          'var(--color-success,#166534)',
          `📄 ${f}`
        )
      )}
      {(source.type === 'hardcoded' || source.type === 'mixed') &&
        pill(
          'hc',
          'rgba(251,146,60,0.10)',
          'rgba(251,146,60,0.50)',
          'var(--color-warning,#92400e)',
          '✏️ Хардкод'
        )}
      {source.type === 'token' && (
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          · автогенерация из Figma
        </span>
      )}
      {source.type === 'hardcoded' && (
        <span
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
          }}
        >
          редактировать: {source.editIn}
        </span>
      )}
      {source.type === 'mixed' && (
        <span
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
          }}
        >
          имена переменных: {source.hardcodedIn}
        </span>
      )}
      {(source.type === 'hardcoded' || source.type === 'mixed') &&
        source.note && (
          <span
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            · {source.note}
          </span>
        )}
    </div>
  );
}

// ─── Copy hook ────────────────────────────────────────────────────────────────

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    });
  };
  return { copy, copied };
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

export function Section({
  title,
  source,
  children,
}: {
  title: string;
  source: Source;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 6,
          paddingBottom: 10,
          borderBottom: '2px solid var(--color-accent)',
        }}
      >
        {title}
      </h2>
      <SourceBadge source={source} />
      {children}
    </div>
  );
}
