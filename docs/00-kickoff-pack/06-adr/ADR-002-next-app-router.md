# ADR-002 — Next.js App Router

## Statut

Accepté

## Contexte

Besoin d'une UI React et d'API REST dans un seul dépôt, avec carte Leaflet côté client (accès `window`, pas de SSR carte).

## Décision

- **Framework :** Next.js 16, App Router
- **Pages :** `app/page.tsx`, `app/rides/page.tsx`, `app/login/`, `app/register/`
- **API :** `app/api/**/route.ts` (dont `app/api/auth/`)
- **Contexte client :** `AuthProvider` + `AuthNav`
- **Carte :** import dynamique `StationsMap` avec `ssr: false`
- **Logique métier :** hors routes — `src/services/`, `src/lib/`

## Alternatives envisagées

| Option | Écarté car |
|--------|------------|
| Pages Router (legacy) | App Router = standard Next 13+ |
| Backend Express séparé | Deux déploiements, plus de boilerplate au MVP |
| SPA Vite + API externe | Pas de SSR/API intégrée Next |

## Conséquences

- Monorepo full-stack, un seul `npm run build`
- Leaflet isolé du SSR
- Routes API fines ; testabilité métier via services + Vitest sur `rideMetrics`
- Build Docker `standalone` possible via `next.config.ts`
