// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links'; // 1. 引入 rehype
import indexNow from 'astro-indexnow'; // 引入 IndexNow

export default defineConfig({
  site: 'https://stock.may.tw',

  // --- 把所有外掛放在同一個陣列裡 ---
  integrations: [
    sitemap(),
    indexNow({
      key: '9e8bb32fa98f4ffa9f3ffec9485f7761',
    })
  ],
  // ------------------------------------------

  // 關閉開發工具列
  devToolbar: {
    enabled: false
  },

  // Markdown 設定
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          // 設定讓外部連結自動開啟新視窗
          target: '_blank',
          // 自動加上安全性與 SEO 參數
          rel: ['nofollow', 'noopener', 'noreferrer'],
        },
      ],
    ],
  },
});