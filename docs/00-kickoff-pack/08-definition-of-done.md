# 08 — Definition of Done (conception)

Checklist Kickoff Pack + MVP — **à jour avec auth JWT** (mai 2026).

## Kickoff Pack (8 livrables)

- [x] `01-project-brief.md`
- [x] `02-product-scope.md`
- [x] `03-domain-model.md`
- [x] `04-database.md` + ERD `passwordHash`
- [x] `images/erd.puml` + `images/erd.png`
- [x] `05-architecture.md`
- [x] `06-adr/` — **4 ADR** (001–004)
- [x] `07-tech-debt-register.md`
- [x] `08-definition-of-done.md`

## Conception

- [x] ERD = `prisma/schema.prisma`
- [x] Schéma composants (auth inclus)
- [x] ADR PostgreSQL, App Router, JWT (004)
- [x] Dette à jour (auth résolu TD-01, TD-11)

## Implémentation

- [x] Auth : register, login, logout, me
- [x] API protégées : create, join, stats
- [x] Docker + CI (`DATABASE_URL`, `JWT_SECRET`)
- [ ] Tests au-delà de `rideMetrics` (dette TD-08)

## Checkpoint cours

| Question | Réponse |
|----------|---------|
| ERD à jour ? | **Oui** (`passwordHash` sur User) |
| Composants ? | **Oui** |
| ADR ? | **Oui** (4) |
| Auth JWT ? | **Oui** |
| RBAC admin ? | **Non** |
| Timestamps / soft delete ? | **Non** |
| CI ? | **Oui** |

## User story « Rejoindre une balade » — Done si

1. Utilisateur **connecté** (cookie JWT)
2. `POST /join` sans `userId` dans le body
3. `Participation` créée ou erreur 409 si déjà inscrit
4. UI `/rides` affiche « Inscrit »
5. CI verte
