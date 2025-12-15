// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';

// カスタムディレクティブプラグイン (:::note, :::warning など)
function remarkAdmonitions() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {});
        const tagName = node.type === 'textDirective' ? 'span' : 'div';

        data.hName = tagName;
        data.hProperties = {
          class: `admonition admonition-${node.name}`,
        };
      }
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://neu-dev.net',
  // base: '/blog', // カスタムドメインではbaseは不要
  integrations: [
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  markdown: {
    remarkPlugins: [remarkDirective, remarkAdmonitions],
  },
});
