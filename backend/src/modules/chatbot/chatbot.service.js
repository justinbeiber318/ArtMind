import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const SYSTEM_PROMPT = `You are the Aurelis gallery concierge — a knowledgeable, concise art assistant.
You help visitors with: explanations of artworks and movements, artist biographies,
style descriptions, collection suggestions, and navigating the Aurelis website
(Gallery, AI Search, AI Recognition, Favorites, Dashboard pages).
Stay focused on visual art. Be warm but never verbose. If asked something outside
art or the gallery, gently steer back.`;

// Lazily create the OpenAI client so the app still boots without a key
// (chatbot endpoints then return a clear error instead of crashing on import).
let clientPromise = null;
async function getClient() {
  if (!env.openai.apiKey) {
    throw ApiError.badRequest('Chatbot is not configured: missing OPENAI_API_KEY');
  }
  if (!clientPromise) {
    clientPromise = import('openai').then(({ default: OpenAI }) =>
      new OpenAI({ apiKey: env.openai.apiKey, baseURL: env.openai.baseURL }));
  }
  return clientPromise;
}

export const chatbotService = {
  async chat({ message, history = [], userId }) {
    const client = await getClient();

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: env.openai.model,
      temperature: 0.6,
      max_tokens: 500,
      messages,
    });

    const reply = completion.choices[0].message.content.trim();
    const tokensUsed = completion.usage?.total_tokens ?? null;

    await prisma.chatLog.create({
      data: { userId: userId ?? null, prompt: message, response: reply, tokensUsed },
    });

    return { reply, tokensUsed };
  },

  // Used by the painting page to generate an editorial AI summary.
  async summarisePainting(painting) {
    const client = await getClient();
    const facts = [
      `Title: ${painting.title}`,
      `Artist: ${painting.artist?.name ?? 'Unknown'}`,
      `Style: ${painting.style?.name ?? 'n/a'}`,
      `Medium: ${painting.medium ?? 'n/a'} on ${painting.surface ?? 'n/a'}`,
      painting.year ? `Year: ${painting.year}` : '',
      `Description: ${painting.description}`,
    ].filter(Boolean).join('\n');

    const completion = await client.chat.completions.create({
      model: env.openai.model,
      temperature: 0.7,
      max_tokens: 220,
      messages: [
        { role: 'system', content: 'You are an art curator writing a 3-4 sentence wall label. Elegant, factual, evocative.' },
        { role: 'user', content: facts },
      ],
    });
    return completion.choices[0].message.content.trim();
  },
};
