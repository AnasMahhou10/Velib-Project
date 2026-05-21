# 08 — Definition of Done (conception)

Checklist pour considérer le **Kickoff Pack** et la **conception MVP** comme terminés (checkpoint J-3 / rendu 22/05).

## Kickoff Pack (8 livrables)

- [x] `01-project-brief.md` — problème, cible, succès
- [x] `02-product-scope.md` — MoSCoW + parcours
- [x] `03-domain-model.md` — entités, BR, états
- [x] `04-database.md` — ERD + dictionnaire + `erd.puml`
- [x] `images/erd.png` — export PlantUML (généré depuis `erd.puml`)
- [x] `05-architecture.md` — schéma composants
- [x] `06-adr/` — au moins 3 ADR
- [x] `07-tech-debt-register.md` — dettes listées
- [x] `08-definition-of-done.md` — ce fichier

## Conception technique

- [x] ERD aligné sur `prisma/schema.prisma`
- [x] Schéma composants (Mermaid) à jour
- [x] ADR PostgreSQL, App Router, sans auth
- [x] Registre dette synchronisé avec le README racine

## Implémentation MVP (rappel — hors « pure conception »)

- [x] API REST ride-groups / join / stats / stations
- [x] Service layer + Zod
- [x] Docker Compose + entrypoint Prisma
- [x] GitHub Actions (lint, test, build)
- [ ] Couverture tests > métriques seules (dette TD-08)
- [ ] Auth multi-utilisateur (dette TD-01)

## Validation locale

```bash
npm run lint
npm test
npm run build
# ou
docker compose up --build
```

## Checkpoint cours (réponses honnêtes suggérées)

| Question | Réponse projet |
|----------|----------------|
| ERD fait et à jour ? | **Oui** (`04-database.md` + `images/erd.puml`) |
| Schéma composants ? | **Oui** (`05-architecture.md`) |
| ADR documentés ? | **Oui** (3 ADR) |
| RBAC complet ? | **Non** (MVP user fixe) |
| Timestamps / soft delete ? | **Non** (dette) |
| CI en place ? | **Oui** |

## Definition of Done — une user story (exemple)

Une story « Rejoindre une balade » est **Done** quand :

1. Zod valide `userId` et `rideGroupId`
2. `joinRideGroup` crée une `Participation` ou renvoie erreur Prisma (doublon)
3. UI `/rides` affiche l'état inscrit sans rechargement manuel complet
4. Pas de régression `npm test` / CI verte
5. Comportement documenté dans `03-domain-model.md` (BR-03)
