# POS Lite Web

Browser-based POS and shop management client for the existing POS Lite backend.

Current development version: **v0.1 — Foundation**

## Documentation

Project documents in `docs/` are the source of truth:

- `PRD.md`
- `UI_UX_GUIDELINES.md`
- `TECH_STACK.md`
- `AI_CODING_GUIDELINES.md`
- `VERSION_MANAGEMENT.md`
- `WEB_DEVELOPER_GUIDE.md`

## Getting started

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Configure the API base URL through environment variables. Do not hardcode it in components.

Development uses the Azure Canada API. Do not point local development at the South India production API.

```text
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_ENV=development
```

See `.env.example`.

## Scripts

```bash
npm run dev          # local development
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run build        # production build
```
