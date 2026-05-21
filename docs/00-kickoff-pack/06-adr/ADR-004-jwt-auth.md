# ADR-004 — Authentification JWT (cookie httpOnly)

## Statut

Accepté — remplace la dette ADR-003 (MVP user id=1)

## Contexte

Le MVP utilisait `CURRENT_USER_ID = 1` et acceptait `userId` / `creatorId` depuis le client (risque IDOR).

## Décision

- Inscription / connexion : `/api/auth/register`, `/api/auth/login`
- Mot de passe bcrypt sur `User.passwordHash`
- JWT HS256 (`jose`), cookie `auth_token` httpOnly
- Routes protégées : création balade, join, stats personnelles
- `JWT_SECRET` en environnement

## Conséquences

- Multi-utilisateur sécurisé ; inscription → cookie → redirect `/`
- `npm run db:fix` si anciens users sans `passwordHash`
- Pages `/login`, `/register` ; compte seed `demo@example.com` / `demo1234`
- Voir aussi [`docs/adr/004-jwt-auth.md`](../../adr/004-jwt-auth.md)
