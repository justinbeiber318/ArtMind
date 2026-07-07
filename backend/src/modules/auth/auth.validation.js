import { z } from 'zod';

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character');

export const registerSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
      password: passwordRules,
      confirmPassword: z.string(),
      name: z.string().min(2).max(80),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});
