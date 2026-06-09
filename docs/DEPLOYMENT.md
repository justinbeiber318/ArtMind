# Production Deployment Guide

ArtMind has three deployable parts: a **MySQL database**, a **Node/Express API**, and a
**static React build**. They can live on different hosts.

---

## 1. Database

Use a managed MySQL 8 instance (AWS RDS, Google Cloud SQL, PlanetScale, DigitalOcean, etc.).

1. Create a database with `utf8mb4` charset.
2. Apply the schema with Prisma migrations (recommended) or the raw DDL:
   ```bash
   # from backend/, with DATABASE_URL pointing at production
   npm run prisma:deploy        # applies committed migrations
   # or
   mysql -h <host> -u <user> -p <db> < prisma/schema.sql
   ```
3. Optionally seed reference data once: `npm run seed` (or load your own catalogue).
4. Restrict network access to the API host only; never expose the DB publicly.

---

## 2. Backend API

Suitable hosts: Render, Railway, Fly.io, a VPS, or any container platform.

### Build & run

```bash
cd backend
npm ci
npm run prisma:generate
npm run prisma:deploy
node src/server.js          # or: npm start
```

### Production environment

Set the variables from `docs/ENVIRONMENT.md`, and in particular:

- `NODE_ENV=production` (issues `Secure`, `SameSite` refresh cookies).
- `CLIENT_ORIGIN=https://your-frontend-domain` (exact origin, for CORS + cookies).
- Strong, unique `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`.
- `OPENAI_API_KEY` and Cloudinary credentials if you want those features live.

### Process & reverse proxy

- Run under a process manager (`pm2`, systemd) or a container with a restart policy.
- Put Nginx/Caddy in front for TLS termination and to forward `/api` to the Node process.
- The app already uses Helmet; ensure your proxy forwards `X-Forwarded-*` headers and that
  TLS is enforced so cookies are sent only over HTTPS.

### TensorFlow.js note

`@tensorflow/tfjs-node` needs native bindings. On Alpine-based images install build deps
(`python3`, `make`, `g++`) or use a Debian-slim base. If you prefer not to ship native TF,
the recognition endpoint degrades to color-only analysis automatically — see `docs/AI_NOTES.md`.

### Containerization sketch

```dockerfile
FROM node:20-bookworm-slim
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run prisma:generate
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/server.js"]
```

---

## 3. Frontend

The frontend is a static Vite build — host it on Netlify, Vercel, Cloudflare Pages, S3+CloudFront,
or the same Nginx serving the API.

### Build

```bash
cd frontend
npm ci
npm run build          # outputs dist/
```

### Point the SPA at the API

In development, Vite proxies `/api`. In production you have two clean options:

1. **Same domain (recommended):** serve `dist/` and reverse-proxy `/api` to the backend on the
   same origin. No CORS, cookies "just work". The bundled Axios client already calls `/api`.
2. **Separate domains:** host the API at e.g. `api.yourdomain.com`, set `CLIENT_ORIGIN`
   accordingly, and change the Axios `baseURL` in `frontend/src/api/client.js` to the API URL.
   Cookies then require `SameSite=None; Secure` (already the case under `NODE_ENV=production`).

### SPA routing

Configure your static host to fall back to `index.html` for unknown paths (so client-side
routes like `/gallery` resolve). On Nginx: `try_files $uri /index.html;`.

---

## 4. Post-deploy checklist

- [ ] `GET https://api.yourdomain/api/health` returns `{ "status": "ok" }`.
- [ ] Register + login works and the refresh cookie is set with `Secure`.
- [ ] Gallery loads images and filtering/sorting/infinite-load work.
- [ ] Admin account can open `/admin` and charts render.
- [ ] (If configured) chatbot and AI summaries respond; recognition returns results.
- [ ] DB backups and secret rotation are scheduled.
