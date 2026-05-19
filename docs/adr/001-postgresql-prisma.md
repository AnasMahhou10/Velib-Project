# ADR-001 — PostgreSQL et Prisma

## Statut

Accepté

## Contexte

Le projet gère des utilisateurs, stations, balades et participations avec des relations (FK).

## Décision

PostgreSQL + Prisma ORM (client `@prisma/client`).

## Conséquences

- Intégrité référentielle et requêtes relationnelles typées.
- Migrations / `db push` via Prisma CLI.
- Dépendance à `DATABASE_URL` en environnement.
