# 02 — Product Scope (MoSCoW)

## MUST (MVP — obligatoire)

| Fonctionnalité | Description | Statut implémentation |
|----------------|-------------|------------------------|
| Carte stations | Affichage Leaflet + API `/api/stations` | Fait |
| Créer une balade | Titre, date/heure, départ, arrivée | Fait |
| Lister les balades | À venir / passées (`/rides`) | Fait |
| Rejoindre une balade | `POST /api/ride-groups/[id]/join` | Fait |
| Stats utilisateur | Distance, kcal, nombre de balades | Fait |
| BDD + seed | PostgreSQL, ~500 stations, user démo | Fait |
| Docker + CI | `docker-compose`, GitHub Actions | Fait |

## SHOULD (souhaitable post-MVP)

- Authentification (session ou JWT)
- Rôles : créateur peut annuler / modifier sa balade
- Migrations Prisma versionnées (vs `db push` seul)
- Tests d'intégration API

## COULD (plus tard)

- Routing réel (OSRM / OpenRouteService)
- Notifications (email / push)
- Filtre balades par quartier / date
- Export iCal

## WON'T (exclu explicitement)

| Exclusion | Raison |
|-----------|--------|
| Paiement / abonnement Vélib' | Hors périmètre produit |
| App mobile native | Web responsive suffit au MVP |
| Chat intégré | WhatsApp / Signal suffisent |
| Multi-villes | Paris uniquement (données OpenData) |
| Auth complète au rendu 22/05 | Dette documentée (ADR-003) |

## Parcours utilisateur MVP

```mermaid
flowchart LR
  A[Accueil carte] --> B[Sélection départ / arrivée]
  B --> C[Formulaire balade]
  C --> D[Balade créée]
  D --> E[/rides — à venir]
  E --> F[Rejoindre]
  E --> G[Passées + stats]
```

## Jalons

| Date | Jalon |
|------|-------|
| J-3 | Kickoff Pack + checkpoint conception |
| 22/05 | MVP démo + repo GitHub à jour |
