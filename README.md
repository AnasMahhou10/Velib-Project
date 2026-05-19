# Velib Ride Planner

Application pour organiser des balades Vélib' à Paris : carte des stations, création de balade (départ / arrivée), inscription et statistiques (distance, calories).

**Dépôt :** [github.com/AnasMahhou10/Velib-Project](https://github.com/AnasMahhou10/Velib-Project)

## Stack

Next.js 16 · React 19 · PostgreSQL · Prisma · Leaflet · TypeScript · Zod · Vitest

## Démarrage rapide (Docker — recommandé)

```bash
git clone https://github.com/AnasMahhou10/Velib-Project.git
cd Velib-Project
cp .env.example .env
docker compose up --build
```

Ouvre [http://localhost:3000](http://localhost:3000).

- Premier lancement : ~5–8 min (build + seed OpenData Paris).
- Le seed nécessite **Internet** (API OpenData Paris).

## Démarrage local (sans Docker)

1. PostgreSQL avec une base `velib_db`.
2. Copier `.env.example` vers `.env` et adapter `DATABASE_URL` (ex. `localhost:5432`).
3. Commandes :

```bash
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Lance le build |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires (Vitest) |
| `npm run prisma:seed` | Import stations Velib + user démo (id=1) |

## Architecture

```
app/              Pages et API Routes (Next.js App Router)
src/lib/          Métier (rideMetrics, enrichRide, schémas Zod)
src/services/     Services (rideGroup, stats)
prisma/           Schéma PostgreSQL + seed
middleware.ts     Logs API + x-request-id
```

Décisions documentées : [`docs/adr/`](docs/adr/).

## MVP & dette assumée

- Utilisateur fixe `userId = 1` (pas d’auth JWT au MVP).
- Distance estimée (Haversine × 1,25), pas de routing OSM.
- `prisma db push` (pas de migrations versionnées en prod pour l’instant).

## Tests & CI

```bash
npm test
npm run lint
```

GitHub Actions : lint + tests + build sur chaque push (`/.github/workflows/ci.yml`).

## Licence

Projet pédagogique — Projet Technique 2025/2026.
