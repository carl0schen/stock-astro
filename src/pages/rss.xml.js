// src/pages/rss.xml.js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const daily = await getCollection('daily');
  const weekly = await getCollection('weekly');
  const monthly = await getCollection('monthly');

  // --- 輔助函式 ---
  
  // 計算週報日期 (該週的週日)
  const calculateWeeklyDate = (year, weekNum) => {
    const y = parseInt(year, 10);
    const w = parseInt(weekNum, 10);
    const jan1 = new Date(Date.UTC(y, 0, 1)); // 使用 UTC 建立日期
    const daysToNextSunday = (7 - jan1.getUTCDay()) % 7;
    const firstSunday = new Date(jan1);
    firstSunday.setUTCDate(jan1.getUTCDate() + daysToNextSunday);
    
    const targetDate = new Date(firstSunday);
    targetDate.setUTCDate(firstSunday.getUTCDate() + (w - 1) * 7);
    return targetDate;
  };

  // 計算月報日期 (該月最後一天)
  const calculateMonthlyDate = (year, monthNum) => {
    // 使用 UTC 建立日期
    return new Date(Date.UTC(parseInt(year, 10), parseInt(monthNum, 10), 0));
  };

  // --- 主邏輯 ---

  const allPosts = [
    // === 日報 ===
    ...daily.map(post => {
      const [year, month, day] = post.slug.split('/');
      const displayMonth = parseInt(month, 10);
      const displayDay = parseInt(day, 10);

      // 1. 取得日期物件
      // 如果有 Frontmatter，直接用；沒有則用檔名建立 UTC 日期
      const dateObj = post.data.date 
        ? new Date(post.data.date) 
        : new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
      
      // 2. 強制設定時間：台灣 16:30 = UTC 08:30
      // 邏輯：16 - 8 = 8
      dateObj.setUTCHours(16 - 8, 30, 0, 0);

      return {
        ...post,
        calculatedDate: dateObj,
        customTitle: post.data.title,
        customLink: `/${post.slug}/`,
        customDescription: `本文整理了${year}年${displayMonth}月${displayDay}日台股盤後三大法人的交易動向。`,
      };
    }),

    // === 週報 ===
    ...weekly.map(post => {
      const [year, weekSlug] = post.slug.split('/');
      const weekNum = parseInt(weekSlug.replace(/[wW]/, ''), 10);
      const urlWeek = weekNum.toString().padStart(2, '0');

      let dateObj;
      if (post.data.date) {
        dateObj = new Date(post.data.date);
      } else {
        dateObj = calculateWeeklyDate(year, weekNum);
      }

      // 2. 強制設定時間：台灣 20:00 = UTC 12:00
      // 邏輯：20 - 8 = 12
      dateObj.setUTCHours(20 - 8, 0, 0, 0);

      return {
        ...post,
        calculatedDate: dateObj,
        customTitle: post.data.title,
        customLink: `/${year}/weekly/${urlWeek}/`,
        customDescription: `本文整理了${year}年第${weekNum}週三大法人的交易動向。`,
      };
    }),

    // === 月報 ===
    ...monthly.map(post => {
      const [year, monthSlug] = post.slug.split('/');
      const monthNum = parseInt(monthSlug.replace(/[mM]/, ''), 10);
      const urlMonth = monthNum.toString().padStart(2, '0');

      let dateObj;
      if (post.data.date) {
        dateObj = new Date(post.data.date);
      } else {
        dateObj = calculateMonthlyDate(year, monthNum);
      }

      // 2. 強制設定時間：台灣 21:00 = UTC 13:00
      // 邏輯：21 - 8 = 13
      dateObj.setUTCHours(21 - 8, 0, 0, 0);

      return {
        ...post,
        calculatedDate: dateObj,
        customTitle: post.data.title,
        customLink: `/${year}/monthly/${urlMonth}/`,
        customDescription: `本文整理了${year}年${monthNum}月三大法人的交易動向。`,
      };
    }),
  ];

  // 3. 排序 (新 -> 舊)
  allPosts.sort((a, b) => b.calculatedDate.valueOf() - a.calculatedDate.valueOf());

  // 4. 限制最新 20 篇
  const limitedPosts = allPosts.slice(0, 20);

  return rss({
    title: '台股法人買賣超整理',
    description: '利用 AI 彙整台股盤後資訊，快速掌握市場動向。',
    site: context.site,
    items: limitedPosts.map((post) => ({
      title: post.customTitle,
      pubDate: post.calculatedDate, 
      description: post.customDescription, 
      link: post.customLink,               
    })),
    customData: `<language>zh-TW</language>`,
  });
}