import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/shared/ui/**/*.stories.@(ts|tsx|mdx)'],

  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    'storybook-addon-pseudo-states',
    '@storybook/addon-docs',
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {
      // Use simplified next.config without SVG webpack hook
      // (original next.config.js breaks Storybook due to fileLoaderRule)
      nextConfigPath: path.resolve(__dirname, './next.config.js'),
    },
  },

  staticDirs: ['../public'],

  typescript: {
    check: false,
    // react-docgen-typescript disabled: causes child compilation error
    // with @storybook/nextjs + html-webpack-plugin + Next.js compiled webpack
    reactDocgen: 'react-docgen',
  },

  webpackFinal: async (webpackConfig, options) => {
    // --- SVG: replicate next.config.js setup ---
    // Since .storybook/next.config.js is simplified (no webpack hook),
    // SVG → React components must be configured here.
    if (webpackConfig.module?.rules) {
      // Disable Storybook's default SVG handler
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        if (
          rule &&
          typeof rule === 'object' &&
          'test' in rule &&
          rule.test instanceof RegExp &&
          rule.test.test('.svg')
        ) {
          return { ...rule, test: /\.svg-disabled$/ };
        }
        return rule;
      });

      webpackConfig.module.rules.push(
        { test: /\.svg$/i, resourceQuery: /url/, type: 'asset/resource' },
        {
          test: /\.svg$/i,
          resourceQuery: { not: [/url/] },
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: { overrides: { removeViewBox: false } },
                    },
                    'removeDimensions',
                  ],
                },
                replaceAttrValues: { '#040405': 'currentColor' },
                ref: true,
                titleProp: true,
                descProp: true,
              },
            },
          ],
        }
      );
    }

    // --- TypeScript aliases ---
    if (webpackConfig.resolve) {
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        '@': path.resolve(__dirname, '../src'),
        '@/types': path.resolve(__dirname, '../src/types/index'),
      };
    }

    // `storybook build`: skip source maps — on Vercel this phase can exceed time/memory
    // (thousands of SourceMapDevToolPlugin lines, then silent kill with no clear error).
    if (options.configType === 'PRODUCTION') {
      webpackConfig.devtool = false;
      if (webpackConfig.plugins?.length) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) =>
            !plugin ||
            typeof plugin !== 'object' ||
            !('constructor' in plugin) ||
            plugin.constructor.name !== 'SourceMapDevToolPlugin'
        );
      }
    }

    return webpackConfig;
  },
};

export default config;
