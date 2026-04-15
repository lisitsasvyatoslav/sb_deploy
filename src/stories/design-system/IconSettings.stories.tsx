/**
 * Design System — Icon Settings
 *
 * Данные берутся из tokens/icon-settings.js (auto-generated from Figma).
 * Запусти `npm run update-tokens` — страница обновится автоматически.
 *
 * Коллекция Icon Settings определяет размер и толщину обводки (outline)
 * для каждого размерного мода иконок (24/20/16/12).
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { Section, type Source } from './_helpers';

/* eslint-disable @typescript-eslint/no-require-imports */
const iconSettings = require('../../../tokens/icon-settings') as Record<
  string,
  { size: string; outline: string }
>;

// ─── Main component ───────────────────────────────────────────────────────────

function IconSettingsPage() {
  const TOKEN_SOURCE: Source = {
    type: 'token',
    files: 'tokens/icon-settings.js',
  };

  const modes = Object.entries(iconSettings).sort(
    (a, b) => parseFloat(b[0]) - parseFloat(a[0])
  );

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
        Icon Settings
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 40,
        }}
      >
        Данные из <code>tokens/icon-settings.js</code>. Запусти{' '}
        <code>npm run update-tokens</code> — страница обновится. Каждый мод
        задаёт размер иконки и толщину обводки (stroke).
      </p>

      <Section title="Размеры и обводка по модам" source={TOKEN_SOURCE}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {modes.map(([mode, { size, outline }]) => {
            const sizePx = parseFloat(size);
            const outlinePx = parseFloat(outline);

            return (
              <div
                key={mode}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  alignItems: 'center',
                  gap: 24,
                  paddingBottom: 20,
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: 4,
                    }}
                  >
                    Mode {mode}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                    }}
                  >
                    size: {size}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                    }}
                  >
                    outline: {outline}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  {/* Icon preview — simple square with stroke */}
                  <svg
                    width={sizePx}
                    height={sizePx}
                    viewBox={`0 0 ${sizePx} ${sizePx}`}
                    style={{ flexShrink: 0 }}
                  >
                    <rect
                      x={outlinePx / 2}
                      y={outlinePx / 2}
                      width={sizePx - outlinePx}
                      height={sizePx - outlinePx}
                      rx={sizePx * 0.15}
                      fill="none"
                      stroke="var(--text-primary, #333)"
                      strokeWidth={outlinePx}
                    />
                    <circle
                      cx={sizePx / 2}
                      cy={sizePx / 2}
                      r={sizePx * 0.2}
                      fill="var(--text-primary, #333)"
                    />
                  </svg>

                  {/* Size comparison bar */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: sizePx * 4,
                        height: sizePx,
                        background: 'rgba(120, 99, 246, 0.08)',
                        border: '1px solid rgba(120, 99, 246, 0.3)',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {sizePx}×{sizePx}px
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      stroke: {outlinePx}px
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Reference table ── */}
      <Section title="Справочник токенов" source={TOKEN_SOURCE}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 8,
          }}
        >
          {modes.map(([mode, { size, outline }]) => (
            <div
              key={mode}
              style={{
                padding: '8px 12px',
                background: 'var(--surface-medium, #f5f5f5)',
                borderRadius: 8,
                border: '1px solid var(--border-light, #eee)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 4,
                }}
              >
                iconSettings[&quot;{mode}&quot;]
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)',
                }}
              >
                size: {size} · outline: {outline}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Story config ─────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Icon Settings',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: { toc: true },
  },
};

export default meta;
type Story = StoryObj;

export const AllIconSettings: Story = {
  name: 'Все настройки',
  render: () => <IconSettingsPage />,
};
