import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { theme, codeLabel } from './src/lib/shiki.ts';
import { sketchPlugin } from './src/lib/sketch.ts';

export default defineConfig({
  site: 'https://varnan.dev',
  markdown: {
    processor: satteri({ mdastPlugins: [sketchPlugin] }),
    shikiConfig: {
      theme,
      transformers: [codeLabel],
      wrap: false,
    },
  },
});
