# Component Requirements

## [back to readme](../README.md)

### Table of Contents

- [Component Requirements](#component-requirements)
  - [back to readme](#back-to-readme)
    - [Table of Contents](#table-of-contents)
  - [1. TypeScript and JavaScript Requirements](#1-typescript-and-javascript-requirements)
  - [2. General Component Structure Requirements](#2-general-component-structure-requirements)
  - [3. React Component Code Requirements](#3-react-component-code-requirements)
    - [4. Import/Export Requirements](#4-importexport-requirements)
  - [5. Layout/Styling Requirements](#5-layoutstyling-requirements)

## 1. TypeScript and JavaScript Requirements

- Read the TypeScript [documentation](https://www.typescriptlang.org/docs/)
- Follow the rules described in [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)
- Read the [cheatsheets](https://github.com/typescript-cheatsheets/react) and recommendations for using TypeScript with React
- All components must be functional
- If a component becomes too large during development, split it into smaller components. The parent component goes in the root `index.tsx` file, and child components go alongside it, preferably in folders named after each component
- Types and interfaces describing a component and its functions must be in a `types.ts` file; if not reused elsewhere, keep them next to the usage site
- Using `any` is **forbidden**
- Don't overload interfaces to maintain readability — use `extends` for interfaces and [intersection types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types) for object types, extracting logical blocks into separate types
- Constants must be `SNAKE_CASE_ALL_CAPS`. [More details](https://betterprogramming.pub/string-case-styles-camel-pascal-snake-and-kebab-case-981407998841)
- Objects consisting of homogeneous constants must follow this naming convention:
  the object name is plural, keys are `SNAKE_CASE_ALL_CAPS`.
  Example: `routes.USER_PROFILE`.
  Exception: colors (`colors.black`)

## 2. General Component Structure Requirements

- Component directories must be named so it's clear what the component does or what functionality it provides. For example, if a button handles sharing, don't name it just `Button` or abbreviate to `Btn` — a good name would be `ShareButton`. If a component directory is inside `/pages`, there's no need to name the directory `ProfilePage` — just `Profile` is sufficient (but the component itself should be named `ProfilePage`)
- New components must be implemented in [TypeScript](https://www.typescriptlang.org/docs/)
- Use current library versions when developing components. Eliminate `deprecated` dependencies and legacy code. Use modern language features over older implementations. For example, use destructuring `{ ...obj }` instead of `Object.assign(obj)`, Optional Chaining `x.prop1?.prop2?.prop3` instead of `if` chains (don't overuse), Nullish Coalescing, etc.
- All types, interfaces, and the component itself must be (re)exported from the component's `index.ts` file
- Types and interfaces describing a component and its functions must be in a `types.ts` file at the same level as `index.tsx`, if reused by other files
- Large constants must be extracted to a `constants.ts` file at the same level as the component file
- Images (icons) specific to a component must be placed in an `assets` | `images` | `icons` directory within the component's own directory

## 3. React Component Code Requirements

- Use TypeScript for props descriptions, use default arguments for default props. Prefer `type` over `interface` unless `extends` is needed:

  ```typescript
  type ComponentNameProps = {
      testProp?: string,
      children: React.ReactNode
  }

  const ComponentName = ({testProp = 'test'}: ComponentNameProps) => {...}
  ```

- Constants and functions that don't depend on `props` or `state` must be defined outside the component or in `./constants.ts` | `./utils.ts`.

- Performance optimization hooks and HOCs (`useMemo`, `memo`, `useCallback`) must only be used when genuinely needed, without unnecessary redundancy. [More details](https://kentcdodds.com/blog/usememo-and-usecallback)
- Use comments to clarify code where it isn't self-evident. [JSDoc](https://jsdoc.app/) format is also recommended — it improves code readability and understanding, and works well with TypeScript.
- Don't ignore ESLint errors; also pay attention to `warning` messages in the browser console during development. Disabling certain ESLint rules is allowed only when truly necessary and must be agreed upon with the development team.

### 4. Import/Export Requirements

- Use **named exports** everywhere, except for page exports
- ~~`import React from 'react'`~~ is [not required](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) in recent React versions
- Imports should be ordered as follows:
  - Library imports from `node_modules`
  - *(blank line)*
  - Feature imports
  - Relative imports by nesting depth, starting from the farthest
  - Relative style imports
  - Dynamic imports

Example:

```javascript
import { useState, useEffect } from 'react';
import { useRouter } from 'next-router';
import { useSelector } from 'react-redux';
import { formatDate } from 'date-fns';

import { Button } from '~features/ui';
import { ComponentName1 } from '../../ComponentName1';
import { ComponentName2 } from '../ComponentName1';
import { ComponentName3 } from './ComponentName3';
import { Wrapper, Content } from './styles';
```

Key rules:

- Don't use path aliases within a feature to reference itself. Avoid imports with nesting depth > 3
- Don't use chains of more than 2 re-exports

## 5. Layout/Styling Requirements

- Agree on `@media` breakpoints with designers and extract the correct values as constants. Do the same for colors and any other values that can be extracted as constants.
- Styles must not contain values like `margin-top: 12.341px`. Such values must be rounded to whole numbers divisible by 2 or 4 — e.g., `margin-top: 12px`.
- Avoid excessively nested selectors
