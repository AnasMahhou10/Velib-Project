# 07 — Tech Debt Register

| ID | Dette | Impact | Priorité | Mitigation / échéance |
|----|-------|--------|----------|------------------------|
| TD-01 | Pas d'authentification (userId=1) | Sécurité, multi-user | Haute | ADR-003 → NextAuth ou JWT V2 |
| TD-02 | Pas de `created_at` / `updated_at` | Audit, tri historique | Moyenne | Migration Prisma + colonnes |
| TD-03 | Pas de soft delete | Suppression accidentelle | Basse | `deleted_at` + filtres Prisma |
| TD-04 | `prisma db push` sans migrations versionnées | Prod / rollback | Haute | `prisma migrate` + CI |
| TD-05 | Distance Haversine × 1,25 (pas OSM) | Précision km/kcal | Moyenne | API routing optionnelle |
| TD-06 | kcal = 30 × km (constante) | Personnalisation | Basse | Paramètre user ou profil |
| TD-07 | Seed dépend d'Internet (OpenData) | Docker offline | Moyenne | Snapshot JSON embarqué |
| TD-08 | Tests unitaires limités (`rideMetrics`) | Régressions API | Haute | Tests services + routes |
| TD-09 | Dockerfile non multi-stage optimisé | Taille image, cache | Basse | Stage build + runner |
| TD-10 | Pas de RBAC en BDD | Modération | Moyenne | Table Role / permissions |
| TD-11 | API accepte `userId` arbitraire | IDOR | Haute | Lier au user session |
| TD-12 | Pas de HTTPS / config prod documentée | Déploiement réel | Moyenne | Reverse proxy + doc ops |

## Légende priorité

- **Haute** : avant mise en production publique
- **Moyenne** : sprint post-MVP
- **Basse** : confort / optimisation

## Liens

- [ADR-003](./06-adr/ADR-003-mvp-sans-auth.md)
- [08-definition-of-done.md](./08-definition-of-done.md) — critères avant de fermer une dette
