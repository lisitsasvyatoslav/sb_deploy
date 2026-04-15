#!/usr/bin/env node

/**
 * Generator of design tokens from Figma Variables API.
 *
 * Usage:
 *   npm run update-tokens              — update all tokens
 *   npm run update-tokens -- --list    — show available collections
 *
 * Configuration: tokens.config.js
 * Output: tokens/ (colors.js, typography.js, sizes.js, light-theme.js, dark-theme.js, index.js)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const eq = line.indexOf('=');
      if (eq > 0) {
        const key = line.slice(0, eq).trim();
        const val = line.slice(eq + 1).trim();
        if (key && val) process.env[key] = val;
      }
    });
}

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEYS = (process.env.FIGMA_FILE_KEY || 'NiGIiIpK82v6Ky1EAAR9jY')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);
const FIGMA_FILE_KEY = FIGMA_FILE_KEYS[0];
const TOKENS_DIR = path.join(__dirname, '..', 'tokens');
const CONFIG_PATH = path.join(__dirname, '..', 'tokens.config.js');

// ============================================================================
// FIGMA API
// ============================================================================

function figmaRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.figma.com',
        path: endpoint,
        headers: { 'X-Figma-Token': FIGMA_TOKEN },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) resolve(JSON.parse(data));
          else
            reject(
              new Error(`Figma API ${res.statusCode}: ${data.slice(0, 200)}`)
            );
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

/**
 * Convert a single Figma effect object to a CSS box-shadow value string.
 * Format: [inset] Xpx Ypx Blur Spread rgba(r,g,b,a)
 */
function effectToCssShadow(effect) {
  const { type, offset, radius, spread = 0, color } = effect;
  const inset = type === 'INNER_SHADOW' ? 'inset ' : '';
  const x = Math.round(offset.x);
  const y = Math.round(offset.y);
  const blur = Math.round(radius);
  const sp = Math.round(spread);
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 100) / 100;
  return `${inset}${x}px ${y}px ${blur}px ${sp}px rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Fetch Effect Styles (shadows + blurs) from Figma Styles + Nodes API.
 * Variables API does not include Effect Styles — they require separate endpoints.
 * Returns: { shadows: { 'shadow/200': { cssValue, ... } }, blurs: { 'blur/medium': { radius, type } } }
 */
async function fetchEffectStyles(fileKey) {
  const stylesData = await figmaRequest(`/v1/files/${fileKey}/styles`);
  const effectStyles = (stylesData.meta?.styles || []).filter(
    (s) => s.style_type === 'EFFECT'
  );

  if (!effectStyles.length) {
    console.log('   ℹ️  No effect styles found in Figma file');
    return { shadows: {}, blurs: {} };
  }

  const nodeIds = effectStyles.map((s) => s.node_id).join(',');
  const nodesData = await figmaRequest(
    `/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeIds)}`
  );

  const shadows = {};
  const blurs = {};

  for (const style of effectStyles) {
    const nodeData = nodesData.nodes[style.node_id];
    if (!nodeData || !nodeData.document) continue;

    const effects = nodeData.document.effects;
    if (!effects || !effects.length) continue;

    const visibleEffects = effects.filter((e) => e.visible !== false);
    if (!visibleEffects.length) continue;

    const shadowEffects = visibleEffects.filter(
      (e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'
    );
    const blurEffects = visibleEffects.filter(
      (e) => e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR'
    );

    if (shadowEffects.length) {
      const layers = shadowEffects.map((e) => ({
        type: e.type,
        x: e.offset.x,
        y: e.offset.y,
        blur: e.radius,
        spread: e.spread || 0,
        color: e.color,
      }));
      const cssValue = shadowEffects
        .map((e) => effectToCssShadow(e))
        .join(', ');
      shadows[style.name] = {
        name: style.name,
        description: style.description || '',
        cssValue,
        layers,
      };
    }

    if (blurEffects.length) {
      // Take the first (main) blur effect — typically one per style
      const blur = blurEffects[0];
      blurs[style.name] = {
        name: style.name,
        description: style.description || '',
        radius: Math.round(blur.radius),
        type: blur.type,
      };
    }
  }

  return { shadows, blurs };
}

// ============================================================================
// UTILITIES
// ============================================================================

function rgbaToHex({ r, g, b, a }) {
  const to255 = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255);
  const hex = (c) => to255(c).toString(16).padStart(2, '0');
  if (a !== undefined && a < 0.995) {
    return `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`.toUpperCase();
  }
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/** Resolve value of variable for specific mode (recursively).
 *  fallbackModeId is used for child collections (e.g. Limex inherits from Finam)
 *  where variables store values keyed by parentModeId instead of the collection's own modeId. */
function resolveValueForMode(
  variable,
  modeId,
  allVariables,
  depth = 0,
  fallbackModeId = null
) {
  if (depth > 15) return null;
  let value = variable.valuesByMode[modeId];
  if (value === undefined && fallbackModeId) {
    value = variable.valuesByMode[fallbackModeId];
  }
  if (value === undefined) return null;

  if (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
    const target = allVariables[value.id];
    if (!target) {
      console.warn(
        `   ⚠️  Unresolved alias: ${variable.name} → ${value.id} (remote variable not in API response)`
      );
      return null;
    }
    // If alias leads to the same collection — take the same mode
    if (target.variableCollectionId === variable.variableCollectionId) {
      return resolveValueForMode(target, modeId, allVariables, depth + 1);
    }
    // If alias leads to another collection — take default (first) mode
    const targetModeId = Object.keys(target.valuesByMode)[0];
    return resolveValueForMode(target, targetModeId, allVariables, depth + 1);
  }
  return value;
}

/** Convert resolved value to JS format. */
function formatValue(value, resolvedType) {
  if (value === null || value === undefined) return null;
  if (resolvedType === 'COLOR' && typeof value === 'object' && 'r' in value) {
    return rgbaToHex(value);
  }
  return value;
}

/**
 * Collect all variables of collection for specified mode.
 * Returns: { 'Surface/s0': { value: '#FFF', type: 'COLOR', scopes: [...] }, ... }
 */
function collectVariablesForMode(
  collection,
  modeId,
  allVariables,
  fallbackModeId = null
) {
  const result = {};
  for (const varId of collection.variableIds) {
    const variable = allVariables[varId];
    if (!variable) continue;

    const resolved = resolveValueForMode(
      variable,
      modeId,
      allVariables,
      0,
      fallbackModeId
    );
    const formatted = formatValue(resolved, variable.resolvedType);
    if (formatted !== null) {
      result[variable.name] = {
        value: formatted,
        type: variable.resolvedType,
        scopes: variable.scopes || [],
      };
    }
  }
  return result;
}

// ============================================================================
// BUILD TOKENS BY CATEGORIES
// ============================================================================

/** Build colors.js from Color Base and other collections.
 *
 * Figma naming convention:
 *   RGB/Blue/Solid/50  → blue.50
 *   RGB/Blue/Alpha/A12 → blue.a12
 *   Black/Solid/1000   → black.1000
 *   Black/Alpha/A88    → black.a88
 *   Gray/Solid/50      → gray.50
 *   Gray/Alpha/950-092 → gray.950_092
 */
function buildColors(collectedData) {
  const colors = {};
  const annotations = {};

  for (const { flat } of collectedData) {
    for (const [name, data] of Object.entries(flat)) {
      if (data.type !== 'COLOR') continue;

      const parts = name.split('/');

      // Determine colorName and shade from Figma path
      let colorName;
      let shade;

      if (parts[0] === 'RGB' && parts.length >= 4) {
        // RGB/Blue/Solid/50 → colorName=blue, shade=50
        // RGB/Blue/Alpha/A12 → colorName=blue, shade=a12
        colorName = parts[1].toLowerCase().replace(/[^\w]/g, '');
        shade = parts[parts.length - 1]
          .toLowerCase()
          .replace(/[^\w-]/g, '')
          .replace(/-/g, '_');
      } else if (parts.length >= 2) {
        // Black/Solid/1000 → colorName=black, shade=1000
        // Black/Alpha/A88 → colorName=black, shade=a88
        // Gray/Alpha/950-092 → colorName=gray, shade=950_092
        // Grey (Из старого...)/100 → colorName=grey, shade=100
        colorName = parts[0]
          .toLowerCase()
          .replace(/\s*\(.*\)\s*/g, '')
          .replace(/[^\w]/g, '');
        if (parts.length === 2) {
          shade = parts[1]
            .toLowerCase()
            .replace(/[^\w-]/g, '')
            .replace(/-/g, '_');
        } else {
          // Skip middle "Solid"/"Alpha" segments, take last part as shade
          shade = parts[parts.length - 1]
            .toLowerCase()
            .replace(/[^\w-]/g, '')
            .replace(/-/g, '_');
        }
      } else {
        // Single-segment name — flat entry
        const key = parts[0].toLowerCase().replace(/[^\w]/g, '_');
        colors[key] = data.value;
        annotations[key] = name;
        continue;
      }

      if (!colorName || !shade) continue;

      if (!colors[colorName]) colors[colorName] = {};
      colors[colorName][shade] = data.value;
      if (!annotations[colorName]) annotations[colorName] = {};
      annotations[colorName][shade] = name;
    }
  }

  // Ensure black/white have DEFAULT so Tailwind `bg-white` / `text-black` work
  if (colors.black && !colors.black.DEFAULT) {
    colors.black.DEFAULT = '#000000';
  }
  if (colors.white && !colors.white.DEFAULT) {
    colors.white.DEFAULT = '#FFFFFF';
  }

  return { data: colors, annotations };
}

/** Map Figma STRING font-weight names to numeric CSS values. */
const FONT_WEIGHT_NAME_MAP = {
  thin: '100',
  hairline: '100',
  extralight: '200',
  ultralight: '200',
  light: '300',
  regular: '400',
  normal: '400',
  book: '400',
  medium: '500',
  semibold: '600',
  demibold: '600',
  bold: '700',
  extrabold: '800',
  ultrabold: '800',
  black: '900',
  heavy: '900',
};

/** Build typography.js from Font + Typography collections. */
function buildTypography(collectedData) {
  const fontFamily = {};
  const fontSizeDesktop = {};
  const fontSizeMobile = {};
  const fontWeight = {};
  const lineHeight = {};
  const letterSpacing = {};

  const annFamily = {};
  const annSizeDesktop = {};
  const annSizeMobile = {};
  const annWeight = {};
  const annLineHeight = {};
  const annLetterSpacing = {};

  for (const { flat, modeName } of collectedData) {
    const isMobile = modeName.toLowerCase().includes('mobile');
    const targetFontSize = isMobile ? fontSizeMobile : fontSizeDesktop;
    const targetAnnSize = isMobile ? annSizeMobile : annSizeDesktop;

    for (const [name, data] of Object.entries(flat)) {
      const lowerName = name.toLowerCase();
      const parts = name.split('/');
      const key = parts[parts.length - 1]
        .replace(/^[^\w]*\s*/u, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w-]/g, '');

      if (data.type === 'STRING') {
        if (
          lowerName.includes('family') ||
          data.scopes?.includes('FONT_FAMILY')
        ) {
          fontFamily[key] = data.value;
          annFamily[key] = name;
        } else if (
          lowerName.includes('weight') ||
          data.scopes?.includes('FONT_WEIGHT')
        ) {
          // STRING weight ("Regular", "SemiBold") → map to numeric
          const numericWeight =
            FONT_WEIGHT_NAME_MAP[
              data.value.toLowerCase().replace(/[\s_-]/g, '')
            ];
          if (numericWeight) {
            fontWeight[key] = numericWeight;
            annWeight[key] = name;
          }
        }
      }

      if (data.type === 'FLOAT') {
        if (
          lowerName.includes('weight') ||
          data.scopes?.includes('FONT_WEIGHT')
        ) {
          fontWeight[key] = String(Math.round(data.value));
          annWeight[key] = name;
        } else if (
          (lowerName.includes('line') && lowerName.includes('height')) ||
          data.scopes?.includes('LINE_HEIGHT')
        ) {
          lineHeight[key] = `${Math.round(data.value)}px`;
          annLineHeight[key] = name;
        } else if (
          (lowerName.includes('letter') && lowerName.includes('spacing')) ||
          data.scopes?.includes('LETTER_SPACING')
        ) {
          // Preserve decimals for letter-spacing (e.g. -0.2px)
          const lsVal = Math.round(data.value * 100) / 100;
          letterSpacing[key] = `${lsVal}px`;
          annLetterSpacing[key] = name;
        } else if (
          lowerName.includes('size') ||
          data.scopes?.includes('FONT_SIZE')
        ) {
          targetFontSize[key] = Math.round(data.value);
          targetAnnSize[key] = name;
        }
      }
    }
  }

  // Format fontSize in Tailwind format: { key: ['16px', { lineHeight: '24px' }] }
  const formatFontSize = (sizeMap) => {
    const result = {};
    for (const [key, size] of Object.entries(sizeMap)) {
      if (size > 0 && size < 300) {
        const lh = Math.round(size * 1.5);
        result[key] = [`${size}px`, { lineHeight: `${lh}px` }];
      }
    }
    return result;
  };

  const typography = { fontFamily };
  const annotations = { fontFamily: annFamily };

  const desktop = formatFontSize(fontSizeDesktop);
  const mobile = formatFontSize(fontSizeMobile);
  if (Object.keys(desktop).length || Object.keys(mobile).length) {
    typography.fontSize = {};
    annotations.fontSize = {};
    if (Object.keys(desktop).length) {
      typography.fontSize.desktop = desktop;
      annotations.fontSize.desktop = annSizeDesktop;
    }
    if (Object.keys(mobile).length) {
      typography.fontSize.mobile = mobile;
      annotations.fontSize.mobile = annSizeMobile;
    }
  }

  if (Object.keys(fontWeight).length) {
    typography.fontWeight = fontWeight;
    annotations.fontWeight = annWeight;
  }

  if (Object.keys(lineHeight).length) {
    typography.lineHeight = lineHeight;
    annotations.lineHeight = annLineHeight;
  }

  if (Object.keys(letterSpacing).length) {
    typography.letterSpacing = letterSpacing;
    annotations.letterSpacing = annLetterSpacing;
  }

  return { data: typography, annotations };
}

/** Build sizes.js from Spacing + Radius collections. */
function buildSizes(collectedData) {
  const spacing = {};
  const borderRadius = {};
  const opacity = {};
  const annSpacing = {};
  const annRadius = {};
  const annOpacity = {};

  for (const { flat } of collectedData) {
    for (const [name, data] of Object.entries(flat)) {
      if (data.type !== 'FLOAT') continue;

      const val = Math.round(data.value);
      const lowerName = name.toLowerCase();
      const isRadius =
        lowerName.includes('radius') || data.scopes?.includes('CORNER_RADIUS');
      const isOpacity =
        lowerName.includes('opacity') || data.scopes?.includes('OPACITY');

      const parts = name.split('/');
      const key = parts[parts.length - 1]
        .replace(/^[^\w]*\s*/u, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

      if (isOpacity) {
        // Opacity values from Figma are 0-100 (percent), normalize to 0-1 for CSS
        const normalized = Math.round(data.value) / 100;
        opacity[key] = String(normalized);
        annOpacity[key] = name;
      } else if (isRadius) {
        borderRadius[key] = `${val}px`;
        annRadius[key] = name;
      } else {
        // Prefix f- for numeric keys (conflict with Tailwind)
        const spacingKey = /^\d+$/.test(key) ? `f-${key}` : key;
        spacing[spacingKey] = `${val}px`;
        annSpacing[spacingKey] = name;
      }
    }
  }

  return {
    data: { spacing, borderRadius, opacity },
    annotations: {
      spacing: annSpacing,
      borderRadius: annRadius,
      opacity: annOpacity,
    },
  };
}

/**
 * Build icon-settings.js from Icon Settings collection.
 * Multi-mode: each mode (24/20/16/12) → { size: '24px', outline: '1.5px' }
 */
function buildIconSettings(collectedData) {
  const settings = {};
  const annotations = {};

  for (const { flat, modeName } of collectedData) {
    const modeKey = modeName.replace(/[^\w]/g, '');
    const modeSettings = {};
    const modeAnn = {};

    for (const [name, data] of Object.entries(flat)) {
      if (data.type !== 'FLOAT') continue;

      const parts = name.split('/');
      const key = parts[parts.length - 1]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w-]/g, '');

      modeSettings[key] = `${Math.round(data.value * 100) / 100}px`;
      modeAnn[key] = name;
    }

    if (Object.keys(modeSettings).length) {
      settings[modeKey] = modeSettings;
      annotations[modeKey] = modeAnn;
    }
  }

  return { data: settings, annotations };
}

/**
 * Sanitize a Figma path segment into a valid JS/CSS identifier fragment.
 * Removes all non-word characters (Cyrillic, spaces, parens, etc.).
 */
function sanitizeSegment(segment) {
  return segment.toLowerCase().replace(/[^\w]/g, '');
}

/**
 * Extract group and sub-parts from a Figma variable path.
 * If the first segment becomes empty after sanitization (e.g., Cyrillic-only
 * names like "Скрыты из библы"), falls back to the next segment.
 */
function extractGroupAndSubParts(parts) {
  let startIdx = 0;
  let group = '';

  // Find the first non-empty segment for the group name
  while (startIdx < parts.length) {
    group = sanitizeSegment(parts[startIdx]);
    startIdx++;
    if (group) break;
  }

  return { group, subParts: parts.slice(startIdx) };
}

/** Build theme file from Theme collection (one mode). */
function buildTheme(collectedData) {
  const theme = {};
  const annotations = {};

  for (const { flat } of collectedData) {
    for (const [name, data] of Object.entries(flat)) {
      if (data.type !== 'COLOR') continue;

      const parts = name.split('/');
      const { group, subParts } = extractGroupAndSubParts(parts);

      if (!group) continue; // Skip if all segments are empty

      if (!theme[group]) theme[group] = {};
      if (!annotations[group]) annotations[group] = {};

      if (subParts.length === 0) {
        theme[group] = data.value;
        annotations[group] = name;
      } else if (subParts.length === 1) {
        const key = subParts[0].toLowerCase().replace(/[^\w]/g, '_');
        theme[group][key] = data.value;
        annotations[group][key] = name;
      } else {
        // Nested structure: a/b/c → group.b_c
        const key = subParts
          .map((p) => p.toLowerCase().replace(/[^\w]/g, '_'))
          .join('_');
        theme[group][key] = data.value;
        annotations[group][key] = name;
      }
    }
  }

  // Also add non-COLOR variables (FLOAT: sizes, component paddings)
  for (const { flat } of collectedData) {
    for (const [name, data] of Object.entries(flat)) {
      if (data.type === 'COLOR') continue;

      const parts = name.split('/');
      const { group, subParts } = extractGroupAndSubParts(parts);

      if (!group) continue;

      const key = subParts
        .map((p) => p.toLowerCase().replace(/[^\w]/g, '_'))
        .join('_');

      if (!theme[group]) theme[group] = {};
      if (!annotations[group]) annotations[group] = {};
      const effectiveKey = key || group;
      if (data.type === 'FLOAT') {
        theme[group][effectiveKey] = `${Math.round(data.value)}px`;
      } else {
        theme[group][effectiveKey] = data.value;
      }
      annotations[group][effectiveKey] = name;
    }
  }

  return { data: theme, annotations };
}

/**
 * Build shadows from Figma Effect Styles.
 * shadow/200 → key '200', shadow/modal/heavy → 'modal-heavy'
 */
function buildShadows(effectStyles) {
  const shadows = {};
  const annotations = {};

  for (const [figmaName, data] of Object.entries(effectStyles)) {
    const parts = figmaName.split('/');
    let key;
    if (parts[0].toLowerCase() === 'shadow' && parts.length >= 2) {
      key = parts
        .slice(1)
        .join('-')
        .toLowerCase()
        .replace(/[^\w-]/g, '');
    } else {
      key = parts
        .join('-')
        .toLowerCase()
        .replace(/[^\w-]/g, '');
    }
    if (!key) continue;

    shadows[key] = data.cssValue;
    annotations[key] = figmaName;
  }

  return { data: shadows, annotations };
}

/**
 * Build blur tokens from Figma Effect Styles (LAYER_BLUR / BACKGROUND_BLUR).
 * blur/medium → key 'medium', value '24px'
 */
function buildBlurs(blurStyles) {
  const blurs = {};
  const annotations = {};

  for (const [figmaName, data] of Object.entries(blurStyles)) {
    const parts = figmaName.split('/');
    let key;
    if (parts[0].toLowerCase() === 'blur' && parts.length >= 2) {
      key = parts
        .slice(1)
        .join('-')
        .toLowerCase()
        .replace(/[^\w-]/g, '');
    } else {
      key = parts
        .join('-')
        .toLowerCase()
        .replace(/[^\w-]/g, '');
    }
    if (!key) continue;

    blurs[key] = `${data.radius}px`;
    annotations[key] = figmaName;
  }

  return { data: blurs, annotations };
}

// ============================================================================
// SERIALIZE WITH ANNOTATIONS FROM FIGMA
// ============================================================================

/**
 * Serialize JS object to string with comments-annotations from Figma.
 * Add // Figma: Original/Variable/Name next to each leaf value.
 */
function serializeWithAnnotations(obj, annotations, indent = 0) {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);

  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean') return String(obj);
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const items = obj.map((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        return `${padInner}${serializeWithAnnotations(item, annotations, indent + 1)}`;
      }
      return `${padInner}${serializeWithAnnotations(item, annotations, indent + 1)}`;
    });
    return `[\n${items.join(',\n')}\n${pad}]`;
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    const lines = entries.map(([key, value]) => {
      const quotedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
        ? `"${key}"`
        : `"${key}"`;
      const isLeaf =
        value === null ||
        typeof value !== 'object' ||
        (Array.isArray(value) &&
          value.every(
            (v) =>
              typeof v !== 'object' || v === null || Object.keys(v).length <= 2
          ));

      if (isLeaf && annotations) {
        const annotation = annotations.get
          ? annotations.get(key)
          : annotations[key];
        if (annotation) {
          const serialized = serializeWithAnnotations(value, null, indent + 1);
          return `${padInner}${quotedKey}: ${serialized} /* ${annotation} */`;
        }
      }

      // For nested objects — pass sub-dictionary of annotations
      let childAnnotations = null;
      if (
        annotations &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const sub = annotations.get ? annotations.get(key) : annotations[key];
        if (sub && typeof sub === 'object') childAnnotations = sub;
      }

      const serialized = serializeWithAnnotations(
        value,
        childAnnotations,
        indent + 1
      );
      return `${padInner}${quotedKey}: ${serialized}`;
    });

    return `{\n${lines.join(',\n')}\n${pad}}`;
  }

  return String(obj);
}

// ============================================================================
// LEGACY ALIASES — backward compatibility for renamed CSS variables
// ============================================================================

/**
 * Parse existing theme-variables.css and extract CSS variable names + values.
 * Returns { hexVars: Map<varName, { light, dark }>, existingAliases: Map<oldName, newName> }
 */
function parseExistingThemeVars(cssFilePath) {
  const hexVars = new Map();
  const existingAliases = new Map();
  if (!fs.existsSync(cssFilePath)) return { hexVars, existingAliases };

  const css = fs.readFileSync(cssFilePath, 'utf8');

  // Parse :root block (light theme values)
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  if (rootMatch) {
    for (const m of rootMatch[1].matchAll(/\s*(--[\w-]+):\s*([^;]+);/g)) {
      const name = m[1];
      const value = m[2].trim();
      if (value.startsWith('var(')) {
        // Existing legacy alias — extract target var name
        const targetMatch = value.match(/var\((--[\w-]+)\)/);
        if (targetMatch) existingAliases.set(name, targetMatch[1]);
      } else {
        if (!hexVars.has(name)) hexVars.set(name, {});
        hexVars.get(name).light = value;
      }
    }
  }

  // Parse [data-theme="dark"] block
  const darkMatch = css.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/);
  if (darkMatch) {
    for (const m of darkMatch[1].matchAll(/\s*(--[\w-]+):\s*([^;]+);/g)) {
      const name = m[1];
      const value = m[2].trim();
      if (value.startsWith('var(')) continue; // Aliases only in :root
      if (!hexVars.has(name)) hexVars.set(name, {});
      hexVars.get(name).dark = value;
    }
  }

  return { hexVars, existingAliases };
}

/**
 * Build a value→varName index from a theme vars map for fast reverse lookup.
 * Key: "lightHex|darkHex", Value: varName (first match wins).
 */
function buildValueIndex(varsMap) {
  const index = new Map();
  for (const [varName, vals] of varsMap) {
    const key = `${vals.light || ''}|${vals.dark || ''}`;
    if (!index.has(key)) index.set(key, varName);
  }
  return index;
}

/**
 * Build legacy aliases by comparing old (existing) CSS variables with new ones.
 * For each old variable that no longer exists in the new output, finds a new
 * variable with matching light+dark values and creates a var() alias.
 * Also preserves existing aliases from previous runs if their targets still exist.
 *
 * Returns { cssAliases: Map<oldName, newName>, tailwindAliases: { group: { key: varRef } } }
 */
function buildLegacyAliases(newLightTheme, newDarkTheme, existingCssPath) {
  const result = { cssAliases: new Map(), tailwindAliases: {} };

  const { hexVars: oldVars, existingAliases } =
    parseExistingThemeVars(existingCssPath);
  if (oldVars.size === 0 && existingAliases.size === 0) return result;

  // Build new vars map from themes
  const newVars = new Map();
  for (const [group, values] of Object.entries(newLightTheme || {})) {
    if (!group || typeof values !== 'object' || values === null) continue;
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string' && /^#[0-9A-Fa-f]/.test(value)) {
        const varName = `--${group}-${key}`;
        if (!newVars.has(varName)) newVars.set(varName, {});
        newVars.get(varName).light = value;
      }
    }
  }
  for (const [group, values] of Object.entries(newDarkTheme || {})) {
    if (!group || typeof values !== 'object' || values === null) continue;
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string' && /^#[0-9A-Fa-f]/.test(value)) {
        const varName = `--${group}-${key}`;
        if (!newVars.has(varName)) newVars.set(varName, {});
        newVars.get(varName).dark = value;
      }
    }
  }

  /**
   * Register an alias: old CSS var → new CSS var, plus Tailwind group entry.
   */
  function addAlias(oldName, newName) {
    result.cssAliases.set(oldName, newName);
    const oldWithoutPrefix = oldName.substring(2); // remove --
    const firstDash = oldWithoutPrefix.indexOf('-');
    if (firstDash !== -1) {
      const group = oldWithoutPrefix.substring(0, firstDash);
      const key = oldWithoutPrefix.substring(firstDash + 1);
      if (!result.tailwindAliases[group]) result.tailwindAliases[group] = {};
      result.tailwindAliases[group][key] = `var(${oldName})`;
    }
  }

  // 1. Carry forward existing aliases if their target vars still exist
  for (const [oldName, targetName] of existingAliases) {
    if (newVars.has(oldName)) continue; // Old name now exists natively — no alias needed
    if (newVars.has(targetName)) {
      addAlias(oldName, targetName);
    }
  }

  // 2. Find old hex-value vars that disappeared and match by value
  const newValueIndex = buildValueIndex(newVars);

  for (const [oldName, oldVals] of oldVars) {
    if (newVars.has(oldName)) continue; // Still exists in new output
    if (result.cssAliases.has(oldName)) continue; // Already aliased from step 1

    const lookupKey = `${oldVals.light || ''}|${oldVals.dark || ''}`;
    const newName = newValueIndex.get(lookupKey);
    if (newName) {
      addAlias(oldName, newName);
    }
  }

  if (result.cssAliases.size > 0) {
    console.log(
      `   🔗 ${result.cssAliases.size} legacy aliases (backward compatibility)`
    );
  }

  return result;
}

// ============================================================================
// ГЕНЕРАЦИЯ CSS ПЕРЕМЕННЫХ (auto-switch light/dark)
// ============================================================================

/**
 * Генерирует CSS-файл с CSS Custom Properties для автопереключения тем.
 * :root → light values, [data-theme="dark"] → dark values.
 * Ключи, отсутствующие в одной из тем, дублируются из другой (fallback).
 * Legacy aliases are appended as var() references for backward compatibility.
 */
function generateThemeVariablesCss(lightTheme, darkTheme, legacyAliases) {
  // Собираем union всех group+key из обеих тем (только COLOR — hex)
  const allVars = new Map(); // varName → { light, dark }

  for (const [group, values] of Object.entries(lightTheme || {})) {
    if (typeof values !== 'object' || values === null) continue;
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string' && /^#[0-9A-Fa-f]/.test(value)) {
        const varName = `--${group}-${key}`;
        if (!allVars.has(varName)) allVars.set(varName, {});
        allVars.get(varName).light = value;
      }
    }
  }

  for (const [group, values] of Object.entries(darkTheme || {})) {
    if (typeof values !== 'object' || values === null) continue;
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string' && /^#[0-9A-Fa-f]/.test(value)) {
        const varName = `--${group}-${key}`;
        if (!allVars.has(varName)) allVars.set(varName, {});
        allVars.get(varName).dark = value;
      }
    }
  }

  const lightLines = [];
  const darkLines = [];

  for (const [varName, vals] of allVars) {
    const lightVal = vals.light || vals.dark; // fallback если нет в light
    const darkVal = vals.dark || vals.light; // fallback если нет в dark
    lightLines.push(`  ${varName}: ${lightVal};`);
    darkLines.push(`  ${varName}: ${darkVal};`);
  }

  // Append legacy aliases as var() references in :root (for normal cascade)
  const cssAliases = legacyAliases?.cssAliases;
  if (cssAliases && cssAliases.size > 0) {
    lightLines.push('');
    lightLines.push('  /* Legacy aliases — backward compatibility */');
    for (const [oldName, newName] of cssAliases) {
      lightLines.push(`  ${oldName}: var(${newName});`);
    }
  }

  const header = `/**
 * Theme CSS Variables — Auto-switching Light/Dark
 * Auto-generated from Figma Variables API.
 * DO NOT EDIT — run: npm run update-tokens
 *
 * Generated: ${new Date().toISOString()}
 *
 * Usage: bg-mind-brand, text-status-success, text-blackinverse-a88, etc.
 * Colors auto-switch when [data-theme="dark"] is set on root.
 */\n\n`;

  // [data-theme="light"] and [data-theme="dark"] blocks need resolved hex values
  // for legacy aliases (not var() refs), because var() aliases set on :root resolve
  // there and are inherited as computed values — child data-theme can't override them.
  const lightOnlyLines = [];
  const darkOnlyLines = [...darkLines];
  for (const [varName, vals] of allVars) {
    const lightVal = vals.light || vals.dark;
    lightOnlyLines.push(`  ${varName}: ${lightVal};`);
  }
  if (cssAliases && cssAliases.size > 0) {
    lightOnlyLines.push('');
    lightOnlyLines.push(
      '  /* Legacy aliases — resolved values for theme isolation */'
    );
    darkOnlyLines.push('');
    darkOnlyLines.push(
      '  /* Legacy aliases — resolved values for theme isolation */'
    );
    for (const [oldName, newName] of cssAliases) {
      const target = allVars.get(newName);
      if (target) {
        lightOnlyLines.push(`  ${oldName}: ${target.light || target.dark};`);
        darkOnlyLines.push(`  ${oldName}: ${target.dark || target.light};`);
      }
    }
  }

  return (
    header +
    `:root {\n${lightLines.join('\n')}\n}\n\n` +
    `[data-theme="light"] {\n${lightOnlyLines.join('\n')}\n}\n\n` +
    `[data-theme="dark"] {\n${darkOnlyLines.join('\n')}\n}\n`
  );
}

// ============================================================================
// Generate CSS Variables for Primitives (Color Base)
// ============================================================================

/**
 * Generate CSS file with CSS Custom Properties for primitive colors.
 * Format: --{colorName}-{shade}: value;
 * Skip DEFAULT keys (Tailwind helpers).
 */
function generateColorPrimitivesCss(colors) {
  const lines = [];

  for (const [colorName, shades] of Object.entries(colors)) {
    if (typeof shades === 'string') {
      // Flat entry (e.g., a single color without shades)
      lines.push(`  --${colorName}: ${shades};`);
      continue;
    }
    if (typeof shades !== 'object' || shades === null) continue;

    for (const [shade, value] of Object.entries(shades)) {
      if (shade === 'DEFAULT') continue;
      if (typeof value !== 'string') continue;
      lines.push(`  --${colorName}-${shade}: ${value};`);
    }
  }

  const header = `/**
 * Color Primitives CSS Variables
 * Auto-generated from Figma Variables API (Color Base collection).
 * DO NOT EDIT — run: npm run update-tokens
 *
 * Generated: ${new Date().toISOString()}
 *
 * Usage: var(--red-a12), var(--blue-500), var(--black-1000), etc.
 */\n\n`;

  return header + `:root {\n${lines.join('\n')}\n}\n`;
}

/**
 * Generate CSS file with CSS Custom Properties for shadow tokens.
 * Format: --shadow-{key}: value;
 */
function generateShadowsCss(shadows) {
  const lines = [];
  for (const [key, value] of Object.entries(shadows)) {
    lines.push(`  --shadow-${key}: ${value};`);
  }

  const header = `/**
 * Shadow CSS Variables
 * Auto-generated from Figma Effect Styles API.
 * DO NOT EDIT — run: npm run update-tokens
 *
 * Generated: ${new Date().toISOString()}
 *
 * Usage: var(--shadow-200), var(--shadow-400), etc.
 * Tailwind: shadow-200, shadow-400, etc.
 */\n\n`;

  return header + `:root {\n${lines.join('\n')}\n}\n`;
}

/**
 * Generate CSS file with CSS Custom Properties for blur tokens.
 * Format: --blur-{key}: value;
 */
function generateBlursCss(blurs) {
  const lines = [];
  for (const [key, value] of Object.entries(blurs)) {
    lines.push(`  --blur-${key}: ${value};`);
  }

  const header = `/**
 * Blur CSS Variables
 * Auto-generated from Figma Effect Styles API.
 * DO NOT EDIT — run: npm run update-tokens
 *
 * Generated: ${new Date().toISOString()}
 *
 * Usage: var(--blur-medium), etc.
 * Tailwind: backdrop-blur-medium, blur-medium, etc.
 */\n\n`;

  return header + `:root {\n${lines.join('\n')}\n}\n`;
}

// ============================================================================
// Generate JS Files
// ============================================================================

const HEADER = (name) => `/**
 * ${name}
 * Auto-generated from Figma Variables API.
 * DO NOT EDIT — run: npm run update-tokens
 *
 * Generated: ${new Date().toISOString()}
 */\n\n`;

function generateColorsFile(colors, annotations) {
  return (
    HEADER('Design Tokens — Colors (Primitives)') +
    `module.exports = ${serializeWithAnnotations(colors, annotations)};\n`
  );
}

function generateTypographyFile(typography, annotations) {
  return (
    HEADER('Design Tokens — Typography') +
    `module.exports = ${serializeWithAnnotations(typography, annotations)};\n`
  );
}

function generateSizesFile(sizes, annotations) {
  return (
    HEADER('Design Tokens — Sizes (Spacing, Border Radius)') +
    `module.exports = ${serializeWithAnnotations(sizes, annotations)};\n`
  );
}

function generateThemeFile(theme, annotations, themeName) {
  return (
    HEADER(`Design Tokens — ${themeName} Theme`) +
    `module.exports = ${serializeWithAnnotations(theme, annotations)};\n`
  );
}

function generateShadowsFile(shadows, annotations) {
  return (
    HEADER('Design Tokens — Shadows (Effect Styles)') +
    `module.exports = ${serializeWithAnnotations(shadows, annotations)};\n`
  );
}

function generateBlursFile(blurs, annotations) {
  return (
    HEADER('Design Tokens — Blurs (Effect Styles)') +
    `module.exports = ${serializeWithAnnotations(blurs, annotations)};\n`
  );
}

function generateIconSettingsFile(iconSettings, annotations) {
  return (
    HEADER('Design Tokens — Icon Settings (Size + Outline per mode)') +
    `module.exports = ${serializeWithAnnotations(iconSettings, annotations)};\n`
  );
}

function generateTailwindThemeFile(
  lightTheme,
  darkTheme,
  shadows,
  blurs,
  legacyAliases
) {
  const themeColors = {};
  const themeSizing = {};
  const themeRadii = {};

  const allGroups = new Set([
    ...Object.keys(lightTheme || {}),
    ...Object.keys(darkTheme || {}),
  ]);

  for (const groupName of allGroups) {
    const lightGroup = (lightTheme || {})[groupName];
    const darkGroup = (darkTheme || {})[groupName];

    if (
      (lightGroup == null || typeof lightGroup !== 'object') &&
      (darkGroup == null || typeof darkGroup !== 'object')
    )
      continue;

    const merged = { ...(lightGroup || {}), ...(darkGroup || {}) };
    const values = Object.values(merged);
    const hasHexColors = values.some(
      (v) => typeof v === 'string' && /^#[0-9A-Fa-f]/.test(v)
    );
    const hasPxValues = values.some(
      (v) => typeof v === 'string' && v.endsWith('px')
    );

    if (hasHexColors) {
      const colorGroup = {};
      for (const key of Object.keys(merged)) {
        if (
          typeof merged[key] === 'string' &&
          /^#[0-9A-Fa-f]/.test(merged[key])
        ) {
          colorGroup[key] = `var(--${groupName}-${key})`;
        }
      }
      themeColors[groupName] = colorGroup;
    } else if (hasPxValues) {
      const source =
        lightGroup && typeof lightGroup === 'object' ? lightGroup : darkGroup;
      if (groupName === 'rounds' || groupName.includes('radius')) {
        for (const [k, v] of Object.entries(source)) {
          themeRadii[k] = v;
        }
      } else {
        for (const [k, v] of Object.entries(source)) {
          themeSizing[k] = v;
        }
      }
    }
  }

  // Merge legacy Tailwind aliases (old group names pointing to old CSS var names)
  const tailwindAliases = legacyAliases?.tailwindAliases;
  if (tailwindAliases) {
    for (const [group, keys] of Object.entries(tailwindAliases)) {
      if (!themeColors[group]) {
        themeColors[group] = keys;
      } else {
        // Merge alias keys into existing group (don't overwrite existing keys)
        for (const [key, value] of Object.entries(keys)) {
          if (!themeColors[group][key]) {
            themeColors[group][key] = value;
          }
        }
      }
    }
  }

  const boxShadow = {};
  if (shadows) {
    for (const key of Object.keys(shadows)) {
      boxShadow[key] = `var(--shadow-${key})`;
    }
  }

  const backdropBlur = {};
  const blur = {};
  if (blurs) {
    for (const key of Object.keys(blurs)) {
      backdropBlur[key] = `var(--blur-${key})`;
      blur[key] = `var(--blur-${key})`;
    }
  }

  const data = {
    colors: themeColors,
    spacing: themeSizing,
    borderRadius: themeRadii,
    boxShadow,
    backdropBlur,
    blur,
  };
  return (
    HEADER('Tailwind Theme Tokens — Pre-generated CSS variable references') +
    `module.exports = ${JSON.stringify(data, null, 2)};\n`
  );
}

function generateIndexFile() {
  return (
    HEADER('Design Tokens — Main Entry Point') +
    `const colors = require('./colors');
const typography = require('./typography');
const sizes = require('./sizes');
const shadows = require('./shadows');
const blurs = require('./blurs');
const iconSettings = require('./icon-settings');
const lightTheme = require('./light-theme');
const darkTheme = require('./dark-theme');

module.exports = {
  colors,
  typography,
  ...sizes,
  shadows,
  blurs,
  iconSettings,
  lightTheme,
  darkTheme,
};
`
  );
}

// ============================================================================
// --list: Show Available Collections
// ============================================================================

async function listCollections() {
  console.log('📡 Получаем коллекции из Figma...\n');
  const data = await figmaRequest(
    `/v1/files/${FIGMA_FILE_KEY}/variables/local`
  );
  const collections = data.meta.variableCollections;

  const local = [];
  const remote = [];

  const allVariables = data.meta.variables;

  for (const col of Object.values(collections)) {
    const sampleVars = col.variableIds.slice(0, 5).map((id) => {
      const v = allVariables[id];
      return v ? v.name : '?';
    });
    const info = {
      id: col.id,
      name: col.name,
      modes: col.modes.map((m) => m.name),
      variables: col.variableIds.length,
      samples: sampleVars,
    };
    (col.remote ? remote : local).push(info);
  }

  console.log('=== ЛОКАЛЬНЫЕ КОЛЛЕКЦИИ ===\n');
  for (const c of local) {
    console.log(`  ${c.name}`);
    console.log(`    ID: ${c.id}`);
    console.log(`    Modes: ${c.modes.join(', ')}`);
    console.log(`    Variables: ${c.variables}`);
    console.log(`    Примеры: ${c.samples.join(', ')}\n`);
  }

  if (remote.length) {
    console.log(`\n=== REMOTE КОЛЛЕКЦИИ (${remote.length}) ===\n`);
    for (const c of remote) {
      console.log(`  ${c.name} (${c.variables} vars) — ID: ${c.id}`);
      console.log(`    Modes: ${c.modes.join(', ')}`);
      console.log(`    Примеры: ${c.samples.join(', ')}`);
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  if (process.argv.includes('--list')) {
    if (!FIGMA_TOKEN) {
      console.error('FIGMA_ACCESS_TOKEN не найден в .env');
      process.exit(1);
    }
    await listCollections();
    return;
  }

  console.log('🎨 Обновление дизайн-токенов из Figma');
  console.log('========================================\n');

  if (!FIGMA_TOKEN) {
    console.error('❌ FIGMA_ACCESS_TOKEN не найден в .env\n');
    console.log(
      'Добавьте в .env:\n  FIGMA_ACCESS_TOKEN=figd_xxx...\n  FIGMA_FILE_KEY=NiGIiIpK82v6Ky1EAAR9jY'
    );
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`❌ Конфиг не найден: ${CONFIG_PATH}`);
    process.exit(1);
  }
  const config = require(CONFIG_PATH);
  console.log(
    `📋 Конфиг: ${Object.keys(config.collections).length} коллекций\n`
  );

  try {
    // 1. Получаем Variables
    console.log('📡 Запрос к Figma Variables API...');
    const apiData = await figmaRequest(
      `/v1/files/${FIGMA_FILE_KEY}/variables/local`
    );
    const allVariables = apiData.meta.variables;
    const allCollections = apiData.meta.variableCollections;
    console.log(
      `   ✅ ${Object.keys(allVariables).length} переменных, ${Object.keys(allCollections).length} коллекций\n`
    );

    // 1a. Fetch Effect Styles (shadows + blurs) — separate API, not in Variables
    console.log('📡 Fetching Figma Effect Styles (shadows, blurs)...');
    const { shadows: effectShadows, blurs: effectBlurs } =
      await fetchEffectStyles(FIGMA_FILE_KEY);
    console.log(
      `   ✅ ${Object.keys(effectShadows).length} shadows, ${Object.keys(effectBlurs).length} blurs\n`
    );

    // 1b. Pull variables and collections from additional files.
    //     Merge allVariables — for alias resolution.
    //     Merge allCollections — to process LOCAL versions of collections
    //     (remote copies from main file have unresolved cross-file IDs).
    //     Мёрж allVariables — для резолва алиасов.
    for (const libKey of FIGMA_FILE_KEYS.slice(1)) {
      console.log(`   📚 Library file: ${libKey}...`);
      const libData = await figmaRequest(`/v1/files/${libKey}/variables/local`);
      const libVars = libData.meta.variables;
      const libCollections = libData.meta.variableCollections;
      let addedVars = 0;
      let addedColls = 0;
      for (const [id, v] of Object.entries(libVars)) {
        if (!allVariables[id]) {
          allVariables[id] = v;
          addedVars++;
        }
      }
      for (const [id, collection] of Object.entries(libCollections)) {
        if (!allCollections[id]) {
          // Mark as remote, so auto-include will process these collections.
          // Local collections in library file functionally equivalent to remote
          // for the main file, and their variables are resolved through their local ID.
          collection.remote = true;
          allCollections[id] = collection;
          addedColls++;
        }
      }
      console.log(`   ✅ +${addedVars} переменных, +${addedColls} коллекций\n`);
    }

    // 2. Match config with Figma collections
    const buckets = {
      colors: [],
      typography: [],
      sizes: [],
      themes: [],
      'icon-settings': [],
    };
    let totalVars = 0;

    for (const [collectionName, collConfig] of Object.entries(
      config.collections
    )) {
      // Search collection: by ID (if specified) or by name
      // For multiple matches (remote) — take all
      const matchedCollections = Object.values(allCollections).filter((c) => {
        if (collConfig.id) return c.id === collConfig.id;
        if (c.name !== collectionName) return false;
        if (!config.includeRemote && c.remote && !collConfig.remote)
          return false;
        return true;
      });

      if (!matchedCollections.length) {
        console.log(`   ⚠️  Коллекция "${collectionName}" не найдена`);
        continue;
      }

      // Process all matched collections (important for remote with same name)
      for (const collection of matchedCollections) {
        for (const modeCfg of collConfig.modes) {
          let mode;
          if (modeCfg === 'default') {
            mode =
              collection.modes.find(
                (m) => m.modeId === collection.defaultModeId
              ) || collection.modes[0];
          } else {
            mode = collection.modes.find((m) => m.name === modeCfg);
          }

          if (!mode) {
            // Skip silently — remote collection may not have the desired mode
            continue;
          }

          // Child collections (e.g. Limex) store values keyed by parentModeId
          const fallbackModeId = mode.parentModeId || null;
          const flat = collectVariablesForMode(
            collection,
            mode.modeId,
            allVariables,
            fallbackModeId
          );
          const count = Object.keys(flat).length;
          totalVars += count;

          const tag = collection.remote ? ' (remote)' : '';
          const expected = collection.variableIds.length;
          console.log(
            `   📦 ${collectionName} [${mode.name}]${tag} → ${count} vars → ${collConfig.output}`
          );
          if (count === 0 && expected > 0) {
            console.warn(
              `   ⚠️  ${collectionName} [${mode.name}]: 0 of ${expected} vars resolved — check mode IDs`
            );
          } else if (count < expected * 0.5) {
            console.warn(
              `   ⚠️  ${collectionName} [${mode.name}]: only ${count}/${expected} vars resolved — some may be lost`
            );
          }
          buckets[collConfig.output].push({
            collectionName,
            modeName: mode.name,
            flat,
          });
        }
      }
    }

    // 2b. Auto-include: all remote collections, if includeRemote: true
    if (config.includeRemote) {
      const processedIds = new Set();
      // Collect IDs of already processed collections
      for (const [, collConfig] of Object.entries(config.collections)) {
        Object.values(allCollections).forEach((c) => {
          if (collConfig.id && c.id === collConfig.id) processedIds.add(c.id);
          if (
            c.name ===
            Object.keys(config.collections).find(
              (n) => config.collections[n] === collConfig
            )
          )
            processedIds.add(c.id);
        });
      }

      const remoteCollections = Object.values(allCollections).filter(
        (c) => c.remote && !processedIds.has(c.id)
      );

      if (remoteCollections.length) {
        console.log(
          `\n   🌐 Auto-include: ${remoteCollections.length} remote коллекций...\n`
        );
      }

      for (const collection of remoteCollections) {
        // Determine bucket by variable type
        const sampleVar = allVariables[collection.variableIds[0]];
        let output = 'themes';
        if (sampleVar) {
          if (
            sampleVar.resolvedType === 'FLOAT' &&
            (sampleVar.name.toLowerCase().includes('spacing') ||
              sampleVar.name.toLowerCase().includes('size'))
          ) {
            output = 'sizes';
          } else if (sampleVar.resolvedType === 'STRING') {
            output = 'typography';
          }
        }

        // Try Light/Dark mode, otherwise default
        const lightMode = collection.modes.find((m) => /light/i.test(m.name));
        const darkMode = collection.modes.find((m) => /dark/i.test(m.name));
        const defaultMode =
          collection.modes.find((m) => m.modeId === collection.defaultModeId) ||
          collection.modes[0];

        const modesToProcess = [];
        if (lightMode) modesToProcess.push(lightMode);
        if (darkMode) modesToProcess.push(darkMode);
        if (!modesToProcess.length) modesToProcess.push(defaultMode);

        for (const mode of modesToProcess) {
          const flat = collectVariablesForMode(
            collection,
            mode.modeId,
            allVariables
          );
          const count = Object.keys(flat).length;
          if (count === 0) continue;
          totalVars += count;

          console.log(
            `   📦 ${collection.name} [${mode.name}] (remote) → ${count} vars → ${output}`
          );
          buckets[output].push({
            collectionName: collection.name,
            modeName: mode.name,
            flat,
          });
        }
      }
    }

    console.log(`\n   Итого: ${totalVars} переменных\n`);

    // 3. Build data for each file
    console.log('🔨 Генерация файлов...');

    const { data: colors, annotations: colorsAnn } = buildColors(
      buckets.colors
    );
    const { data: typography, annotations: typographyAnn } = buildTypography(
      buckets.typography
    );
    const { data: sizes, annotations: sizesAnn } = buildSizes(buckets.sizes);

    const lightData = buckets.themes.filter((d) =>
      d.modeName.toLowerCase().includes('light')
    );
    const darkData = buckets.themes.filter((d) =>
      d.modeName.toLowerCase().includes('dark')
    );
    const { data: lightTheme, annotations: lightAnn } = buildTheme(lightData);
    const { data: darkTheme, annotations: darkAnn } = buildTheme(darkData);
    const { data: iconSettings, annotations: iconSettingsAnn } =
      buildIconSettings(buckets['icon-settings']);
    const { data: shadows, annotations: shadowsAnn } =
      buildShadows(effectShadows);
    const { data: blurTokens, annotations: blursAnn } = buildBlurs(effectBlurs);

    // 4. Write files
    fs.mkdirSync(TOKENS_DIR, { recursive: true });

    // Build legacy aliases before generating (reads existing CSS for comparison)
    const themeVarsCssPath = path.join(TOKENS_DIR, 'theme-variables.css');
    const legacyAliases = buildLegacyAliases(
      lightTheme,
      darkTheme,
      themeVarsCssPath
    );

    // CSS variables for theme switching
    const themeVarsCss = generateThemeVariablesCss(
      lightTheme,
      darkTheme,
      legacyAliases
    );
    // CSS variables for primitive colors (Color Base)
    const colorPrimitivesCss = generateColorPrimitivesCss(colors);
    // CSS variables for shadows and blurs (Effect Styles)
    const shadowsCss = generateShadowsCss(shadows);
    const blursCss = generateBlursCss(blurTokens);

    const files = [
      ['colors.js', generateColorsFile(colors, colorsAnn)],
      ['typography.js', generateTypographyFile(typography, typographyAnn)],
      ['sizes.js', generateSizesFile(sizes, sizesAnn)],
      ['shadows.js', generateShadowsFile(shadows, shadowsAnn)],
      ['blurs.js', generateBlursFile(blurTokens, blursAnn)],
      [
        'icon-settings.js',
        generateIconSettingsFile(iconSettings, iconSettingsAnn),
      ],
      ['light-theme.js', generateThemeFile(lightTheme, lightAnn, 'Light')],
      ['dark-theme.js', generateThemeFile(darkTheme, darkAnn, 'Dark')],
      ['theme-variables.css', themeVarsCss],
      ['color-primitives.css', colorPrimitivesCss],
      ['shadows.css', shadowsCss],
      ['blurs.css', blursCss],
      [
        'tailwind-theme.js',
        generateTailwindThemeFile(
          lightTheme,
          darkTheme,
          shadows,
          blurTokens,
          legacyAliases
        ),
      ],
      ['index.js', generateIndexFile()],
    ];

    for (const [filename, content] of files) {
      fs.writeFileSync(path.join(TOKENS_DIR, filename), content);
      console.log(`   ✅ tokens/${filename}`);
    }

    // Statistics
    console.log('\n========================================');
    console.log('✅ Готово!\n');
    console.log(`   Цвета:      ${Object.keys(colors).length} палитр`);
    console.log(
      `   Типографика: ${Object.keys(typography.fontSize?.desktop || {}).length} desktop + ${Object.keys(typography.fontSize?.mobile || {}).length} mobile`
    );
    console.log(`   Spacing:     ${Object.keys(sizes.spacing).length}`);
    console.log(`   Radius:      ${Object.keys(sizes.borderRadius).length}`);
    console.log(`   Shadows:     ${Object.keys(shadows).length}`);
    console.log(`   Blurs:       ${Object.keys(blurTokens).length}`);
    console.log(`   Icon Settings: ${Object.keys(iconSettings).length} modes`);
    console.log(`   Light Theme: ${Object.keys(lightTheme).length} групп`);
    console.log(`   Dark Theme:  ${Object.keys(darkTheme).length} групп`);
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
