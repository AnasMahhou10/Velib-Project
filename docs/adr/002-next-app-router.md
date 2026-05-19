# ADR-002 — Next.js App Router

## Statut

Accepté

## Contexte

Besoin d’une UI React et d’API REST dans un seul dépôt, avec carte Leaflet côté client.

## Décision

Next.js 16 (App Router) : pages dans `app/`, API dans `app/api/`, import dynamique de la carte (`ssr: false`).

## Conséquences

- Full-stack monorepo, déploiement simple.
- Leaflet isolé du SSR via `dynamic()`.
- Routes API fines ; logique métier dans `src/services` et `src/lib`.
