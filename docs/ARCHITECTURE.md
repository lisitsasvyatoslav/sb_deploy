# Project Architecture

## [back to readme](/README.md)

## Project File Structure

```text
src
├── app            │ pages with file-based routing, common styles, and framework settings
├── features       │ placement of modules that cannot contain nested features
├── config         │ project configuration files (environments, translations)
├── shared         │ common reusable project components/files
│   ├── api        │ common controllers for obtaining external data via GraphQL/REST API
│   ├── ui         │ low-level components included in the design system
│   ├── components │ general-purpose components specific to the project
│   ├── constants  │ general-purpose constants
│   ├── hooks      │ general-purpose react hooks
│   ├── model      │ reusable component models
│   └── utils      │ general-purpose utilities
├── modules        │ modules (description below)
├── widgets        │ composite components that implement a specific business scenario, may contain their own subcomponents, utilities, model
├── views          | project page UI, containing a minimum of logic and nested components
│
```

## **Component**

Example of a component structure written using CSS Modules:

```text
ComponentName
├─── index.tsx                  │ React component
└─── ComponentName.module.css   │ Component styles
```

It is also acceptable to create a separate file for the component and use the index file for export. This is acceptable when types/constants are also exported from the component folder:

```text
ComponentName
├─── index.ts                  │ Export file
├─── types.ts                  │ Component types
├─── constants.ts              │ Constants used in the component
├─── ComponentName.tsx         │ React component
└─── ComponentName.module.css  │ Component styles
```

## **Feature**

**src/features/** (alias `~features/**`) - Any standalone functionality that is isolated and can be used independently. An example of the motivation for using a feature-based approach is described [here](https://ryanlanciaux.com/blog/2017/08/20/a-feature-based-approach-to-react-development/).

Features must be named in **camelCase**.

**A feature can** export via index ( [barrel](https://basarat.gitbook.io/typescript/main-1/barrel)) file at the top level, available components, functions, and constants that can potentially be used in other modules/features, while it is better to re-export functionality that is almost 100% likely to be reused externally.

You can debug using the **pnpm run analyse** command or check the **source** tab in Google Chrome dev tools for extraneous files.

Feature file structure:

```text
feature
├── components     │ React components
├── constants      │ constants reused at the feature level
├── hooks          │ general-purpose react hooks
├── utils          │ general-purpose utility functions
├── views          │ re-exported page components
├── model          │ global stores, react providers
└─ index.tsx       | barrel file with re-exports
```

## **Module**

**src/modules/**, alias `@<module name>` (e.g. @user, @news, etc.) - are large features, but with a limited scope. Unlike features, they must contain other features within themselves. Otherwise, the structure and purpose of the folders is identical to features.
Example of features nested in a module:

```text
modules
└─ p2p
   └─ features
      ├─ merchant
      └─ customer
```