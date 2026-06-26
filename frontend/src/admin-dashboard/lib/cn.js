import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...args) => twMerge(clsx(...args));

export const truncate = (s, n) =>
  s && s.length > n ? `${s.slice(0, n)}…` : s || '';
