import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import indexNow from 'astro-indexnow';
import { loadEnv } from 'vite';

const { INDEXNOW_KEY } = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');

export default defineConfig({
  site: 'https://stock.may.tw',

  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
      filter: (page) => {
        return page !== 'https://stock.may.tw/contact/thanks/';
      },
    }),
    indexNow({
      key: INDEXNOW_KEY,
    })
  ],

  devToolbar: {
    enabled: false
  },

  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow', 'noopener', 'noreferrer'],
        },
      ],
    ],
  },
});