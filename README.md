# Velib Ride Planner

Application pour organiser des balades Vélib' à Paris : carte des stations, création de balade (départ / arrivée), inscription et statistiques (distance, calories).

**Dépôt :** [github.com/AnasMahhou10/Velib-Project](https://github.com/AnasMahhou10/Velib-Project)

## Stack

Next.js 16 · React 19 · PostgreSQL · Prisma · JWT (jose) · bcrypt · Leaflet · TypeScript · Zod · Vitest

## Démarrage (Docker — recommandé)

Une seule commande après clone ou `git pull` :

```bash
git clone https://github.com/AnasMahhou10/Velib-Project.git
cd Velib-Project
docker compose up --build
```

- **URL :** [http://localhost:3000](http://localhost:3000) (Docker et dev local utilisent le même port)
- **Arrière-plan :** `docker compose up -d --build` ou `npm run docker:up`
- **Arrêt :** `docker compose down` ou `npm run docker:down`

Le conteneur `app` attend PostgreSQL, applique le schéma (`prisma db push`), lance le **seed** (stations OpenData + compte démo), puis démarre Next.js. **Internet requis** au premier lancement (API OpenData Paris).

| Commande npm | Équivalent |
|--------------|------------|
| `npm run docker` | `docker compose up --build` (logs au premier plan) |
| `npm run docker:up` | `docker compose up -d --build` |
| `npm run docker:down` | `docker compose down` |
| `npm run docker:refresh` | Rebuild complet après gros changements |

### Après un `git push` / `git pull`

```bash
docker compose up --build
```

GitHub Actions rebuild et teste l’image sur chaque push ; **en local**, il faut relancer la commande ci-dessus pour prendre le nouveau code (pas de mise à jour automatique du conteneur).

Rebuild forcé (cache Docker) :

```bash
npm run docker:refresh
```

Réinitialiser la base Docker : `docker compose down -v` puis `docker compose up --build`.

> Ne pas lancer `npm run dev` en même temps que Docker : les deux écoutent le port **3000**.

## Démarrage local (sans Docker)

Pour coder avec rechargement à chaud, Postgres doit tourner en local (pas le service `db` de Compose).

1. PostgreSQL avec une base `velib_db`.
2. Copier `.env.example` vers `.env` et adapter `DATABASE_URL` et `JWT_SECRET` (min. 16 caractères).
3. Commandes :

```bash
npm install
npm run db:push
npm run prisma:seed
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run docker` | Stack Docker (build + démarrage) |
| `npm run dev` | Serveur de développement (hors Docker) |
| `npm run build` | Build production |
| `npm run start` | Lance le build |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires (Vitest) |
| `npm run db:push` | Synchronise le schéma Prisma |
| `npm run db:fix` | Corrige `passwordHash` NULL + `db push` |
| `npm run prisma:seed` | Import stations Velib + compte démo |

## Authentification (JWT)

- **Inscription :** [/register](http://localhost:3000/register)
- **Connexion :** [/login](http://localhost:3000/login)
- **Compte démo (seed) :** `demo@example.com` / `demo1234`
- JWT en cookie **httpOnly** `auth_token` ; secret `JWT_SECRET` dans `.env` (optionnel pour Docker : valeur par défaut dans `docker-compose.yml`)
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
scripts/          docker-entrypoint.sh (db push + seed au démarrage)
```

Décisions documentées : [`docs/adr/`](docs/adr/) (dont [004-jwt-auth](docs/adr/004-jwt-auth.md)).

**Kickoff Pack (conception cours) :** [`docs/00-kickoff-pack/`](docs/00-kickoff-pack/) — brief, **user stories**, scope, domaine, ERD, architecture, ADR, dette, DoD.

## Dette restante

- Distance estimée (Haversine × 1,25), pas de routing OSM.
- `prisma db push` (pas de migrations versionnées en prod pour l’instant).
- Pas de refresh token / OAuth / rate limit login.

## Tests & CI

```bash
npm test
npm run lint
```

GitHub Actions sur chaque **push** (`/.github/workflows/ci.yml`) :
- **Qualité** — ESLint + build Next.js
- **Les tests** — Vitest
- **Docker** — `docker compose build` + stack + smoke tests sur **http://localhost:3000**

## Licence

Projet pédagogique — Projet Technique 2025/2026.
