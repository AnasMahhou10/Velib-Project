# ADR-004 — Authentification JWT (cookie httpOnly)

## Statut

Accepté — remplace la dette ADR-003 (MVP user id=1)

## Contexte

Le MVP utilisait `CURRENT_USER_ID = 1` et acceptait `userId` / `creatorId` depuis le client (risque IDOR). Besoin de comptes réels, inscription, et API sécurisées.

## Décision

- **Inscription / connexion** : `POST /api/auth/register`, `POST /api/auth/login`
- **Mot de passe** : bcrypt (`passwordHash` sur `User`)
- **JWT** : signé HS256 via `jose`, stocké en cookie **`auth_token`** httpOnly, `sameSite: lax`, 7 jours
- **Secret** : variable d'environnement `JWT_SECRET` (min. 16 caractères)
- **Routes protégées** (middleware + `requireAuth`) :
  - `POST /api/ride-groups` — `creatorId` = `sub` du JWT
  - `POST /api/ride-groups/[id]/join` — `userId` du JWT
  - `GET /api/stats` — stats de l'utilisateur connecté
- **Public** : `GET /api/stations`, `GET /api/ride-groups` (liste)

## Conséquences

- Plus d'envoi de `userId` / `creatorId` par le client sur les actions sensibles
- Déploiement : `JWT_SECRET` obligatoire (Docker, CI, local)
- User démo seed : `demo@example.com` / `demo1234`
- Évolution possible : refresh token, OAuth, rate limiting login
