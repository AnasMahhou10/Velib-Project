# 09 — User stories (du brief aux user stories)

Traduction du [brief](./01-project-brief.md) en user stories : format simple, lisible par un non-développeur, exploitable par un développeur.

## Format standard

```
En tant que [rôle], je veux [action], afin de [bénéfice].
```

## Rôles du projet

| Rôle | Description |
|------|-------------|
| **Visiteur** | Non connecté — peut parcourir la carte et voir les balades |
| **Membre** | Utilisateur inscrit / connecté (JWT) |
| **Créateur** | Membre qui organise une balade (`creatorId`) |

---

## Authentification

| ID | User story | Statut MVP |
|----|------------|------------|
| US-01 | En tant que **visiteur**, je veux **créer un compte** (pseudo, email, mot de passe), afin de **participer aux balades Velib**. | Fait |
| US-02 | En tant que **visiteur**, je veux **me connecter**, afin d’**accéder à mon espace** et être reconnu sur l’app. | Fait |
| US-03 | En tant que **membre**, je veux **rester connecté après inscription**, afin de **ne pas ressaisir mes identifiants**. | Fait |
| US-04 | En tant que **membre**, je veux **me déconnecter**, afin de **sécuriser ma session** sur un ordinateur partagé. | Fait |

---

## Carte et stations

| ID | User story | Statut MVP |
|----|------------|------------|
| US-05 | En tant que **visiteur**, je veux **voir les stations Vélib sur une carte** par arrondissement, afin de **choisir un point de départ**. | Fait |
| US-06 | En tant que **membre**, je veux **sélectionner une station d’arrivée**, afin de **définir le trajet de la balade**. | Fait |

---

## Balades (RideGroup)

| ID | User story | Statut MVP |
|----|------------|------------|
| US-07 | En tant que **membre**, je veux **créer une balade** (titre, date, départ, arrivée), afin d’**organiser une sortie** entre amis. | Fait |
| US-08 | En tant que **visiteur**, je veux **consulter la liste des balades à venir**, afin de **découvrir les prochaines sorties**. | Fait |
| US-09 | En tant que **membre**, je veux **rejoindre une balade**, afin de **m’inscrire** et montrer ma participation. | Fait |
| US-10 | En tant que **membre**, je veux **voir les balades passées**, afin de **consulter l’historique** des sorties. | Fait |
| US-11 | En tant que **créateur**, je veux **être affiché comme organisateur** de ma balade, afin que **les participants sachent qui coordonne**. | Fait |
| US-12 | En tant que **membre**, je veux **voir qui participe** à une balade, afin de **connaître le groupe**. | Fait |

---

## Statistiques

| ID | User story | Statut MVP |
|----|------------|------------|
| US-13 | En tant que **membre**, je veux **voir la distance et les calories estimées** de mes balades, afin de **suivre mon effort**. | Fait |
| US-14 | En tant que **membre**, je veux **voir mes prochaines inscriptions**, afin de **ne pas oublier** une balade. | Fait |

---

## Backlog (hors MVP — explicite)

| ID | User story | Priorité |
|----|------------|----------|
| US-15 | En tant que **créateur**, je veux **modifier ou annuler** ma balade, afin de **gérer un imprévu**. | SHOULD |
| US-16 | En tant qu’**admin**, je veux **modérer les comptes**, afin de **bloquer un utilisateur abusif**. | COULD |
| US-17 | En tant que **membre**, je veux **recevoir une notification** avant une balade, afin de **ne pas la rater**. | COULD |
| US-18 | En tant que **membre**, je veux un **itinéraire vélo réel** (OSM), afin d’**avoir une distance précise**. | COULD |

---

## Lien avec le périmètre

- Stories **US-01 à US-14** → [02-product-scope.md](./02-product-scope.md) (MUST)
- Stories **US-15 à US-18** → backlog / dette ([07-tech-debt-register.md](./07-tech-debt-register.md))

## Critères d’acceptation (exemple US-09)

**US-09 — Rejoindre une balade**

- Étant donné un membre connecté et une balade à venir
- Quand il clique sur « Rejoindre »
- Alors une `Participation` est créée et la balade affiche « Inscrit »
- Et il ne peut pas s’inscrire deux fois (erreur 409)
