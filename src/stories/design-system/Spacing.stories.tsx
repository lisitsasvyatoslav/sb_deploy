/**
 * Design System — Spacing & Sizes
 *
 * Данные берутся из tokens/sizes.js и tokens/shadows.js (auto-generated from Figma).
 * Запусти `npm run update-tokens` — страница обновится автоматически.
 *
 * ХАРДКОД (не в Figma-токенах):
 *   - Z-index шкала   — редактировать: src/stories/design-system/Spacing.stories.tsx → zIndexTokens
 *   - Высоты компонентов — редактировать: src/stories/design-system/Spacing.stories.tsx → componentHeights
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { Section, useCopyToClipboard } from './_helpers';

function CopyChip({ text }: { text: string }) {
  const { copy, copied } = useCopyToClipboard();
  return (
    <button
      onClick={() => copy(text)}
      title={`Копировать: ${text}`}
      style={{
        display: 'block',
        fontSize: 9,
        fontFamily: 'monospace',
        padding: '1px 5px',
        background: copied
          ? 'rgba(34,197,94,0.15)'
          : 'var(--surface-medium,#f5f5f5)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.5)' : 'var(--border-light,#eee)'}`,
        borderRadius: 3,
        cursor: 'pointer',
        color: copied ? '#166534' : 'var(--text-muted)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        transition: 'all 0.15s',
      }}
    >
      {copied ? '✓ copied' : text}
    </button>
  );
}

/* eslint-disable @typescript-eslint/no-require-imports */
const sizes = require('../../../tokens/sizes') as {
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  opacity: Record<string, string>;
};
const figmaShadows = require('../../../tokens/shadows') as Record<
  string,
  string
>;
const figmaBlurs = require('../../../tokens/blurs') as Record<string, string>;

// ─── Filter token groups ──────────────────────────────────────────────────────

/** spacing-* tokens from sizes.spacing */
const spacingTokens = Object.entries(sizes.spacing)
  .filter(([key]) => /^spacing-\d/.test(key))
  .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]));

/** border-* width tokens from sizes.spacing */
const borderWidthTokens = Object.entries(sizes.spacing)
  .filter(([key]) => /^border-[0-9]?[xsmldXSMLD]/.test(key))
  .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]));

/** borderRadius tokens from sizes.borderRadius */
const radiusTokens = Object.entries(sizes.borderRadius).sort(
  (a, b) => parseFloat(a[1]) - parseFloat(b[1])
);

/** All remaining keys in sizes.spacing (not spacing-* or border-*) */
const otherSpacingTokens = Object.entries(sizes.spacing)
  .filter(
    ([key]) =>
      !/^spacing-\d/.test(key) && !/^border-[0-9]?[xsmldXSMLD]/.test(key)
  )
  .sort((a, b) => a[0].localeCompare(b[0]));

// ─── Figma shadow tokens ─────────────────────────────────────────────────────
const shadowTokens = Object.entries(figmaShadows).map(([key, value]) => ({
  label: key,
  value,
}));

// ─── Figma blur tokens ──────────────────────────────────────────────────────
const blurTokens = Object.entries(figmaBlurs).map(([key, value]) => ({
  label: key,
  value,
}));

// ─── Opacity tokens ─────────────────────────────────────────────────────────
const opacityTokens = Object.entries(sizes.opacity || {}).sort(
  (a, b) => parseFloat(b[1]) - parseFloat(a[1])
);

// ─── HARDCODED tokens (not in Figma / not in sizes.js) ───────────────────────
// Tailwind boxShadow, z-index и высоты компонентов — не Figma-токены.
// Хранятся здесь. При изменении tailwind.config.js → обновить tailwindBoxShadows ниже.

/** Custom box shadows from tailwind.config.js → boxShadow
 * Редактировать: tailwind.config.js → boxShadow (и синхронизировать здесь)
 */
const tailwindBoxShadows = [
  {
    label: 'soft',
    value:
      '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
    desc: 'shadow-soft — мягкая тень',
  },
  {
    label: 'medium',
    value:
      '0 4px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(0,0,0,0.04)',
    desc: 'shadow-medium',
  },
  {
    label: 'large',
    value:
      '0 10px 40px -10px rgba(0,0,0,0.15), 0 2px 10px -2px rgba(0,0,0,0.05)',
    desc: 'shadow-large',
  },
  {
    label: 'card',
    value: '0 1.6px 6.401px 0 rgba(38,54,97,0.15)',
    desc: 'shadow-card — карточки',
  },
  {
    label: 'card-dragging',
    value: '0 1.6px 16.401px 0 rgba(38,54,97,0.25)',
    desc: 'shadow-card-dragging — перетаскивание',
  },
  {
    label: 'effects-panel',
    value:
      '0px 4px 4px -4px rgba(4, 4, 5, 0.06), 0px 16px 32px -4px rgba(4, 4, 5, 0.08)',
    desc: 'shadow-effects-panel — панель эффектов',
  },
  {
    label: 'fab',
    value: '0 4px 4px 0 rgba(0,0,0,0.25)',
    desc: 'shadow-fab — кнопка FAB',
  },
  {
    label: 'top-nav',
    value: '0 0 2px 0 rgba(0,0,0,0.12), 0 2px 5px 0 rgba(0,0,0,0.08)',
    desc: 'shadow-top-nav — верхняя навигация',
  },
  {
    label: 'modal',
    value: '0 16px 32px -8px rgba(4,4,5,0.08)',
    desc: 'shadow-modal — модальные окна',
  },
];

const zIndexTokens = [
  { name: 'base', value: 0, desc: 'Обычные элементы' },
  { name: 'dropdown', value: 100, desc: 'Dropdown меню' },
  { name: 'sticky', value: 200, desc: 'Sticky заголовки' },
  { name: 'sidebar', value: 500, desc: 'Боковые панели' },
  { name: 'navigation', value: 900, desc: 'Навигация' },
  { name: 'bottom-nav', value: 1200, desc: 'BottomNavigationMenu (board)' },
  { name: 'modal', value: 1300, desc: 'Модальные окна (default)' },
  { name: 'toast', value: 9999, desc: 'Уведомления (toasts)' },
];

const componentHeights = [
  { name: 'Button XS', height: 24 },
  { name: 'Button SM / Input SM', height: 32 },
  { name: 'Button MD / Input MD', height: 40 },
  { name: 'Button LG', height: 48 },
  { name: 'Button XL', height: 56 },
  { name: 'IconButton default', height: 32 },
  { name: 'Table row', height: 72 },
  { name: 'Tabs bar', height: 44 },
];

const HARDCODED_FILE = 'src/stories/design-system/Spacing.stories.tsx';

// ─── Main component ───────────────────────────────────────────────────────────

function SpacingPage() {
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
        Отступы, скругления и тени
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 8,
        }}
      >
        Данные из <code>tokens/sizes.js</code>. Запусти{' '}
        <code>npm run update-tokens</code> — страница обновится.
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 40 }}>
        Тени, z-index и высоты компонентов — не Figma-токены, хранятся как
        хардкод в <code>src/stories/design-system/Spacing.stories.tsx</code>.
        Каждая секция показывает свой источник.
      </p>

      {/* ── Spacing (token) ── */}
      <Section
        title={`Spacing — шкала отступов (${spacingTokens.length} токенов)`}
        source={{ type: 'token', files: 'tokens/sizes.js' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {spacingTokens.map(([name, value]) => {
            const px = parseFloat(value);
            return (
              <div
                key={name}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div
                  style={{
                    width: 180,
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
                    }}
                  >
                    {name}
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
                    height: 20,
                    width: Math.max(px, 1),
                    maxWidth: 400,
                    background: 'var(--color-accent)',
                    borderRadius: 2,
                    opacity: 0.8,
                    flexShrink: 0,
                  }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <CopyChip text={`p-${name}`} />
                  <CopyChip text={`gap-${name}`} />
                  <CopyChip text={`m-${name}`} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Border widths (token) ── */}
      <Section
        title={`Border widths — толщины границ (${borderWidthTokens.length} токенов)`}
        source={{ type: 'token', files: 'tokens/sizes.js' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {borderWidthTokens.map(([name, value]) => {
            const px = parseFloat(value);
            return (
              <div
                key={name}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div
                  style={{
                    width: 180,
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
                    }}
                  >
                    {name}
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
                    height: 20,
                    width: Math.max(px * 8, 4),
                    background: 'var(--color-accent)',
                    borderRadius: 2,
                    opacity: 0.8,
                    flexShrink: 0,
                  }}
                />
                <CopyChip text={`border-${name}`} />
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Border Radius (token) ── */}
      <Section
        title={`Border Radius — скругления (${radiusTokens.length} токенов)`}
        source={{ type: 'token', files: 'tokens/sizes.js' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {radiusTokens.map(([name, value]) => {
            const px = Math.min(parseFloat(value), 48);
            const size = Math.max(48, Math.min(80, 48 + px * 0.4));
            return (
              <div
                key={name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: size,
                    height: size,
                    borderRadius: parseFloat(value) >= 1000 ? '50%' : value,
                    background: 'var(--color-accent)',
                    opacity: 0.85,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    maxWidth: 80,
                    wordBreak: 'break-all',
                  }}
                >
                  rounded-{name}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                  }}
                >
                  {value}
                </span>
                <CopyChip text={`rounded-${name}`} />
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Figma Shadows (token) ── */}
      <Section
        title={`Тени из Figma (${shadowTokens.length} токенов)`}
        source={{ type: 'token', files: 'tokens/shadows.js' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {shadowTokens.map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 160,
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 80,
                  borderRadius: 12,
                  background: 'var(--surface-medium, #f5f5f5)',
                  boxShadow: value,
                  border: '1px solid var(--border-light, #eee)',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                shadow-{label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  maxWidth: 160,
                }}
              >
                {value}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                  marginTop: 4,
                }}
              >
                <CopyChip text={`shadow-${label}`} />
                <CopyChip text={`--shadow-${label}`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Figma Blurs (token) ── */}
      <Section
        title={`Блюры из Figma (${blurTokens.length} токенов)`}
        source={{ type: 'token', files: 'tokens/blurs.js' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {blurTokens.map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 160,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 160,
                  height: 80,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--border-light, #eee)',
                }}
              >
                {/* Background pattern to visualize blur */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-linear-gradient(45deg, var(--color-accent, #7863f6) 0px, var(--color-accent, #7863f6) 4px, transparent 4px, transparent 12px)',
                    opacity: 0.6,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backdropFilter: `blur(${value})`,
                    WebkitBackdropFilter: `blur(${value})`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                backdrop-blur-{label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                }}
              >
                {value}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                  marginTop: 4,
                }}
              >
                <CopyChip text={`backdrop-blur-${label}`} />
                <CopyChip text={`--blur-${label}`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Opacity (token) ── */}
      {opacityTokens.length > 0 && (
        <Section
          title={`Opacity (${opacityTokens.length} токенов)`}
          source={{ type: 'token', files: 'tokens/sizes.js' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opacityTokens.map(([name, value]) => (
              <div
                key={name}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div
                  style={{
                    width: 180,
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
                    }}
                  >
                    {name}
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
                    height: 32,
                    width: 120,
                    background: 'var(--color-accent, #7863f6)',
                    borderRadius: 6,
                    opacity: parseFloat(value),
                    flexShrink: 0,
                  }}
                />
                <CopyChip text={`opacity-${name}`} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Tailwind boxShadow (HARDCODED from tailwind.config.js) ── */}
      <Section
        title="Тени Tailwind (tailwind.config.js → boxShadow)"
        source={{
          type: 'hardcoded',
          editIn:
            'tailwind.config.js → boxShadow (и синхронизировать: Spacing.stories.tsx → tailwindBoxShadows)',
          note: 'Классы: shadow-card, shadow-fab, shadow-modal, shadow-effects-panel...',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {tailwindBoxShadows.map(({ label, value, desc }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 180,
              }}
            >
              <div
                style={{
                  width: 180,
                  height: 80,
                  borderRadius: 12,
                  background: 'var(--surface-medium, #f5f5f5)',
                  boxShadow: value,
                  border: '1px solid var(--border-light, #eee)',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                shadow-{label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Z-index (HARDCODED) ── */}
      <Section
        title="Z-index шкала"
        source={{
          type: 'hardcoded',
          editIn: `${HARDCODED_FILE} → zIndexTokens`,
          note: 'Z-index не является Figma-токеном',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 480,
          }}
        >
          {zIndexTokens.map(({ name, value, desc }) => (
            <div
              key={name}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 80px 1fr',
                alignItems: 'center',
                gap: 12,
                padding: '6px 0',
                borderBottom: '1px solid var(--border-light, #eee)',
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
                {name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: 'var(--color-accent)',
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Component heights (HARDCODED) ── */}
      <Section
        title="Высоты компонентов"
        source={{
          type: 'hardcoded',
          editIn: `${HARDCODED_FILE} → componentHeights`,
          note: 'Компонентные размеры не являются Figma-токенами',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: 600,
          }}
        >
          {componentHeights.map(({ name, height }) => (
            <div
              key={name}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div
                style={{
                  width: 210,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  flexShrink: 0,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  width: 48,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  flexShrink: 0,
                }}
              >
                {height}px
              </div>
              <div
                style={{
                  height,
                  width: Math.min(height * 4, 300),
                  background: 'var(--color-accent)',
                  borderRadius: 4,
                  opacity: 0.6,
                  flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Other tokens reference (token) ── */}
      {otherSpacingTokens.length > 0 && (
        <Section
          title={`Остальные токены sizes.spacing (${otherSpacingTokens.length})`}
          source={{ type: 'token', files: 'tokens/sizes.js' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 8,
            }}
          >
            {otherSpacingTokens.map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '5px 10px',
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
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── Story config ─────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Spacing & Sizes',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: { toc: true },
  },
};

export default meta;
type Story = StoryObj;

export const AllSizes: Story = {
  name: 'Все размеры',
  render: () => <SpacingPage />,
};
