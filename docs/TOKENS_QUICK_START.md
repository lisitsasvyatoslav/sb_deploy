# Design Tokens - Quick Start

## Одна команда для обновления токенов

```bash
cd frontend
npm run update-tokens
```

Эта команда:
1. Получает Variables из Figma API (все локальные коллекции)
2. Резолвит алиасы переменных (VARIABLE_ALIAS)
3. Генерирует раздельные файлы в `tokens/`
4. Tailwind автоматически подхватывает изменения

---

## Что создаётся

```
frontend/
├── tokens.config.js          # Конфигурация: какие коллекции импортировать
└── tokens/
    ├── colors.js              # Цветовые палитры (Primitives + Color Type)
    ├── typography.js          # Шрифты, размеры (desktop/mobile), веса
    ├── sizes.js               # Spacing + border radius
    ├── light-theme.js         # Семантические токены (Light): surface, text, outline
    ├── dark-theme.js          # Семантические токены (Dark): surface, text, outline
    └── index.js               # Re-export для tailwind.config.js
```

---

## Конфигурация (`tokens.config.js`)

Управляет тем, какие Figma коллекции и modes импортируются:

```js
module.exports = {
  collections: {
    '🍄 Primitives': { modes: ['default'], output: 'colors' },
    '🌈 Theme':      { modes: ['☀️ Light', '🌒 Dark'], output: 'themes' },
    '🎨 Color Type': { modes: ['default'], output: 'colors' },
    '🆎 Font':       { modes: ['default'], output: 'typography' },
    '🖍️ Typography': { modes: ['Typeface_1', 'Typeface_1_mobile'], output: 'typography' },
    '📐 Spacing + Sizing': { modes: ['default'], output: 'sizes' },
    '🟢 Radius':     { modes: ['default'], output: 'sizes' },
  },
  includeRemote: false, // true — для импорта внешних библиотек
};
```

### Как добавить новую коллекцию

1. `npm run update-tokens -- --list` — покажет все доступные коллекции в Figma
2. Добавьте в `tokens.config.js` → `collections`
3. `npm run update-tokens`

---

## Использование в коде

### Цвета
```jsx
<div className="bg-brand-500 text-gray-900">       {/* Figma brand palette */}
<div className="bg-blue-500">                       {/* = brand-500 (alias) */}
<div className="text-success-600 bg-danger-50">     {/* Semantic palettes */}
<div className="bg-black-40 text-white-80">         {/* Alpha variants */}
```

### Semantic Theme Tokens
```jsx
<div className="bg-theme-surface-s0 text-theme-text-high_em">
<div className="border-theme-outline-med_em">
```

### Typography
```jsx
<h1 className="text-heading_1 font-bold">
<p className="text-body_1 font-normal">
<span className="text-caption_1">
```

### Spacing (Figma токены с именованными ключами)
```jsx
{/* Стандартная Tailwind шкала работает как обычно */}
<div className="h-8 w-10 p-4 gap-2">       {/* 32px, 40px, 16px, 8px */}

{/* Figma токены с именованными ключами */}
<div className="h-xs w-md p-sm gap-xxs">    {/* 4px, 8px, 6px, 2px */}
<div className="h-xl w-2xl gap-3xl">        {/* 12px, 14px, 16px */}
```

---

## Environment Variables (.env)

```bash
FIGMA_ACCESS_TOKEN=figd_xxx...
FIGMA_FILE_KEY=NiGIiIpK82v6Ky1EAAR9jY
```

---

## Workflow

```
Дизайнер обновляет Variables в Figma
         ↓
npm run update-tokens
         ↓
git commit -m "Update design tokens"
         ↓
Токены доступны всей команде
```

---

## Текущие токены

- **879 переменных** импортировано из 7 коллекций Figma
- **35 цветовых палитр** (brand, gray, dark, info, success, warning, danger, ...)
- **20 desktop + 20 mobile** font sizes
- **32 spacing** значения
- **23 border radius** значения
- **9 групп** семантических токенов в каждой теме (surface, text, outline, ...)
