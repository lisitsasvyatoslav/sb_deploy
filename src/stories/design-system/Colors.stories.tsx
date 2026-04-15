/**
 * Design System — Colors
 *
 * ИСТОЧНИКИ (автоматические):
 *   - tokens/tailwind-theme.js   — все Figma-семантические группы (CSS vars, ~26 групп)
 *   - tokens/light-theme.js      — hex-значения для light-сплита
 *   - tokens/dark-theme.js       — hex-значения для dark-сплита
 *   - tokens/colors.js           — примитивные палитры (solid + alpha)
 *
 * ИСТОЧНИКИ (хардкод — имена переменных/цвета хранятся в этом файле):
 *   - MANUAL_GROUPS              — имена CSS-переменных из tokens/manual-overrides.css
 *   - CUSTOM_HEX_GROUPS          — хардкодные hex-цвета из tailwind.config.js
 *   - TAILWIND_ALIASES           — псевдонимы palette из tailwind.config.js
 *
 * Запусти `npm run update-tokens` — Figma-секции обновятся автоматически.
 * При изменении tailwind.config.js — обнови CUSTOM_HEX_GROUPS / TAILWIND_ALIASES здесь.
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useEffect, useState } from 'react';
import { SourceBadge, type Source, useCopyToClipboard } from './_helpers';

/* eslint-disable @typescript-eslint/no-require-imports */
const lightTheme = require('../../../tokens/light-theme') as Record<
  string,
  Record<string, string>
>;
const darkTheme = require('../../../tokens/dark-theme') as Record<
  string,
  Record<string, string>
>;
const primitives = require('../../../tokens/colors') as Record<
  string,
  Record<string, string>
>;
const tailwindTheme = require('../../../tokens/tailwind-theme') as {
  colors: Record<string, Record<string, string>>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useLiveCssVar(cssVar: string): string {
  const [value, setValue] = useState('');
  useEffect(() => {
    const update = () =>
      setValue(
        getComputedStyle(document.documentElement)
          .getPropertyValue(cssVar)
          .trim()
      );
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [cssVar]);
  return value;
}

function matches(query: string, ...terms: string[]): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return terms.some((t) => t.toLowerCase().includes(q));
}

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

// ─── Swatch components ────────────────────────────────────────────────────────

/** Semantic swatch — reads live CSS var + shows light/dark split bar */
function ColorSwatch({
  group,
  tokenKey,
  lightValue,
  darkValue,
}: {
  group: string;
  tokenKey: string;
  lightValue: string;
  darkValue: string;
}) {
  const cssVar = `--${group}-${tokenKey}`;
  const liveValue = useLiveCssVar(cssVar);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minWidth: 100,
        maxWidth: 120,
      }}
    >
      <div
        title={`Live: ${liveValue || 'no CSS var'}`}
        style={{
          height: 40,
          borderRadius: 6,
          background: liveValue || lightValue || '#ccc',
          border: '1px solid var(--border-light, #eee)',
        }}
      />
      {(lightValue || darkValue) && (
        <div
          style={{
            display: 'flex',
            height: 8,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{ flex: 1, background: lightValue || '#fff' }}
            title={`Light: ${lightValue}`}
          />
          <div
            style={{ flex: 1, background: darkValue || lightValue || '#000' }}
            title={`Dark: ${darkValue}`}
          />
        </div>
      )}
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          wordBreak: 'break-all',
        }}
      >
        {tokenKey}
      </span>
      <span
        style={{
          fontSize: 9,
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          lineHeight: 1.2,
          wordBreak: 'break-all',
        }}
      >
        {cssVar}
      </span>
      {liveValue && (
        <span
          style={{
            fontSize: 9,
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
          }}
        >
          {liveValue.toUpperCase()}
        </span>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          marginTop: 4,
          overflow: 'hidden',
        }}
      >
        <CopyChip text={`bg-${group}-${tokenKey}`} />
        <CopyChip text={`text-${group}-${tokenKey}`} />
        <CopyChip text={`border-${group}-${tokenKey}`} />
        <CopyChip text={`--${group}-${tokenKey}`} />
      </div>
    </div>
  );
}

/** Manual CSS var swatch — reads live value by var name */
function CssVarSwatch({ cssVar, label }: { cssVar: string; label: string }) {
  const liveValue = useLiveCssVar(cssVar);
  if (!liveValue) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minWidth: 100,
        maxWidth: 120,
      }}
    >
      <div
        style={{
          height: 40,
          borderRadius: 6,
          background: liveValue.includes('gradient')
            ? liveValue
            : `var(${cssVar})`,
          border: '1px solid var(--border-light, #eee)',
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 9,
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          lineHeight: 1.2,
          wordBreak: 'break-all',
        }}
      >
        {cssVar}
      </span>
      <span
        style={{
          fontSize: 9,
          color: 'var(--text-secondary)',
          fontFamily: 'monospace',
        }}
      >
        {liveValue.includes('gradient') ? 'gradient' : liveValue.toUpperCase()}
      </span>
      <div style={{ marginTop: 4, overflow: 'hidden' }}>
        <CopyChip text={cssVar} />
      </div>
    </div>
  );
}

/** Static hex swatch — no CSS var, fixed value */
function HexSwatch({
  name,
  value,
  twClass,
}: {
  name: string;
  value: string;
  twClass?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minWidth: 100,
        maxWidth: 120,
      }}
    >
      <div
        style={{
          height: 40,
          borderRadius: 6,
          background: value,
          border: '1px solid var(--border-light, #eee)',
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          wordBreak: 'break-all',
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontSize: 9,
          color: 'var(--text-secondary)',
          fontFamily: 'monospace',
        }}
      >
        {value.toUpperCase()}
      </span>
      {twClass && (
        <div style={{ marginTop: 2, overflow: 'hidden' }}>
          <CopyChip text={twClass} />
        </div>
      )}
    </div>
  );
}

/** Primitive swatch — solid shade */
function PrimitiveSwatch({
  name,
  value,
  paletteName,
}: {
  name: string;
  value: string;
  paletteName: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minWidth: 64,
        maxWidth: 96,
      }}
    >
      <div
        style={{
          height: 28,
          borderRadius: 4,
          background: value,
          border: '1px solid var(--border-light, #eee)',
        }}
      />
      <span
        style={{
          fontSize: 9,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {name}
      </span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <CopyChip text={`bg-${paletteName}-${name}`} />
        <CopyChip text={`text-${paletteName}-${name}`} />
      </div>
    </div>
  );
}

/** Alpha swatch — shown with checkered background to reveal transparency */
function AlphaSwatch({
  name,
  value,
  paletteName,
}: {
  name: string;
  value: string;
  paletteName: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minWidth: 64,
        maxWidth: 96,
      }}
    >
      <div
        style={{
          height: 28,
          backgroundImage: [
            'linear-gradient(45deg, #bbb 25%, transparent 25%)',
            'linear-gradient(-45deg, #bbb 25%, transparent 25%)',
            'linear-gradient(45deg, transparent 75%, #bbb 75%)',
            'linear-gradient(-45deg, transparent 75%, #bbb 75%)',
          ].join(', '),
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: value }} />
      </div>
      <span
        style={{
          fontSize: 9,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {name}
      </span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <CopyChip text={`bg-${paletteName}-${name}`} />
      </div>
    </div>
  );
}

// ─── Section wrappers ─────────────────────────────────────────────────────────

function BigSectionHeader({
  title,
  source,
  note,
}: {
  title: string;
  source: Source;
  note?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 6,
          paddingBottom: 8,
          borderBottom: '2px solid var(--color-accent)',
        }}
      >
        {title}
      </h2>
      <SourceBadge source={source} />
      {note && (
        <p
          style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 0 }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function SubSection({
  title,
  children,
  count,
}: {
  title: string;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
          paddingBottom: 4,
          borderBottom: '1px solid var(--border-light)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {title}
        {count !== undefined && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 400,
              color: 'var(--text-muted)',
              textTransform: 'none',
              letterSpacing: 0,
            }}
          >
            {count} vars · Tailwind: bg-{title}-* / text-{title}-*
          </span>
        )}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Hardcoded: Manual CSS vars ───────────────────────────────────────────────
// Имена переменных — хардкод здесь. Значения — runtime из tokens/manual-overrides.css.
// Редактировать: src/stories/design-system/Colors.stories.tsx → MANUAL_GROUPS

const MANUAL_GROUPS: Array<{ label: string; vars: string[] }> = [
  {
    label: 'Фоны',
    vars: [
      '--bg-base',
      '--bg-card',
      '--bg-hover',
      '--bg-muted',
      '--bg-secondary',
      '--bg-auth-page',
      '--bg-dots-color',
    ],
  },
  {
    label: 'Поверхности',
    vars: ['--surface-low', '--surface-medium', '--surface-white-low'],
  },
  {
    label: 'Текст',
    vars: ['--text-primary', '--text-secondary', '--text-muted', '--text-base'],
  },
  {
    label: 'Границы',
    vars: ['--border-light', '--border-medium', '--border-card'],
  },
  {
    label: 'Акцент / Статус',
    vars: [
      '--color-accent',
      '--color-success',
      '--color-warning',
      '--color-negative',
      '--color-error',
      '--accent-hover',
      '--accent-active',
    ],
  },
  {
    label: 'Switch',
    vars: [
      '--switch-bg-on',
      '--switch-bg-off',
      '--switch-thumb',
      '--switch-dot',
    ],
  },
  {
    label: 'Чат / Sidebar',
    vars: [
      '--chat-input-bg',
      '--chat-bubble-bg',
      '--chat-bubble-text',
      '--chat-placeholder-hover',
      '--sidebar-bg',
    ],
  },
];

// ─── Hardcoded: Custom Tailwind colors from tailwind.config.js ────────────────
// Эти цвета захардкожены в tailwind.config.js → theme.extend.colors.
// Не генерируются из Figma. При изменении tailwind.config.js — обновить здесь.
// Редактировать: src/stories/design-system/Colors.stories.tsx → CUSTOM_HEX_GROUPS

const CUSTOM_HEX_GROUPS: Array<{
  label: string;
  twPrefix: string;
  colors: Array<{ name: string; value: string }>;
}> = [
  {
    label: 'portfolio',
    twPrefix: 'bg-portfolio-',
    colors: [
      { name: 'vtbr', value: '#8B5CF6' },
      { name: 'lqdt', value: '#3B82F6' },
      { name: 'gold', value: '#10B981' },
      { name: 'sber', value: '#F59E0B' },
    ],
  },
  {
    label: 'chart',
    twPrefix: 'bg-chart-',
    colors: [
      { name: 'gradient.start', value: '#7B4BDF' },
      { name: 'gradient.end', value: '#7B4BDF' },
      { name: 'stroke', value: '#7B4BDF' },
      { name: 'grid', value: '#F0F0F0' },
      { name: 'text', value: '#121212' },
    ],
  },
  {
    label: 'icon',
    twPrefix: 'bg-icon-',
    colors: [
      { name: 'note', value: '#1C1C1F' },
      { name: 'document', value: '#1C5C3C' },
      { name: 'link', value: '#005B94' },
    ],
  },
  {
    label: 'tag',
    twPrefix: 'bg-tag-',
    colors: [{ name: 'bg', value: '#D7D7D7' }],
  },
  {
    label: 'purple (кастомные overrides)',
    twPrefix: 'bg-purple-',
    colors: [{ name: 'light', value: '#BDA5F2' }],
  },
  {
    label: 'gray (кастомные оттенки)',
    twPrefix: 'bg-',
    colors: [
      { name: 'gray-light', value: '#EBEBF2' },
      { name: 'gray-medium', value: '#A4A4B2' },
      { name: 'gray-dark', value: '#5B616D' },
      { name: 'gray-darker', value: '#6E6E6F' },
      { name: 'gray-text', value: '#2D3339' },
    ],
  },
  {
    label: 'семантика (кастомные)',
    twPrefix: '',
    colors: [
      { name: 'text-heading', value: '#242429' },
      { name: 'text-muted', value: '#8A8A90' },
      { name: 'accent-purple', value: '#8E7CFB' },
      { name: 'success-brand', value: '#19B153' },
    ],
  },
];

// ─── Hardcoded: Aliases from tailwind.config.js ───────────────────────────────

const TAILWIND_ALIASES: Array<{
  alias: string;
  pointsTo: string;
  example: string;
}> = [
  {
    alias: 'brand',
    pointsTo: 'blue (из tokens/colors.js)',
    example: 'bg-brand-500, text-brand-700',
  },
  {
    alias: 'primary',
    pointsTo: 'blue (из tokens/colors.js)',
    example: 'bg-primary-100, ring-primary-300',
  },
  {
    alias: 'info',
    pointsTo: 'cyan (из tokens/colors.js)',
    example: 'bg-info-300, text-info-600',
  },
  {
    alias: 'success',
    pointsTo: 'green (из tokens/colors.js)',
    example: 'bg-success-500',
  },
  {
    alias: 'warning',
    pointsTo: 'orange (из tokens/colors.js)',
    example: 'bg-warning-400',
  },
  {
    alias: 'danger',
    pointsTo: 'red (из tokens/colors.js)',
    example: 'bg-danger-600, border-danger-400',
  },
  {
    alias: 'error',
    pointsTo: 'red (из tokens/colors.js)',
    example: 'bg-error-500, text-error-700',
  },
];

// ─── Primitive key categories ─────────────────────────────────────────────────

const SOLID_KEYS = new Set([
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
  '1000',
  '000',
]);
const isAlphaKey = (k: string) => /^a\d/.test(k) || /_a\d/.test(k);

// ─── Main page ────────────────────────────────────────────────────────────────

function ColorsPage() {
  const [query, setQuery] = useState('');

  // Count totals for info
  const figmaGroupCount = Object.keys(tailwindTheme.colors).filter(
    (k) => k !== '' && k !== 'mode'
  ).length;
  const figmaVarCount = Object.values(tailwindTheme.colors).reduce(
    (sum, group) => sum + Object.keys(group).length,
    0
  );

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}
      >
        Цветовая система — полная карта
      </h1>
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          marginBottom: 4,
        }}
      >
        Все цвета, доступные разработчику через Tailwind-классы. Переключи тему
        ☀/☾ в toolbar.
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Полоска под свотчем: левая&nbsp;=&nbsp;light, правая&nbsp;=&nbsp;dark.
        Большой квадрат&nbsp;=&nbsp;текущая тема.
      </p>

      {/* ── Поиск ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--bg-base, #fff)',
          padding: '10px 0 12px',
          marginBottom: 24,
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <input
          type="search"
          placeholder="Поиск: bg-surface-s3, --outline-danger, outline-danger, #4B3BF5, portfolio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 560,
            padding: '7px 12px',
            fontSize: 13,
            border: '1px solid var(--border-medium, #ccc)',
            borderRadius: 8,
            background: 'var(--surface-low, #fff)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '4px 8px',
            }}
          >
            ✕ сбросить
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          СЕКЦИЯ 1: Figma семантические токены (из tailwindTheme)
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 56 }}>
        <BigSectionHeader
          title={`Семантические Figma-токены (${figmaGroupCount} групп, ${figmaVarCount} переменных)`}
          source={{
            type: 'token',
            files: [
              'tokens/tailwind-theme.js',
              'tokens/light-theme.js',
              'tokens/dark-theme.js',
            ],
          }}
          note="Автогенерация из Figma. Реагируют на тему. Класс пример: bg-surface-s3, text-outline-danger_high_em, bg-mind-brand"
        />

        {Object.entries(tailwindTheme.colors)
          .filter(([groupKey]) => groupKey !== '' && groupKey !== 'mode')
          .map(([groupKey, tokens]) => {
            const lightGroup = lightTheme[groupKey];
            const darkGroup = darkTheme[groupKey];
            const visibleTokens = Object.entries(tokens).filter(([key]) =>
              matches(
                query,
                groupKey,
                key,
                `--${groupKey}-${key}`,
                `bg-${groupKey}-${key}`,
                `text-${groupKey}-${key}`,
                `border-${groupKey}-${key}`,
                `ring-${groupKey}-${key}`
              )
            );
            if (query && visibleTokens.length === 0) return null;
            return (
              <SubSection
                key={groupKey}
                title={groupKey}
                count={Object.keys(tokens).length}
              >
                {visibleTokens.map(([key]) => (
                  <ColorSwatch
                    key={key}
                    group={groupKey}
                    tokenKey={key}
                    lightValue={lightGroup?.[key] ?? ''}
                    darkValue={darkGroup?.[key] ?? ''}
                  />
                ))}
              </SubSection>
            );
          })}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          СЕКЦИЯ 2: Ручные CSS-переменные (manual-overrides.css)
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 56 }}>
        <BigSectionHeader
          title="Ручные CSS-переменные (manual-overrides.css)"
          source={{
            type: 'mixed',
            tokenFiles: 'tokens/manual-overrides.css',
            hardcodedIn: 'Colors.stories.tsx → MANUAL_GROUPS',
            note: 'Значения из CSS runtime · имена переменных — хардкод в этом файле',
          }}
          note="Классы: bg-border-light, text-text-primary, bg-surface-low..."
        />

        {MANUAL_GROUPS.map(({ label, vars }) => {
          const visibleVars = vars.filter((cssVar) =>
            matches(query, cssVar, cssVar.replace('--', ''), label)
          );
          if (query && visibleVars.length === 0) return null;
          return (
            <SubSection key={label} title={label}>
              {visibleVars.map((cssVar) => (
                <CssVarSwatch
                  key={cssVar}
                  cssVar={cssVar}
                  label={cssVar.replace('--', '')}
                />
              ))}
            </SubSection>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          СЕКЦИЯ 3: Кастомные цвета проекта (хардкод в tailwind.config.js)
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 56 }}>
        <BigSectionHeader
          title="Кастомные цвета проекта (tailwind.config.js)"
          source={{
            type: 'hardcoded',
            editIn: 'tailwind.config.js → theme.extend.colors',
            note: 'Не из Figma. Статичные hex — не меняются при смене темы',
          }}
          note="Примеры классов: bg-portfolio-vtbr, text-chart-text, bg-icon-note, text-accent-purple"
        />

        {CUSTOM_HEX_GROUPS.map(({ label, twPrefix, colors }) => {
          const visibleColors = colors.filter(({ name, value }) =>
            matches(query, name, value, twPrefix + name, label)
          );
          if (query && visibleColors.length === 0) return null;
          return (
            <SubSection key={label} title={label}>
              {visibleColors.map(({ name, value }) => (
                <HexSwatch
                  key={name}
                  name={name}
                  value={value}
                  twClass={twPrefix + name}
                />
              ))}
            </SubSection>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          СЕКЦИЯ 4: Псевдонимы (aliases)
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 56 }}>
        <BigSectionHeader
          title="Псевдонимы палитр (aliases)"
          source={{
            type: 'hardcoded',
            editIn:
              'tailwind.config.js → theme.extend.colors (aliases section)',
            note: 'Полные палитры — смотри Примитивные палитры ниже',
          }}
          note="Alias-группы дублируют Figma-палитры под удобными именами"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 8,
          }}
        >
          {TAILWIND_ALIASES.filter(({ alias, pointsTo, example }) =>
            matches(query, alias, pointsTo, example)
          ).map(({ alias, pointsTo, example }) => (
            <div
              key={alias}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr',
                gap: 12,
                padding: '8px 12px',
                background: 'var(--surface-medium, #f5f5f5)',
                borderRadius: 8,
                border: '1px solid var(--border-light, #eee)',
                alignItems: 'start',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                  }}
                >
                  {alias}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    marginBottom: 2,
                  }}
                >
                  → {pointsTo}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: 'var(--text-muted)',
                  }}
                >
                  {example}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          СЕКЦИЯ 5: Примитивные палитры (colors.js)
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <BigSectionHeader
          title="Примитивные палитры (tokens/colors.js)"
          source={{ type: 'token', files: 'tokens/colors.js' }}
          note="Статичные цвета. Solid-шейды + alpha-варианты (на шахматке — показывает прозрачность). Классы: bg-blue-500, bg-gray-a32, text-red-700..."
        />

        {Object.entries(primitives).map(([paletteName, shades]) => {
          const solidEntries = Object.entries(shades).filter(
            ([k, v]) =>
              SOLID_KEYS.has(k) &&
              matches(
                query,
                paletteName,
                k,
                v,
                `bg-${paletteName}-${k}`,
                `text-${paletteName}-${k}`
              )
          );
          const alphaEntries = Object.entries(shades).filter(
            ([k, v]) =>
              isAlphaKey(k) &&
              matches(query, paletteName, k, v, `bg-${paletteName}-${k}`)
          );
          if (!solidEntries.length && !alphaEntries.length) return null;

          return (
            <div key={paletteName} style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textTransform: 'capitalize',
                  marginBottom: 8,
                  paddingBottom: 4,
                  borderBottom: '1px solid var(--border-light)',
                  letterSpacing: '0.04em',
                }}
              >
                {paletteName}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    color: 'var(--text-muted)',
                    marginLeft: 8,
                    textTransform: 'none',
                  }}
                >
                  Tailwind: bg-{paletteName}-* / text-{paletteName}-*
                </span>
              </h3>

              {solidEntries.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginBottom: alphaEntries.length ? 8 : 0,
                  }}
                >
                  {solidEntries.map(([shade, value]) => (
                    <PrimitiveSwatch
                      key={shade}
                      name={shade}
                      value={value}
                      paletteName={paletteName}
                    />
                  ))}
                </div>
              )}

              {alphaEntries.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'var(--text-muted)',
                      marginBottom: 4,
                      fontStyle: 'italic',
                    }}
                  >
                    alpha-варианты (прозрачные):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {alphaEntries.map(([shade, value]) => (
                      <AlphaSwatch
                        key={shade}
                        name={shade}
                        value={value}
                        paletteName={paletteName}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Story config ─────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Colors',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export default meta;

export const AllColors: StoryObj = {
  name: 'Все цвета',
  render: () => <ColorsPage />,
};
