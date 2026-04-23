# Backend (Node.js + Express + MongoDB)

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints (core)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `POST /api/recommendations/resume` (multipart `resume`)
- `GET /api/recommendations/me`
- `GET /api/careers`
- `GET /api/careers/:careerId`
- `GET /api/market-insights`
- `GET /api/skills`

