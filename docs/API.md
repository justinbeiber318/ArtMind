# ArtMind API Reference

Base URL: `http://localhost:4000/api` (development)

All responses follow a consistent envelope:

```json
{ "success": true, "data": { ... }, "meta": { ... } }
```

Errors:

```json
{ "success": false, "message": "Human-readable message", "code": "OPTIONAL_CODE" }
```

## Authentication

- Access token is returned by `register` / `login` in `data.accessToken` and must be sent as
  `Authorization: Bearer <token>` on protected routes.
- A refresh token is set as an httpOnly cookie (`artmind_rt`). Call `POST /auth/refresh`
  (with credentials) to rotate it and obtain a new access token.
- Routes marked **Auth** require a valid access token; **Admin** additionally require `role = ADMIN`.

Rate limits: general `300 / 15 min`, auth `20 / 15 min`, AI endpoints `15 / min`.

---

## Auth — `/api/auth`

| Method | Path | Access | Body | Description |
|---|---|---|---|---|
| POST | `/register` | Public | `{ name, email, password }` | Create account, returns `{ user, accessToken }`. |
| POST | `/login` | Public | `{ email, password }` | Returns `{ user, accessToken }`. |
| POST | `/refresh` | Cookie | — | Rotates refresh cookie, returns `{ accessToken }`. |
| POST | `/logout` | Auth | — | Clears stored refresh token. |

## Users — `/api/users`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/me` | Auth | Current profile. |
| PATCH | `/me` | Auth | Update `{ name?, bio?, avatarUrl? }`. |
| GET | `/dashboard` | Auth | `{ recentlyViewed, favorites, recommendations, collections, activity }`. |
| GET | `/` | Admin | Paginated user list. |
| PATCH | `/:id/role` | Admin | Set `{ role: "USER" | "ADMIN" }`. |
| DELETE | `/:id` | Admin | Remove a user. |

## Paintings — `/api/paintings`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List with filters. |
| GET | `/:slug` | Public | Single painting (increments view count). |
| GET | `/:slug/ai-summary` | Public | Cached or freshly generated AI summary (needs OpenAI key). |
| GET | `/:id/similar` | Public | Content-based similar works. |
| POST | `/` | Admin | Create. |
| PATCH | `/:id` | Admin | Update. |
| DELETE | `/:id` | Admin | Delete. |

**List query params:** `page`, `limit`, `search`, `category` (slug), `style` (slug),
`artist` (slug), `surface`, `color` (hex), `sort` (`newest` | `popular` | `trending`).
Returns `data: Painting[]` with `meta: { page, limit, total, totalPages }`.

## Artists — `/api/artists`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Paginated artists. |
| GET | `/popular` | Public | Artists ranked by total views. |
| GET | `/:slug` | Public | Single artist. |
| POST / PATCH / DELETE | … | Admin | Manage artists. |

## Categories — `/api/categories`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Categories with painting counts. |
| GET | `/styles` | Public | Styles with painting counts. |
| POST | `/` | Admin | Create category. |
| POST | `/styles` | Admin | Create style. |
| DELETE | `/:id` | Admin | Delete category. |

## Favorites — `/api/favorites`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Auth | Current user's favorite paintings. |
| POST | `/:paintingId` | Auth | Toggle favorite, returns `{ favorited: boolean }`. Triggers async recommendation rebuild. |

## Recommendations — `/api/recommendations`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/preview` | Public | Trending-based preview for anonymous visitors. |
| GET | `/` | Auth | Personalized recommendations (cold-start rebuild if empty). |
| POST | `/rebuild` | Auth | Force a rebuild of the user's recommendations. |

Hybrid engine: content affinity (favorites weighted ×3, history ×1 across category / style /
color) + collaborative signal from users sharing favorites + a popularity prior from
`trendingScore`.

## Search — `/api/search`

| Method | Path | Access | Body | Description |
|---|---|---|---|---|
| POST | `/` | Public (AI-limited) | `{ query }` | Natural-language search. |

Parses intent rule-based first (style, category, artist, color, surface, sort + free text),
falling back to an OpenAI JSON parse when a key is configured. Returns matched paintings plus
`meta.parsedFilters` showing how the query was interpreted.

## Chatbot — `/api/chatbot`

| Method | Path | Access | Body | Description |
|---|---|---|---|---|
| POST | `/` | Optional auth (AI-limited) | `{ message, history? }` | Concierge assistant. Requires OpenAI key; logs to `chat_logs`. |

## Recognition — `/api/recognition`

| Method | Path | Access | Body | Description |
|---|---|---|---|---|
| POST | `/` | Public (AI-limited) | `multipart/form-data` field `image` | Returns `{ style, category, colors, confidence, recommendations, imageUrl }`. |

Uses MobileNet (TensorFlow.js) for classification mapped to art-style buckets, plus
sharp-based dominant-color extraction. Degrades to color-only heuristics if native bindings
are unavailable. JPEG/PNG/WebP, up to 8 MB.

## Analytics — `/api/analytics` (all **Admin**)

| Method | Path | Returns |
|---|---|---|
| GET | `/overview` | `{ users, paintings, artists, totalViews, searches, recognitions }`. |
| GET | `/most-viewed` | Top paintings by view count. |
| GET | `/categories` | Categories by views + counts. |
| GET | `/styles` | Styles by average trending score. |
| GET | `/user-growth` | Daily new-user counts (30 days, zero-filled). |
| GET | `/ai-logs` | Recent chatbot interactions. |

## Health

`GET /api/health` → `{ status: "ok" }`.
