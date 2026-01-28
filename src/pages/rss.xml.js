// src/pages/rss.xml.js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const daily = await getCollection('daily');
  const weekly = await getCollection('weekly');
  const monthly = await getCollection('monthly');

  // --- 輔助函式：當 Markdown 裡沒寫日期時，用檔名推算 (救急用) ---
  
  // 計算週報日期 (該週的週日)
  const calculateWeeklyDate = (year, weekNum) => {
    const y = parseInt(year, 10);
    const w = parseInt(weekNum, 10);
    // 找出該年 1/1
    const jan1 = new Date(y, 0, 1);
    // 找出第一個週日
    const daysToNextSunday = (7 - jan1.getDay()) % 7;
    const firstSunday = new Date(jan1);
    firstSunday.setDate(jan1.getDate() + daysToNextSunday);
    
    // 推算第 N 週
    const targetDate = new Date(firstSunday);
    targetDate.setDate(firstSunday.getDate() + (w - 1) * 7);
    return targetDate;
  };

  // 計算月報日期 (該月最後一天)
  const calculateMonthlyDate = (year, monthNum) => {
    // Date(y, m, 0) 會自動取得該月最後一天
    return new Date(parseInt(year, 10), parseInt(monthNum, 10), 0);
  };

  // --- 主邏輯 ---

  const allPosts = [
    // === 日報 ===
    ...daily.map(post => {
      const [year, month, day] = post.slug.split('/');
      const displayMonth = parseInt(month, 10);
      const displayDay = parseInt(day, 10);

      // 1. 決定日期來源：有 Frontmatter 用 Frontmatter，沒有則用檔名
      const dateObj = post.data.date 
        ? new Date(post.data.date) 
        : new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // 2. 設定時間：16:30
      dateObj.setHours(16, 30, 0, 0);

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
      // 使用 Regex 去掉 W/w，確保拿到純數字
      const weekNum = parseInt(weekSlug.replace(/[wW]/, ''), 10);
      const urlWeek = weekNum.toString().padStart(2, '0');

      // 1. 決定日期來源
      let dateObj;
      if (post.data.date) {
        // 未來的新文章，讀這行
        dateObj = new Date(post.data.date);
      } else {
        // 過去的舊文章(沒日期)，自動用算的
        dateObj = calculateWeeklyDate(year, weekNum);
      }

      // 2. 設定時間：20:00 (確保排在同日日報後面)
      dateObj.setHours(20, 0, 0, 0);

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

      // 1. 決定日期來源
      let dateObj;
      if (post.data.date) {
        dateObj = new Date(post.data.date);
      } else {
        dateObj = calculateMonthlyDate(year, monthNum);
      }

      // 2. 設定時間：21:00 (確保排在同日週報後面)
      dateObj.setHours(21, 0, 0, 0);

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
  // 因為所有文章都有了 calculatedDate (不管是讀來的還是算來的)，排序一定會準
  allPosts.sort((a, b) => b.calculatedDate.valueOf() - a.calculatedDate.valueOf());

  // 4. 限制最新 20 篇
  const limitedPosts = allPosts.slice(0, 20);

  return rss({
    title: '台股盤後 - 法人買賣超整理',
    description: '利用AI彙整台股盤後資訊，快速掌握市場動向。',
    site: context.site,
    items: limitedPosts.map((post) => ({
      title: post.customTitle,
      pubDate: post.calculatedDate, // 這是關鍵：使用處理過的時間
      description: post.customDescription, 
      link: post.customLink,               
    })),
    customData: `<language>zh-TW</language>`,
  });
}