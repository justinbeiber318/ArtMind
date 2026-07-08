// Deterministic, URL-safe slug. Appends a short suffix when collisions
// are possible (callers pass a uniqueness checker).
export const slugify = (input) =>
  input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export async function uniqueSlug(base, exists) {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  while (await exists(candidate)) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}
