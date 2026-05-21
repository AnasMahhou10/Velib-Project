# Kickoff Pack — Velib Ride Planner

Dossier de conception (cours [Projet technique — Chapitre 1](https://ic-etagsolutions.com/cours/Projet-technique/chapitre-1/cours.html)).

**Projet :** organiser des balades Vélib' à Paris — carte, comptes, balades, statistiques.  
**Dépôt :** [github.com/AnasMahhou10/Velib-Project](https://github.com/AnasMahhou10/Velib-Project)  
**Rendu MVP :** 22/05/2026

## Livrables

| # | Fichier | Contenu |
|---|---------|---------|
| 1 | [01-project-brief.md](./01-project-brief.md) | Brief projet |
| 2 | [02-product-scope.md](./02-product-scope.md) | Périmètre MoSCoW + auth |
| 3 | [03-domain-model.md](./03-domain-model.md) | Métier, RBAC, BR, API |
| 4 | [04-database.md](./04-database.md) | ERD + dictionnaire |
| 5 | [05-architecture.md](./05-architecture.md) | Architecture + JWT |
| 6 | [06-adr/](./06-adr/) | **4 ADR** (001–004, dont JWT) |
| 7 | [07-tech-debt-register.md](./07-tech-debt-register.md) | Dette technique |
| 8 | [08-definition-of-done.md](./08-definition-of-done.md) | Definition of Done |

## Authentification (implémentée)

- Inscription : `/register` — connexion automatique après succès
- Connexion : `/login` — JWT en cookie **httpOnly** `auth_token`
- Secret : `JWT_SECRET` dans `.env` (voir `.env.example`)
- Décision : [ADR-004](./06-adr/ADR-004-jwt-auth.md)

## ERD

- Source : [`images/erd.puml`](./images/erd.puml) (inclut `passwordHash`)
- Image : [`images/erd.png`](./images/erd.png)
- Schéma : [`prisma/schema.prisma`](../../prisma/schema.prisma)

## Synchroniser la BDD (dev)

```bash
npm run db:push    # ou npm run db:fix si passwordHash NULL
npm run prisma:seed
```

## ADR

| ADR | Sujet |
|-----|--------|
| [001](./06-adr/ADR-001-postgresql-prisma.md) | PostgreSQL + Prisma |
| [002](./06-adr/ADR-002-next-app-router.md) | Next.js App Router |
| [003](./06-adr/ADR-003-mvp-sans-auth.md) | Historique MVP sans auth |
| [004](./06-adr/ADR-004-jwt-auth.md) | **JWT + bcrypt** |

Copies racine : [`docs/adr/`](../adr/).
