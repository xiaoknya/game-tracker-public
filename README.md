# Game Tracker Public

Public-facing frontend for the Game Tracker data service.

This project is intentionally separated from the internal Vue admin frontend in
`game-tracker/frontend`. It does not include Feishu login, admin tools, cookie
upload flows, scheduler controls, or operator-only write actions.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- lucide-react

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Default API target:

```env
NEXT_PUBLIC_GAME_TRACKER_API_BASE=http://localhost:8000/api
```

The dev server runs on:

```text
http://localhost:3000
```

## Pages

- `/` public heat ranking for upcoming games
- `/calendar` release calendar grouped by month
- `/released` recently released games
- `/games/[id]` public game dossier

## API Usage

The frontend currently consumes public read-only endpoints from the existing
FastAPI service:

- `GET /api/games`
- `GET /api/games/fuzzy`
- `GET /api/games/released`
- `GET /api/games/{id}`
- `GET /api/games/{id}/trend`
- `GET /api/games/{id}/scores`
- `GET /api/games/{id}/review-monthly`
- `GET /api/games/{id}/review-summary`
- `GET /api/games/{id}/similar`

For production public launch, the backend should ideally expose `/api/public/*`
schemas that hide internal audit fields such as Feishu `open_id` values.

## Scripts

```bash
npm run lint
npm run build
npm run dev
```

`dev` and `build` explicitly use `--webpack` because the current Windows local
environment reports an invalid native Next SWC binding and Turbopack requires
native bindings. Webpack builds successfully with the WASM fallback.

