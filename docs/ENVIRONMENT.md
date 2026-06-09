# Environment Variables

All backend configuration lives in `backend/.env`. Copy `backend/.env.example` to start.
The frontend needs no env file in development — Vite proxies `/api` to the backend.

## Required

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `mysql://artmind:artmind@localhost:3306/artmind` | Prisma MySQL connection string. |
| `JWT_ACCESS_SECRET` | (32+ random chars) | Signs short-lived access tokens. |
| `JWT_REFRESH_SECRET` | (32+ random chars, different) | Signs refresh tokens. |

Generate strong secrets with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Server

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Set to `production` when deployed (enables Secure cookies, etc.). |
| `PORT` | `4000` | API listening port. |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin (your deployed frontend URL in prod). |

## Token lifetimes

| Variable | Default | Purpose |
|---|---|---|
| `JWT_ACCESS_TTL` | `15m` | Access token validity. |
| `JWT_REFRESH_TTL` | `7d` | Refresh token / cookie validity. |

## OpenAI (optional — enables chatbot, AI summaries, NLP search fallback)

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | — | Leave blank to disable AI text features (they fail gracefully). |
| `OPENAI_MODEL` | `gpt-4o-mini` | Chat/completion model. |

## Cloudinary (optional — persists uploaded images)

| Variable | Purpose |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name. |
| `CLOUDINARY_API_KEY` | API key. |
| `CLOUDINARY_API_SECRET` | API secret. |

If Cloudinary vars are blank, image recognition still runs against the uploaded buffer; the
image simply isn't stored remotely.

## Security notes

- Never commit a real `.env` — it is already in `.gitignore`.
- Use distinct secrets per environment, and rotate them if exposed.
- In production set `NODE_ENV=production` so the refresh cookie is issued with `Secure` and
  `SameSite` protections.
