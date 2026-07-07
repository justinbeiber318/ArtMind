import { db } from '../../config/database.js';
import { env } from '../../config/env.js';

const COLOR_LEXICON = {
  blue: '#1E3A5F', navy: '#1E3A5F', xanh: '#1E3A5F', 'xanh duong': '#1E3A5F',
  red: '#8B2E2E', crimson: '#8B2E2E', do: '#8B2E2E',
  green: '#3B5F3B', 'xanh la': '#3B5F3B', 'xanh luc': '#3B5F3B',
  gold: '#B8860B', vang: '#B8860B', yellow: '#D9B23A',
  black: '#1A1A1A', den: '#1A1A1A',
  white: '#F5F5F5', trang: '#F5F5F5',
  grey: '#808080', gray: '#808080', xam: '#808080',
  brown: '#5C4033', nau: '#5C4033',
  orange: '#C56A1A', cam: '#C56A1A',
  purple: '#5A3D6B', tim: '#5A3D6B',
  pink: '#C97B9A', hong: '#C97B9A',
};

const SORT_HINTS = {
  newest: ['new', 'newest', 'latest', 'recent', 'moi', 'moi nhat', 'gan day'],
  popular: ['popular', 'most viewed', 'famous', 'pho bien', 'xem nhieu', 'noi tieng'],
  trending: ['trending', 'hot', 'xu huong', 'dang hot'],
};

const SURFACE_ALIASES = {
  canvas: ['canvas', 'vai', 'toan'],
  paper: ['paper', 'giay'],
  wood: ['wood', 'go'],
  panel: ['panel', 'bang', 'tam'],
  linen: ['linen', 'lanh'],
};

const STOP_WORDS = new Set([
  'show', 'find', 'painting', 'paintings', 'art', 'artwork', 'artworks', 'with', 'of', 'on',
  'in', 'the', 'me', 'please', 'like', 'similar', 'to', 'by', 'and', 'or', 'for',
  'tim', 'kiem', 'timkiem', 'hien', 'thi', 'cho', 'toi', 'tranh', 'buc', 'anh', 've',
  'co', 'cua', 'trong', 'tren', 'theo', 'giong', 'tuong', 'tu', 'nhu', 'va', 'hoac',
]);

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(value) {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function includesPhrase(haystack, needle) {
  const normalizedNeedle = normalize(needle);
  return normalizedNeedle && haystack.includes(normalizedNeedle);
}

function bestMatch(list, q) {
  return list
    .map((item) => {
      const name = normalize(item.name);
      const slug = normalize(item.slug);
      const nameWords = words(item.name);
      const score =
        (q.includes(name) ? 6 : 0) +
        (q.includes(slug) ? 5 : 0) +
        nameWords.reduce((sum, word) => sum + (word.length > 2 && q.includes(word) ? 1 : 0), 0);
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.item;
}

function matchColor(q) {
  return Object.entries(COLOR_LEXICON)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([label]) => new RegExp(`\\b${label}\\b`).test(q))?.[1];
}

function matchSort(q) {
  return Object.entries(SORT_HINTS)
    .find(([, hints]) => hints.some((hint) => includesPhrase(q, hint)))?.[0];
}

function matchSurface(q, surfaces) {
  for (const [canonical, aliases] of Object.entries(SURFACE_ALIASES)) {
    if (!aliases.some((alias) => includesPhrase(q, alias))) continue;
    const matched = surfaces.find((surface) => normalize(surface).includes(canonical));
    return matched || canonical;
  }
  return surfaces.find((surface) => includesPhrase(q, surface));
}

function matchReferencedPainting(q, paintings) {
  return paintings
    .map((painting) => {
      const title = normalize(painting.title);
      const score = q.includes(title)
        ? title.length
        : words(title).reduce((sum, word) => sum + (word.length > 3 && q.includes(word) ? 1 : 0), 0);
      return { painting, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.painting;
}

function buildResidual(text, filters) {
  const consumed = new Set([
    ...Object.keys(COLOR_LEXICON),
    ...Object.values(SORT_HINTS).flat(),
    ...Object.values(SURFACE_ALIASES).flat(),
    filters.style,
    filters.category,
    filters.artist,
    filters.surface,
  ].filter(Boolean).flatMap(words));

  return words(text)
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word))
    .filter((word) => !consumed.has(word))
    .join(' ')
    .trim();
}

function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

/**
 * NLP search: fast rule-based parsing handles common English/Vietnamese
 * prompts first. Gemini/OpenAI-compatible parsing is used as a fallback for
 * fuzzy prompts that the deterministic parser cannot structure.
 */
export const searchService = {
  async resolveVocabulary() {
    const [categories, styles, artists, paintings] = await Promise.all([
      db.category.findMany({ select: { name: true, slug: true } }),
      db.style.findMany({ select: { name: true, slug: true } }),
      db.artist.findMany({ select: { name: true, slug: true } }),
      db.painting.findMany({
        take: 200,
        orderBy: { viewCount: 'desc' },
        include: { artist: true, category: true, style: true },
      }),
    ]);
    const surfaces = [...new Set(paintings.map((painting) => painting.surface).filter(Boolean))];
    return { categories, styles, artists, paintings, surfaces };
  },

  parseRuleBased(text, vocab) {
    const q = normalize(text);
    const filters = {};

    const style = bestMatch(vocab.styles, q);
    const category = bestMatch(vocab.categories, q);
    const artist = bestMatch(vocab.artists, q);
    const painting = matchReferencedPainting(q, vocab.paintings);

    if (style) filters.style = style.slug;
    if (category) filters.category = category.slug;
    if (artist) filters.artist = artist.slug;

    const color = matchColor(q);
    if (color) filters.color = color;

    const surface = matchSurface(q, vocab.surfaces);
    if (surface) filters.surface = surface;

    const sort = matchSort(q);
    if (sort) filters.sort = sort;

    const wantsSimilar = /\b(similar|like|giong|tuong tu|nhu)\b/.test(q);
    if (painting && wantsSimilar) {
      filters.style ||= painting.style?.slug;
      filters.category ||= painting.category?.slug;
      filters.artist ||= painting.artist?.slug;
      filters.search ||= painting.title;
    } else if (painting && !filters.search) {
      filters.search = painting.title;
    }

    const residual = buildResidual(text, filters);
    if (residual && !filters.search) filters.search = residual;

    return cleanFilters(filters);
  },

  async parseWithLLM(text, vocab) {
    if (!env.openai.apiKey) return null;
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: env.openai.apiKey, baseURL: env.openai.baseURL });

    const system = `You translate art-gallery search queries into JSON filters.
Allowed keys: category (slug), style (slug), artist (slug), color (hex), surface, sort (newest|popular|trending), search (free text).
Understand both English and Vietnamese.
Valid categories: ${vocab.categories.map((c) => c.slug).join(', ')}.
Valid styles: ${vocab.styles.map((s) => s.slug).join(', ')}.
Valid artists: ${vocab.artists.slice(0, 80).map((a) => a.slug).join(', ')}.
Known surfaces: ${vocab.surfaces.join(', ')}.
Return ONLY minified JSON, no prose.`;

    const completion = await client.chat.completions.create({
      model: env.openai.model,
      temperature: 0,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });
    try {
      return cleanFilters(JSON.parse(completion.choices[0].message.content));
    } catch {
      return null;
    }
  },

  async search(text, pagination) {
    const vocab = await this.resolveVocabulary();
    let filters = this.parseRuleBased(text, vocab);

    const meaningful = ['style', 'category', 'artist', 'color', 'surface'].some((key) => filters[key]);
    const onlyFreeText = Boolean(filters.search) && !meaningful;
    if (!meaningful || onlyFreeText) {
      const llm = await this.parseWithLLM(text, vocab);
      if (llm) filters = cleanFilters({ ...filters, ...llm });
    }

    const { paintingService } = await import('../painting/painting.service.js');
    let { items, total } = await paintingService.list(filters, pagination);

    if (total === 0 && filters.search && Object.keys(filters).length > 1) {
      const relaxedFilters = { ...filters };
      delete relaxedFilters.search;
      ({ items, total } = await paintingService.list(relaxedFilters, pagination));
      filters = { ...relaxedFilters, relaxedFrom: 'search' };
    }

    await db.analytics.create({
      data: { metric: 'search', metadata: { query: text, filters } },
    });

    return { filters, items, total };
  },
};
