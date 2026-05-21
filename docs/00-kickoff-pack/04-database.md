# 04 — Base de données

## 1. Choix moteur

| Critère | Choix |
|---------|-------|
| SGBD | **PostgreSQL 16** |
| ORM | **Prisma** (`@prisma/client`) |
| Justification | Relations FK, intégrité, auth (`User.passwordHash`) |

Voir [ADR-001](./06-adr/ADR-001-postgresql-prisma.md).

## 2. ERD

Diagramme aligné sur [`prisma/schema.prisma`](../../prisma/schema.prisma).

![ERD Velib Ride Planner](./images/erd.png)

- Source PlantUML : [`images/erd.puml`](./images/erd.puml)
- Régénérer : [plantuml.com](https://www.plantuml.com/plantuml/uml/) ou `npm run db:push` (hors scope — utiliser Kroki en dev)

### Relations

| Relation | Cardinalité | FK |
|----------|-------------|-----|
| User → RideGroup (créateur) | 1 — N | `creatorId` |
| Station → RideGroup (départ) | 1 — N | `startStationId` |
| Station → RideGroup (arrivée) | 1 — 0..N | `endStationId` (nullable) |
| User ↔ RideGroup | N — N | `Participation` |

## 3. Dictionnaire de données

### User

| Colonne | Type SQL | Contraintes | Description |
|---------|----------|-------------|-------------|
| id | SERIAL | PK | Identifiant |
| username | VARCHAR | UNIQUE, NOT NULL | Pseudo |
| email | VARCHAR | UNIQUE, NOT NULL | Email (lowercase en app) |
| passwordHash | VARCHAR | NOT NULL | bcrypt — **jamais renvoyé par l’API** |

### Station

| Colonne | Type SQL | Contraintes | Description |
|---------|----------|-------------|-------------|
| id | INTEGER | PK | Code OpenData (`stationcode`) |
| name | VARCHAR | NOT NULL | Nom |
| lat | DOUBLE PRECISION | NOT NULL | Latitude |
| lng | DOUBLE PRECISION | NOT NULL | Longitude |

### RideGroup

| Colonne | Type SQL | Contraintes | Description |
|---------|----------|-------------|-------------|
| id | SERIAL | PK | Balade |
| title | VARCHAR | NOT NULL | Titre |
| departureTime | TIMESTAMPTZ | NOT NULL | Départ |
| creatorId | INTEGER | FK → User | Créateur (session JWT) |
| startStationId | INTEGER | FK → Station | Départ |
| endStationId | INTEGER | FK → Station, NULL | Arrivée |

### Participation

| Colonne | Type SQL | Contraintes | Description |
|---------|----------|-------------|-------------|
| userId | INTEGER | PK, FK → User | Participant (session JWT) |
| rideGroupId | INTEGER | PK, FK → RideGroup | Balade |

## 4. Index et intégrité

| Type | Détail |
|------|--------|
| PK | Tables ci-dessus + composite `Participation` |
| UNIQUE | `User.username`, `User.email` |
| FK | Toutes les relations Prisma |

## 5. Sécurité données

- `passwordHash` stocké uniquement en BDD
- API : `select` public `{ id, username, email }` sur `creator` / `participants.user`
- Pas de mot de passe en clair, pas de JWT en `localStorage` (cookie httpOnly)

## 6. Anti-patterns évités

- Pas de `userId` envoyé par le client sur create/join/stats
- Pas de tags CSV, pas de duplication coords dans `RideGroup`

## 7. Dette schéma

- Pas de `created_at` / `updated_at` / `deleted_at`
- Pas de colonne `status` (dérivé de `departureTime`)
- `prisma db push` (pas migrations versionnées prod)

## 8. Seed et maintenance

| Script | Rôle |
|--------|------|
| `prisma/seed.cjs` | Stations OpenData + user démo (`demo@example.com` / `demo1234`) |
| `scripts/fix-password-hash.cjs` | Corrige `passwordHash` NULL → `npm run db:fix` |
| `prisma/sql/add-password-hash.sql` | SQL manuel pgAdmin si besoin |
