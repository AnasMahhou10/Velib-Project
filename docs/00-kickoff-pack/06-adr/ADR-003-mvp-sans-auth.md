# ADR-003 — MVP sans authentification

## Statut

Accepté (dette documentée)

## Contexte

Délai rendu MVP (22/05) ; priorité au parcours balade, Docker, CI et tests métier. L'authentification complète retarderait la démo.

## Décision

- Utilisateur MVP fixe : **`CURRENT_USER_ID = 1`** (`app/page.tsx`, `app/rides/page.tsx`)
- `creatorId` / `userId` envoyés par le client mais toujours `1` en pratique
- Upsert user à la création de balade si absent (`rideGroupService`)
- Pas de JWT, cookies de session, ni middleware d'auth

## Alternatives envisagées

| Option | Reportée car |
|--------|--------------|
| NextAuth.js | Intégration + pages login hors temps MVP |
| JWT maison | Risque sécurité si mal implémenté sous délai |
| Basic Auth nginx | Insuffisant pour modèle multi-user réel |

## Conséquences

- Parcours démo fonctionnel rapidement
- **Risque :** IDOR si déployé en public (n'importe qui peut passer `userId` dans l'API)
- Évolution V2 : auth + contrôle d'accès par ressource (créateur, participant)
- Checkpoint : cocher honnêtement « pas d'auth » dans la dette
