# ADR-003 — MVP sans authentification

## Statut

Supersédé par [004-jwt-auth.md](./004-jwt-auth.md)

## Contexte

Délai rendu MVP ; priorité parcours balade et infra (Docker, CI, tests métier).

## Décision

Utilisateur MVP fixe (`userId = 1`), upsert à la création de balade. Pas de JWT ni sessions au rendu.

## Conséquences

- Parcours démo fonctionnel rapidement.
- Risque IDOR si déployé en public sans garde-fous.
- Évolution prévue : auth (sessions ou JWT) + contrôle d’accès par ressource.
