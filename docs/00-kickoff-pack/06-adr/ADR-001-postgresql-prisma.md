# ADR-001 — PostgreSQL et Prisma

## Statut

Accepté

## Contexte

Le projet gère des utilisateurs, stations, balades et participations avec des relations (FK). Besoin d'intégrité référentielle et de requêtes jointes typées.

## Décision

- **SGBD :** PostgreSQL 16
- **ORM :** Prisma avec générateur `prisma-client-js` (`@prisma/client`)
- **Schéma :** `prisma/schema.prisma`
- **Sync dev/MVP :** `prisma db push` (+ seed `prisma/seed.cjs`)

## Alternatives envisagées

| Option | Écarté car |
|--------|------------|
| SQLite | Moins représentatif d'un déploiement multi-conteneurs |
| MongoDB | Relations N-N et FK moins naturelles pour ce modèle |
| SQL brut sans ORM | Plus lent à itérer pour un MVP pédagogique |

## Conséquences

- Intégrité référentielle et requêtes relationnelles typées
- `DATABASE_URL` obligatoire (local `localhost`, Docker `db`)
- `prisma generate` requis après clone (`postinstall` / entrypoint Docker)
- Migrations versionnées reportées (dette — voir registre 07)
