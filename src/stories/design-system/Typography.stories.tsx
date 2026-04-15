/**
 * Design System — Typography
 *
 * Данные берутся из tokens/typography.js (auto-generated from Figma).
 * Запусти `npm run update-tokens` — страница обновится автоматически.
 *
 * Все секции на этой странице генерируются из токен-файла.
 * Хардкода нет.
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { Section, type Source } from './_helpers';

/* eslint-disable @typescript-eslint/no-require-imports */
const typography = require('../../../tokens/typography') as {
  fontFamily: Record<string, string>;
  fontSize: { desktop: Record<string, [string, { lineHeight: string }]> };
  fontWeight?: Record<string, string>;
  lineHeight?: Record<string, string>;
  letterSpacing?: Record<string, string>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface TypeRowProps {
  label: string;
  fontSize: string;
  lineHeight: string;
  fontWeight?: string | number;
  fontFamily?: string;
  sample?: string;
}

function TypeRow({
  label,
  fontSize,
  lineHeight,
  fontWeight,
  fontFamily,
  sample,
}: TypeRowProps) {
  const sizePx = parseFloat(fontSize);
  const displaySize = Math.min(sizePx, 48);
  const displayLineHeight = `${Math.round(displaySize * (parseFloat(lineHeight) / sizePx))}px`;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        alignItems: 'baseline',
        gap: 24,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-light)',
        marginBottom: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
          }}
        >
          {fontSize} / {lineHeight}
          {fontWeight ? ` / w${fontWeight}` : ''}
          {sizePx > 48 ? ' (уменьшено для превью)' : ''}
        </div>
      </div>
      <div
        style={{
          color: 'var(--text-primary)',
          fontSize: displaySize,
          lineHeight: displayLineHeight,
          fontWeight: fontWeight ? Number(fontWeight) : undefined,
          fontFamily,
        }}
      >
        {sample ?? 'Быстрая коричневая лиса перепрыгнула через ленивую собаку'}
      </div>
    </div>
  );
}

const desktopSizes = typography.fontSize.desktop;

// ─── Main component ───────────────────────────────────────────────────────────

function TypographyPage() {
  const fontFamilies = Object.entries(typography.fontFamily);
  const fontWeights = Object.entries(typography.fontWeight ?? {});
  const lineHeights = Object.entries(typography.lineHeight ?? {}).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );
  const letterSpacings = Object.entries(typography.letterSpacing ?? {}).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  const TOKEN_SOURCE: Source = { type: 'token', files: 'tokens/typography.js' };

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}
      >
        Типографика
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 40,
        }}
      >
        Данные из <code>tokens/typography.js</code>. Запусти{' '}
        <code>npm run update-tokens</code> — страница обновится. Хардкода нет —
        все секции генерируются из файла токенов.
      </p>

      {/* ── Семейства шрифтов ── */}
      <Section title="Семейства шрифтов" source={TOKEN_SOURCE}>
        {fontFamilies.map(([key, family]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              marginBottom: 16,
              padding: 16,
              background: 'var(--surface-medium, #f5f5f5)',
              borderRadius: 8,
              border: '1px solid var(--border-light, #eee)',
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
              }}
            >
              fontFamily.{key}
            </span>
            <span
              style={{
                fontSize: 26,
                fontFamily: family,
                color: 'var(--text-primary)',
              }}
            >
              {family}
            </span>
            <span
              style={{
                fontSize: 13,
                fontFamily: family,
                color: 'var(--text-secondary)',
              }}
            >
              The quick brown fox jumped over the lazy dog — 0123456789
            </span>
          </div>
        ))}
      </Section>

      {/* ── Веса шрифтов ── */}
      <Section title="Веса шрифтов" source={TOKEN_SOURCE}>
        {fontWeights.map(([key, weight]) => (
          <TypeRow
            key={key}
            label={`fontWeight.${key} (${weight})`}
            fontSize="20px"
            lineHeight="30px"
            fontWeight={weight}
            sample={`${key} — Торговый дневник`}
          />
        ))}
      </Section>

      {/* ── Межстрочные интервалы ── */}
      {lineHeights.length > 0 && (
        <Section
          title="Межстрочные интервалы (Line Height)"
          source={TOKEN_SOURCE}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lineHeights.map(([key, value]) => {
              const px = parseFloat(value);
              return (
                <div
                  key={key}
                  style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                >
                  <div
                    style={{
                      width: 160,
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}
                    >
                      leading-{key}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      height: px,
                      width: 320,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(120, 99, 246, 0.08)',
                        borderTop: '1px solid rgba(120, 99, 246, 0.3)',
                        borderBottom: '1px solid rgba(120, 99, 246, 0.3)',
                        borderRadius: 2,
                      }}
                    />
                    <span
                      style={{
                        position: 'relative',
                        fontSize: Math.min(px * 0.7, 20),
                        lineHeight: value,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        paddingLeft: 8,
                      }}
                    >
                      Торговый дневник
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Межбуквенные интервалы ── */}
      {letterSpacings.length > 0 && (
        <Section
          title="Межбуквенные интервалы (Letter Spacing)"
          source={TOKEN_SOURCE}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {letterSpacings.map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  alignItems: 'baseline',
                  gap: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: 2,
                    }}
                  >
                    tracking-{key}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {value}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    letterSpacing: value,
                    color: 'var(--text-primary)',
                  }}
                >
                  AAPL $182.50 +1.24% — Торговый дневник
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Размеры шрифтов ── */}
      <Section title="Размеры шрифтов (fontSize.desktop)" source={TOKEN_SOURCE}>
        {Object.entries(desktopSizes)
          .sort((a, b) => parseFloat(a[1][0]) - parseFloat(b[1][0]))
          .map(([key, [size, { lineHeight }]]) => (
            <TypeRow
              key={key}
              label={`fontSize.desktop.${key}`}
              fontSize={size}
              lineHeight={lineHeight}
              sample={`${size} — AAPL $182.50 +1.24%`}
            />
          ))}
      </Section>

      {/* ── Все токены — справочник ── */}
      <Section
        title="Все токены fontSize.desktop (справочник)"
        source={TOKEN_SOURCE}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 8,
          }}
        >
          {Object.entries(desktopSizes).map(([key, [size, { lineHeight }]]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                background: 'var(--surface-medium, #f5f5f5)',
                borderRadius: 6,
                border: '1px solid var(--border-light, #eee)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                }}
              >
                {key}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)',
                }}
              >
                {size} / {lineHeight}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Story config ─────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: { toc: true },
  },
};

export default meta;
type Story = StoryObj;

export const AllTypography: Story = {
  name: 'Все стили',
  render: () => <TypographyPage />,
};
