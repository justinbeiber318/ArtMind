# Installation Guide

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18 LTS or 20 LTS | TensorFlow.js native bindings prefer an LTS release. |
| npm | 9+ | Ships with Node. |
| MySQL | 8.0+ | A local server or a managed instance (PlanetScale, RDS, etc.). |
| Build tools | — | `python3` + a C/C++ toolchain are needed only if `@tensorflow/tfjs-node` compiles from source. |

Optional (features activate when present): an **OpenAI API key** and a **Cloudinary** account.

---

## 1. Database

Create a database and a user:

```sql
CREATE DATABASE artmind CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'artmind'@'%' IDENTIFIED BY 'a-strong-password';
GRANT ALL PRIVILEGES ON artmind.* TO 'artmind'@'%';
FLUSH PRIVILEGES;
```

## 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set at minimum `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`
(see `docs/ENVIRONMENT.md`). Then:

```bash
npm install
npm run prisma:generate
```

Create the tables — either let Prisma manage migrations:

```bash
npm run prisma:migrate        # interactive, creates a migration
# in production use: npm run prisma:deploy
```

…or apply the raw schema directly:

```bash
mysql -u artmind -p artmind < prisma/schema.sql
```

Load sample data (≈40 paintings, artists, categories, styles, an admin and a demo user):

```bash
npm run seed
```

Start the API:

```bash
npm run dev        # development, with reload
# npm start        # production
```

The API listens on `http://localhost:4000`. Verify with `curl http://localhost:4000/api/health`.

## 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`. Vite proxies `/api` to `http://localhost:4000`
(see `vite.config.js`), so no extra CORS setup is needed in development.

## 4. Sign in

- Admin: `admin@artmind.test` / `Admin1234`
- Demo user: `demo@artmind.test` / `Demo1234`

The admin account unlocks `/admin` (analytics + management).

---

## Troubleshooting

- **`@tensorflow/tfjs-node` fails to install/build** — this is now an *optional* dependency, so
  a failed native build no longer aborts `npm install`; npm prints a warning and continues, and
  the recognition endpoint runs in color-only mode. If a previous failed attempt left a locked
  partial folder (Windows `EPERM ... rmdir node_modules\@tensorflow`), delete `node_modules` and
  `package-lock.json` and reinstall:
  ```bash
  # Windows PowerShell
  Remove-Item -Recurse -Force node_modules, package-lock.json
  npm install
  ```
  To enable real MobileNet classification, use **Node 20 LTS** (prebuilt TF binaries don't exist
  for Node 23/24), or install the "Desktop development with C++" workload from Visual Studio
  Build Tools so it can compile from source. See `docs/AI_NOTES.md`.
- **Prisma can't reach the database** — double-check `DATABASE_URL`
  (`mysql://user:pass@host:3306/artmind`) and that the server accepts your host/user.
- **401s right after login** — the refresh cookie is httpOnly and requires `withCredentials`,
  which the bundled Axios client already sets. Behind a proxy, make sure cookies aren't stripped.
- **Chatbot / AI summary return "not configured"** — set `OPENAI_API_KEY` in the backend `.env`.
