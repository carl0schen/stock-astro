// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// 1. 日報
const dailyCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});

// 2. 週報 (這段你原本缺少的)
const weeklyCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // 因為週報可能是 "2026-01-01" 這種格式，z.date() 也能讀
    // 設為 optional 以防萬一腳本沒跑出日期
    date: z.date().optional(), 
  }),
});

// 3. 月報 (這段你原本缺少的)
const monthlyCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date().optional(),
  }),
});

export const collections = {
  'daily': dailyCollection,
  'weekly': weeklyCollection,
  'monthly': monthlyCollection,
};