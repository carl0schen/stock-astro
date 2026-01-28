// astro.config.mjs
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stock.may.tw',

  // 加入這段來關閉開發工具列
  devToolbar: {
    enabled: false
  },

  integrations: [sitemap()]
});