import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const SYSTEM_PROMPT = `You are the Aurelis gallery concierge - a knowledgeable, concise art assistant.
You help visitors with: explanations of artworks and movements, artist biographies,
style descriptions, collection suggestions, and navigating the Aurelis website
(Gallery, AI Search, AI Recognition, Favorites, Dashboard pages).
Detect the visitor's language from their latest message and reply in that same
language. If the latest message is too short to identify, use the most recent
user messages as context. Do not translate artwork names, artist names, or
Aurelis page names unless a natural translation exists in that language.
Stay focused on visual art. Be warm but never verbose. If asked something outside
art or the gallery, gently steer back.`;

function detectLanguageHint(message, history = []) {
  const latestUserMessages = [
    ...history.filter((m) => m.role === 'user').slice(-2).map((m) => m.content),
    message,
  ].join('\n');
  const normalized = latestUserMessages.toLowerCase();

  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(normalized)) {
    return 'Vietnamese';
  }
  if (/\b(toi|ban|minh|hay|la|cua|tranh|nghe thuat|tieng viet)\b/.test(normalized)) {
    return 'Vietnamese';
  }
  if (/[\u3040-\u30ff]/.test(normalized)) return 'Japanese';
  if (/[\uac00-\ud7af]/.test(normalized)) return 'Korean';
  if (/[àâçéèêëîïôûùüÿœæ]/i.test(normalized)) return 'French';
  if (/\b(francais|français|bonjour|merci|tableau|peinture|artiste)\b/.test(normalized)) {
    return 'French';
  }
  return null;
}

function fallbackReply(message, history = []) {
  const languageHint = detectLanguageHint(message, history);
  if (languageHint === 'Vietnamese') {
    return 'Xin chào! Hiện tại kết nối AI bên ngoài đang tạm lỗi, nhưng tôi vẫn có thể hỗ trợ bạn về Aurelis: tìm tranh, giải thích phong cách hội họa, gợi ý tác phẩm, hoặc hướng dẫn dùng AI Recognition.';
  }
  return 'Hello! The external AI provider is temporarily unavailable, but I can still help with Aurelis: finding artworks, explaining painting styles, suggesting collection matches, or guiding you through AI Recognition.';
}

// Lazily create the OpenAI client so the app still boots without a key.
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
    let client;
    try {
      client = await getClient();
    } catch (err) {
      console.warn('Chatbot provider is not configured, using fallback:', err.message);
      return { reply: fallbackReply(message, history), tokensUsed: null, fallback: true };
    }

    const languageHint = detectLanguageHint(message, history);
    const systemPrompt = languageHint
      ? `${SYSTEM_PROMPT}\n\nThe visitor's current language appears to be ${languageHint}. Reply in ${languageHint}.`
      : SYSTEM_PROMPT;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: env.openai.model,
        temperature: 0.6,
        max_tokens: 500,
        messages,
      });
    } catch (err) {
      console.warn('AI provider unavailable, using chatbot fallback:', err.message);
      return { reply: fallbackReply(message, history), tokensUsed: null, fallback: true };
    }

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new ApiError(502, 'AI provider returned an empty chatbot response');
    }
    const tokensUsed = completion.usage?.total_tokens ?? null;

    try {
      await prisma.chatLog.create({
        data: { userId: userId ?? null, prompt: message, response: reply, tokensUsed },
      });
    } catch (err) {
      console.error('Failed to save chatbot log', err);
    }

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
