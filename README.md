# ArtMind - AI-Powered Digital Art Gallery

A production-oriented, full-stack digital art gallery platform with a museum-grade
interface, an AI recommendation engine, natural-language search, an OpenAI concierge
chatbot, and TensorFlow.js image recognition.

```
React (Vite) + Redux Toolkit + React Query   <->   Express API + MySQL
                                                   OpenAI · TensorFlow.js · Cloudinary
```

---

## What's in this repository

```
artmind/
├── backend/      Express API, JWT auth, AI services
├── frontend/     React (Vite) SPA
├── docs/         API, installation, environment, structure, deployment, AI notes
└── README.md
```

---

## Honest status of every deliverable

| Deliverable              | Status       | Notes                                                                  |
| ------------------------ | ------------ | ---------------------------------------------------------------------- |
| 1. Frontend source code  | **Complete** | Pages + floating chatbot widget, wired to the API.                     |
| 2. Backend source code   | **Complete** | API modules use a MySQL adapter through `mysql2`.                      |
| 3. API documentation     | **Complete** | `docs/API.md`.                                                         |
| 4. Installation guide    | **Complete** | `docs/INSTALLATION.md`.                                                |
| 5. Environment variables | **Complete** | `docs/ENVIRONMENT.md`.                                                 |
| 6. Folder structure      | **Complete** | `docs/FOLDER_STRUCTURE.md`.                                            |
| 7. Deployment guide      | **Complete** | `docs/DEPLOYMENT.md`.                                                  |

**Features that work without external keys:** frontend screens, API health check, upload parsing,
color extraction, and fallback AI-service responses.

**Features that need configuration or follow-up work:**

- **MySQL Server** -> use the same connection settings as MySQL Workbench.
- **OpenAI key** -> the chatbot, AI painting summaries, and the LLM fallback in NL search.
- **Cloudinary** -> permanent hosting of user-uploaded images.
- **TensorFlow.js native bindings** -> MobileNet style/category inference; without them,
  recognition falls back to color-based heuristics.

---

## Quick start

Full details in `docs/INSTALLATION.md`. The short version:

```bash
# 1. Backend
cd backend
cp .env.example .env            # fill in DATABASE_URL + JWT secrets
npm install
npm run dev                     # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

---

## Design system

- **Palette:** White `#FFFFFF`, Light Gray `#F5F5F5`, Dark Gray `#2D2D2D`, Navy `#1E3A5F`.
- **Type:** Roboto (display) + Inter (body).
- **Principles:** sharp corners, generous whitespace, no gradients, no glassmorphism, no neon.

---

## Security

JWT access tokens, httpOnly refresh cookie flow, bcrypt password hashing, Zod validation, Helmet,
configurable CORS with credentials, and tiered rate limiting.

See `docs/API.md` for the full endpoint reference.
