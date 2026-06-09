# Folder Structure

```
artmind/
├── README.md
├── docs/
│   ├── API.md                 # Endpoint reference
│   ├── INSTALLATION.md        # Local setup
│   ├── ENVIRONMENT.md         # Env var reference
│   ├── FOLDER_STRUCTURE.md    # This file
│   ├── DEPLOYMENT.md          # Production deployment
│   └── AI_NOTES.md            # TensorFlow.js recognition notes
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma data model (12 models)
│   │   ├── schema.sql         # Equivalent raw MySQL DDL
│   │   └── seed.js            # Sample data loader
│   └── src/
│       ├── server.js          # Boot + graceful shutdown
│       ├── app.js             # Express app, middleware, route mounting
│       ├── config/
│       │   ├── env.js         # Validated env access
│       │   ├── prisma.js      # Prisma client singleton
│       │   └── cloudinary.js  # Upload helper
│       ├── middleware/
│       │   ├── auth.js        # requireAuth / optionalAuth / requireAdmin
│       │   ├── validate.js    # Zod request validation
│       │   ├── errorHandler.js
│       │   ├── rateLimit.js   # Tiered limiters
│       │   └── upload.js      # Multer (memory storage)
│       ├── utils/
│       │   ├── ApiError.js    # Typed errors
│       │   ├── asyncHandler.js
│       │   ├── password.js    # bcrypt helpers
│       │   ├── tokens.js      # JWT sign/verify
│       │   ├── slug.js
│       │   └── pagination.js
│       └── modules/           # One folder per domain (clean architecture)
│           ├── auth/          # service · controller · validation · routes
│           ├── user/
│           ├── painting/
│           ├── artist/
│           ├── category/
│           ├── favorite/
│           ├── recommendation/
│           ├── search/
│           ├── chatbot/
│           ├── recognition/   # + colorExtractor.js
│           └── analytics/
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js         # Dev server + /api proxy
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── main.jsx           # Providers (Redux, React Query, Router)
        ├── App.jsx            # Routes + layout + route guards
        ├── styles/
        │   └── global.css     # Design tokens + base styles
        ├── api/
        │   ├── client.js      # Axios instance + refresh interceptor
        │   └── endpoints.js   # Typed API functions per module
        ├── app/
        │   └── store.js       # Redux Toolkit store
        ├── features/
        │   └── auth/
        │       └── authSlice.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── PaintingCard.jsx
        │   └── ChatbotWidget.jsx   # Floating AI chat (the "Chatbot" page)
        └── pages/
            ├── Home.jsx
            ├── Gallery.jsx
            ├── PaintingDetails.jsx
            ├── AISearch.jsx
            ├── AIRecognition.jsx
            ├── Dashboard.jsx
            ├── Favorites.jsx
            ├── Profile.jsx
            ├── Login.jsx
            ├── Register.jsx
            └── AdminDashboard.jsx
```

## Architectural conventions

- **Backend** uses a per-domain module layout. Each module owns its routing, request
  validation, controller (HTTP concerns), and service (business logic + data access). Shared
  concerns live in `config/`, `middleware/`, and `utils/`. `app.js` only wires things together.
- **Frontend** keeps server state in React Query (`api/endpoints.js`) and only auth/session
  state in Redux (`features/auth`). Pages compose presentational components; the design system
  is centralized in `styles/global.css` rather than scattered across files.
