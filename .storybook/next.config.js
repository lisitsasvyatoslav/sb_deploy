/**
 * Упрощённый next.config для Storybook — без SVG webpack-конфига,
 * который ломается из-за отсутствия fileLoaderRule в Storybook-контексте.
 * SVG обрабатывается через webpackFinal в main.ts.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
