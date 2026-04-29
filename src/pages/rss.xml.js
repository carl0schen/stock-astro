// src/pages/rss.xml.js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const daily = await getCollection('daily');
  const weekly = await getCollection('weekly');
  const monthly = await getCollection('monthly');

  const allPosts = [
    // === 日報 ===
    ...daily.map(post => {
      const cleanId = post.id.replace(/\.md$/, ''); // ✨ 拿掉副檔名
      const [year, month, day] = cleanId.split('/');
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: `本文整理了${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日台股盤後三大法人的交易動向。`,
        link: `/${cleanId}/`, // ✨ 改用 cleanId
      };
    }),

    // === 週報 ===
    ...weekly.map(post => {
      const cleanId = post.id.replace(/\.md$/, ''); // ✨ 拿掉副檔名
      const [year, weekSlug] = cleanId.split('/');
      const weekNum = parseInt(weekSlug.replace(/[wW]/, ''), 10);
      const urlWeek = weekNum.toString().padStart(2, '0');
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: `本文整理了${year}年第${weekNum}週三大法人的交易動向。`,
        link: `/${year}/weekly/${urlWeek}/`,
      };
    }),

    // === 月報 ===
    ...monthly.map(post => {
      const cleanId = post.id.replace(/\.md$/, ''); // ✨ 拿掉副檔名
      const [year, monthSlug] = cleanId.split('/');
      const monthNum = parseInt(monthSlug.replace(/[mM]/, ''), 10);
      const urlMonth = monthNum.toString().padStart(2, '0');
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: `本文整理了${year}年${monthNum}月三大法人的交易動向。`,
        link: `/${year}/monthly/${urlMonth}/`,
      };
    }),
  ];

  // 3. 排序 (依據真實時間：新 -> 舊)
  allPosts.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());

  // 4. 限制最新 20 篇
  const limitedPosts = allPosts.slice(0, 20);

  // 取得完整的 RSS 網址 (例如: https://stock.may.tw/rss.xml)
  const feedUrl = new URL('rss.xml', context.site).href;

  return rss({
    title: '台股法人買賣超整理',
    description: '利用 AI 彙整台股盤後資訊，快速掌握市場動向。',
    site: context.site,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    items: limitedPosts,
    customData: `
      <language>zh-TW</language>
      <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
      <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />
    `,
  });
}
