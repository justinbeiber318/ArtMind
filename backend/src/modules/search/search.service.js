import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';

// Known colour vocabulary mapped to representative hex values used in seed data.
const COLOR_LEXICON = {
  blue: '#1E3A5F', navy: '#1E3A5F', red: '#8B2E2E', crimson: '#8B2E2E',
  green: '#3B5F3B', gold: '#B8860B', yellow: '#D9B23A', black: '#1A1A1A',
  white: '#F5F5F5', grey: '#808080', gray: '#808080', brown: '#5C4033',
  orange: '#C56A1A', purple: '#5A3D6B', pink: '#C97B9A',
};

const SORT_HINTS = {
  newest: ['new', 'newest', 'latest', 'recent'],
  popular: ['popular', 'most viewed', 'famous'],
  trending: ['trending', 'hot'],
};

/**
 * NLP search: parses a free-text query like
 *   "show abstract blue paintings on canvas"
 * into structured filters. Rule-based parsing runs first (fast, deterministic);
 * when an OpenAI key is configured we use it as a fallback for fuzzier queries.
 */
export const searchService = {
  async resolveVocabulary() {
    const [categories, styles, artists] = await Promise.all([
      prisma.category.findMany({ select: { name: true, slug: true } }),
      prisma.style.findMany({ select: { name: true, slug: true } }),
      prisma.artist.findMany({ select: { name: true, slug: true } }),
    ]);
    return { categories, styles, artists };
  },

  parseRuleBased(text, vocab) {
    const q = text.toLowerCase();
    const filters = {};

    const matchTerm = (list) =>
      list.find((item) => q.includes(item.name.toLowerCase()))?.slug;

    filters.style = matchTerm(vocab.styles);
    filters.category = matchTerm(vocab.categories);
    filters.artist = matchTerm(vocab.artists);

    for (const [word, hex] of Object.entries(COLOR_LEXICON)) {
      if (new RegExp(`\\b${word}\\b`).test(q)) { filters.color = hex; break; }
    }
    if (/\b(canvas|panel|paper|wood|linen)\b/.test(q)) {
      filters.surface = q.match(/\b(canvas|panel|paper|wood|linen)\b/)[1];
    }
    for (const [sort, hints] of Object.entries(SORT_HINTS)) {
      if (hints.some((h) => q.includes(h))) { filters.sort = sort; break; }
    }

    // Leftover keywords become a free-text search fallback.
    const consumed = Object.values(filters).filter(Boolean).map(String);
    const residual = q
      .replace(/\b(show|find|paintings?|art(works?)?|with|of|on|in|the|me)\b/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !consumed.some((c) => c.includes(w)))
      .filter((w) => !Object.keys(COLOR_LEXICON).includes(w));
    if (residual.length) filters.search = residual.join(' ').trim();

    return filters;
  },

  async parseWithLLM(text, vocab) {
    if (!env.openai.apiKey) return null;
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: env.openai.apiKey, baseURL: env.openai.baseURL });

    const system = `You translate art-gallery search queries into JSON filters.
Allowed keys: category (slug), style (slug), artist (slug), color (hex), surface, sort (newest|popular|trending), search (free text).
Valid categories: ${vocab.categories.map((c) => c.slug).join(', ')}.
Valid styles: ${vocab.styles.map((s) => s.slug).join(', ')}.
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
      return JSON.parse(completion.choices[0].message.content);
    } catch {
      return null;
    }
  },

  async search(text, pagination) {
    const vocab = await this.resolveVocabulary();
    let filters = this.parseRuleBased(text, vocab);

    // If rule-based parsing extracted nothing meaningful, try the LLM.
    const meaningful = ['style', 'category', 'artist', 'color', 'surface'].some((k) => filters[k]);
    if (!meaningful) {
      const llm = await this.parseWithLLM(text, vocab);
      if (llm) filters = { ...filters, ...llm };
    }

    const { paintingService } = await import('../painting/painting.service.js');
    const { items, total } = await paintingService.list(filters, pagination);

    // Log for analytics.
    await prisma.analytics.create({
      data: { metric: 'search', metadata: { query: text, filters } },
    });

    return { filters, items, total };
  },
};
