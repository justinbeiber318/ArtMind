import { z } from 'zod';

export const createSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    imageUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    medium: z.string().optional(),
    surface: z.string().optional(),
    dominantColors: z.array(z.string()).optional(),
    widthCm: z.number().positive().optional(),
    heightCm: z.number().positive().optional(),
    year: z.number().int().optional(),
    price: z.number().nonnegative().optional(),
    featured: z.boolean().optional(),
    artistId: z.number().int(),
    categoryId: z.number().int(),
    styleId: z.number().int().optional(),
  }),
});

export const updateSchema = z.object({
  body: createSchema.shape.body.partial(),
});
