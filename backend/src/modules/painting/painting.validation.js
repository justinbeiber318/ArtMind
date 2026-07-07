import { z } from 'zod';

const nullableText = z.string().trim().nullable().optional();
const nullableUrl = z.string().url().nullable().optional();
const nullableNumber = z.number().nullable().optional();
const nullableInt = z.number().int().nullable().optional();

export const createSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2),
    description: z.string().trim().min(10),
    imageUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    medium: z.string().trim().optional(),
    surface: z.string().trim().optional(),
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
  body: z.object({
    title: z.string().trim().min(2).optional(),
    description: z.string().trim().min(10).optional(),
    imageUrl: z.string().url().optional(),
    thumbnailUrl: nullableUrl,
    medium: nullableText,
    surface: nullableText,
    dominantColors: z.array(z.string()).nullable().optional(),
    widthCm: z.number().positive().nullable().optional(),
    heightCm: z.number().positive().nullable().optional(),
    year: nullableInt,
    price: nullableNumber.refine((value) => value == null || value >= 0, 'Price must be nonnegative'),
    featured: z.boolean().optional(),
    artistId: z.number().int().optional(),
    categoryId: z.number().int().optional(),
    styleId: nullableInt,
  }),
});
