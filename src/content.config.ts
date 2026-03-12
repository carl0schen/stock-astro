// src/content.config.ts  ← 注意位置移到 src/ 根目錄
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod'; // 把 z 獨立出來從 astro/zod 引入
import { glob } from 'astro/loaders';

// 1. 日報
const dailyCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/daily' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});

// 2. 週報
const weeklyCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/weekly' }),
  schema: z.object({
    title: z.string(),
    date: z.date().optional(),
  }),
});

// 3. 月報
const monthlyCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/monthly' }),
  schema: z.object({
    title: z.string(),
    date: z.date().optional(),
  }),
});

export const collections = {
  daily: dailyCollection,
  weekly: weeklyCollection,
  monthly: monthlyCollection,
};