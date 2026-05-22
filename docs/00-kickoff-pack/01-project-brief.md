# 01 — Project Brief

## Problème

Organiser une balade Vélib' entre amis à Paris est fastidieux : trouver une station de départ, un itinéraire approximatif, convaincre les participants et suivre qui vient. Les outils génériques (messagerie, calendrier) ne lient pas les **stations Velib**, les **horaires**, les **comptes utilisateurs** et les **statistiques** de la sortie.

## Cible utilisateur

- Cyclistes urbains / étudiants / colocs à Paris
- Petits groupes (2–15 personnes) pour des sorties loisir
- Chaque participant possède **son compte** (inscription / connexion)

## Solution proposée

**Velib Ride Planner** — application web :

1. **Comptes** : inscription, connexion (JWT sécurisé)
2. Carte interactive des stations Vélib' (données OpenData Paris)
3. Création d'une **balade** (utilisateur connecté = créateur)
4. Liste des balades **à venir** / **passées** et **rejoindre** (authentifié)
5. **Statistiques personnelles** : distance estimée (km), calories, durée

## Contexte

- Projet pédagogique — **Projet Technique 2025/2026**
- Stack : Next.js, PostgreSQL, Prisma, JWT (jose), bcrypt
- Livrables : Kickoff Pack, ERD, ADR, MVP déployable (Docker + CI)

## Contraintes

| Contrainte | Détail |
|------------|--------|
| Délai | MVP rendu **22/05/2026** |
| Données | PostgreSQL ; seed stations via OpenData (Internet requis) |
| Sécurité | JWT cookie httpOnly ; `JWT_SECRET` en env ; pas de `userId` client sur routes protégées |
| Métriques | Haversine × 1,25, 30 kcal/km (pas de routing OSM) |

## Critères de succès (MVP)

- [x] `git clone` + `docker compose up --build` → app sur port **3001**
- [x] Inscription / connexion fonctionnelles
- [x] Carte + création balade (connecté)
- [x] `/rides` : lister, rejoindre, stats
- [x] CI : lint + tests + build (+ `JWT_SECRET` en CI)

## User stories

Le brief est décliné en user stories au format cours :

> En tant que **[rôle]**, je veux **[action]**, afin de **[bénéfice]**.

Voir le document complet : **[09-user-stories.md](./09-user-stories.md)** (14 stories MVP + backlog).

Exemples :

- En tant que **membre**, je veux **créer une balade**, afin d’**organiser une sortie** entre amis.
- En tant que **membre**, je veux **rejoindre une balade**, afin de **participer** avec d’autres cyclistes.
- En tant que **visiteur**, je veux **me connecter**, afin d’**accéder à mes balades et statistiques**.

## Hors scope (brief)

Paiement, app mobile native, modération admin, chat temps réel, OAuth / refresh token (évolution post-MVP).
