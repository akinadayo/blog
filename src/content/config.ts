import { defineCollection, z } from 'astro:content';

const techCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    coverImage: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const diaryCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    coverImage: z.string().optional(),
    pubDate: z.coerce.date(),
    mood: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  tech: techCollection,
  diary: diaryCollection,
};
