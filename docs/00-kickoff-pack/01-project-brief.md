# 01 — Project Brief

## Problème

Organiser une balade Vélib' entre amis à Paris est fastidieux : trouver une station de départ, un itinéraire approximatif, convaincre les participants et suivre qui vient. Les outils génériques (messagerie, calendrier) ne lient pas les **stations Velib**, les **horaires** et les **statistiques** de la sortie.

## Cible utilisateur

- Cyclistes urbains / étudiants / colocs à Paris
- Petits groupes (2–15 personnes) pour des sorties loisir
- **MVP :** un seul compte démo (`userId = 1`) pour valider le parcours sans auth complète

## Solution proposée

**Velib Ride Planner** — application web :

1. Carte interactive des stations Vélib' (données OpenData Paris)
2. Création d'une **balade** (titre, date/heure, station départ, station arrivée optionnelle)
3. Liste des balades **à venir** / **passées** et bouton **rejoindre**
4. **Statistiques** : distance estimée (km), calories, durée (estimations métier)

## Contexte

- Projet pédagogique — **Projet Technique 2025/2026**
- Stack imposée / choisie : Next.js, PostgreSQL, Prisma
- Rendu MVP avec checkpoint conception (Kickoff Pack + ERD + ADR)

## Contraintes

| Contrainte | Détail |
|------------|--------|
| Délai | MVP rendu **22/05/2026** |
| Données | PostgreSQL relationnel ; seed stations via API OpenData (Internet requis) |
| Sécurité MVP | Pas de JWT ; utilisateur fixe en UI |
| Métriques | Pas de routing OSM ; Haversine × 1,25, 30 kcal/km |

## Critères de succès (MVP)

- [ ] `git clone` + `docker compose up --build` → app accessible (port 3001)
- [ ] Carte affiche les stations
- [ ] Création d'une balade avec départ (et arrivée si choisie)
- [ ] Page `/rides` : lister, rejoindre, voir stats agrégées
- [ ] CI : lint + tests + build passent

## Hors scope (brief)

Authentification multi-utilisateur, paiement, application mobile native, modération admin, chat temps réel.
