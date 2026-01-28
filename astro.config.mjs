// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 1. 新增這行：引入 rehype-external-links 套件
import rehypeExternalLinks from 'rehype-external-links'; 

export default defineConfig({
  site: 'https://stock.may.tw',

  // 關閉開發工具列
  devToolbar: {
    enabled: false
  },

  integrations: [sitemap()],

  // 2. 新增這段：Markdown 設定
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