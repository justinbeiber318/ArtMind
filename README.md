# ArtMind — AI-Powered Digital Art Gallery

A production-oriented, full-stack digital art gallery platform with a museum-grade
interface (Sotheby's / Christie's aesthetic), an AI recommendation engine, natural-language
search, an OpenAI concierge chatbot, and TensorFlow.js image recognition.

```
React (Vite) + Redux Toolkit + React Query   ⇆   Express + Prisma + MySQL
                                                   OpenAI · TensorFlow.js · Cloudinary
```

---

## What's in this repository

```
artmind/
├── backend/      Express API — Prisma ORM, JWT auth, AI services
├── frontend/     React (Vite) SPA — 12 pages, museum design system
├── docs/         API, installation, environment, structure, deployment, AI notes
└── README.md     (this file)
```

---

## Honest status of every deliverable

This is a genuine, runnable foundation built by hand — not a mock. Because several features
depend on **your own external accounts and live infrastructure** (an OpenAI key, a Cloudinary
account, a running MySQL server, and — for the deepest recognition accuracy — a fine-tuned
model), the table below states exactly what runs out of the box versus what needs your
credentials or further training. Nothing here is a stub with `TODO` comments; the AI services
make real calls when configured and degrade gracefully when not.

| Deliverable              | Status       | Notes                                                                  |
| ------------------------ | ------------ | ---------------------------------------------------------------------- |
| 1. Frontend source code  | **Complete** | All 12 pages + floating chatbot widget, wired to the API.              |
| 2. Backend source code   | **Complete** | 10 API modules, clean architecture, real implementations.              |
| 3. MySQL schema          | **Complete** | `backend/prisma/schema.sql` (raw DDL).                                 |
| 4. Prisma schema         | **Complete** | `backend/prisma/schema.prisma` (12 models).                            |
| 5. API documentation     | **Complete** | `docs/API.md`.                                                         |
| 6. Installation guide    | **Complete** | `docs/INSTALLATION.md`.                                                |
| 7. Environment variables | **Complete** | `docs/ENVIRONMENT.md` + `backend/.env.example`.                        |
| 8. Folder structure      | **Complete** | `docs/FOLDER_STRUCTURE.md`.                                            |
| 9. Sample seed data      | **Complete** | `backend/prisma/seed.js` — ~40 paintings, artists, admin + demo users. |
| 10. Deployment guide     | **Complete** | `docs/DEPLOYMENT.md`.                                                  |

**Features that work on first run (no external keys):** registration/login with JWT + refresh
rotation, full gallery browsing with filters/sort/infinite-load, painting details, favorites,
recommendations (hybrid content + collaborative), rule-based natural-language search, dominant
color extraction on uploaded images, dashboards, admin analytics with charts.

**Features that activate once you add credentials:**

- **OpenAI key** → the chatbot, AI painting summaries, and the LLM fallback in NL search.
  Without it, the chatbot returns a clear "not configured" message and search still works
  via the rule-based parser.
- **Cloudinary** → permanent hosting of user-uploaded images. Without it, recognition still
  runs on the in-memory buffer; the image just isn't persisted.
- **TensorFlow.js native bindings** → MobileNet style/category inference. Without them, the
  service falls back to color-based heuristics and still returns the full
  `{ style, category, colors, confidence, recommendations }` shape. See `docs/AI_NOTES.md`
  for how to fine-tune a proper art-style head.

---

## Quick start

Full details in `docs/INSTALLATION.md`. The short version:

```bash
# 1. Backend
cd backend
cp .env.example .env            # fill in DATABASE_URL + JWT secrets (OpenAI/Cloudinary optional)
npm install
npm run prisma:generate
npm run prisma:migrate          # or: mysql < prisma/schema.sql
npm run seed                    # loads ~40 paintings + admin/demo users
npm run dev                     # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

**Seeded accounts:** `admin@artmind.test / Admin1234` · `demo@artmind.test / Demo1234`
account: admin@aurelis.com / Admin123456
trnminh131@gmail.com / Minh1301@

---

## Design system

- **Palette:** White `#FFFFFF`, Light Gray `#F5F5F5`, Dark Gray `#2D2D2D`, Navy `#1E3A5F`.
- **Type:** Roboto (display) + Inter (body).
- **Principles:** sharp corners, generous whitespace, no gradients, no glassmorphism, no neon —
  a quiet, premium auction-house feel. Tokens live in `frontend/src/styles/global.css`.

---

## Security

JWT access tokens (short-lived, in memory) + httpOnly refresh cookie with server-side rotation,
bcrypt password hashing (cost 12), Zod input validation on every write, Helmet, configurable
CORS with credentials, and tiered rate limiting (general / auth / AI endpoints).

See `docs/API.md` for the full endpoint reference.
