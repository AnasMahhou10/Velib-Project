# Velib Ride Planner

Application pour organiser des balades Vélib' à Paris : carte des stations, création de balade (départ / arrivée), inscription et statistiques (distance, calories).

**Dépôt :** [github.com/AnasMahhou10/Velib-Project](https://github.com/AnasMahhou10/Velib-Project)

## Stack

Next.js 16 · React 19 · PostgreSQL · Prisma · JWT (jose) · bcrypt · Leaflet · TypeScript · Zod · Vitest

## Démarrage rapide (Docker — recommandé)

```bash
git clone https://github.com/AnasMahhou10/Velib-Project.git
cd Velib-Project
cp .env.example .env
docker compose up --build
```

Ouvre [http://localhost:3001](http://localhost:3001) (Docker utilise le port **3001** pour éviter le conflit avec `npm run dev` sur 3000). Le conteneur `app` définit `DATABASE_URL` vers `db` automatiquement ; `prisma generate` tourne au démarrage (entrypoint).

- Premier lancement : ~5–8 min (build + seed OpenData Paris).
- Le seed nécessite **Internet** (API OpenData Paris).
- Développement local sans Docker : `npm run dev` → [http://localhost:3000](http://localhost:3000).

## Démarrage local (sans Docker)

1. PostgreSQL avec une base `velib_db`.
2. Copier `.env.example` vers `.env` et adapter `DATABASE_URL` et `JWT_SECRET` (min. 16 caractères).
3. Commandes :

```bash
npm install          # postinstall lance prisma generate automatiquement
npm run db:push      # synchronise le schéma (colonne passwordHash, etc.)
npm run prisma:seed
npm run dev          # regénère le client Prisma puis démarre Next.js
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Lance le build |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires (Vitest) |
| `npm run prisma:generate` | Génère le client Prisma (aussi avant `dev` / `build`) |
| `npm run prisma:seed` | Import stations Velib + compte démo |

## Authentification (JWT)

- **Inscription :** [/register](http://localhost:3000/register)
- **Connexion :** [/login](http://localhost:3000/login)
- **Compte démo (seed) :** `demo@example.com` / `demo1234`
- JWT en cookie **httpOnly** `auth_token` ; secret `JWT_SECRET` dans `.env`
- Actions protégées : créer une balade, rejoindre, stats (l’id utilisateur vient du token, pas du body)

| Route | Auth |
|-------|------|
| `GET /api/stations`, `GET /api/ride-groups` | Public |
| `POST /api/ride-groups`, `POST .../join`, `GET /api/stats` | JWT requis |
| `POST /api/auth/register`, `login`, `logout`, `GET /api/auth/me` | Auth |

## Architecture

```
app/              Pages, login/register, API Routes
src/lib/auth/     JWT (jose), bcrypt, cookies, requireAuth
src/services/     rideGroup, stats, auth
prisma/           Schéma PostgreSQL + seed
middleware.ts     JWT sur routes API sensibles + x-request-id
```

Décisions documentées : [`docs/adr/`](docs/adr/) (dont [004-jwt-auth](docs/adr/004-jwt-auth.md)).

**Kickoff Pack (conception cours) :** [`docs/00-kickoff-pack/`](docs/00-kickoff-pack/) — brief, scope, domaine, ERD, architecture, ADR, dette, DoD.

## Dette restante

- Distance estimée (Haversine × 1,25), pas de routing OSM.
- `prisma db push` (pas de migrations versionnées en prod pour l’instant).
- Pas de refresh token / OAuth / rate limit login.

## Tests & CI

```bash
npm test
npm run lint
```

GitHub Actions sur chaque push (`/.github/workflows/ci.yml`) :
- **Qualité** — ESLint + build Next.js
- **Les tests** — Vitest
- **Docker** — `docker compose build`, démarrage stack, smoke tests API

## Licence

Projet pédagogique — Projet Technique 2025/2026.
