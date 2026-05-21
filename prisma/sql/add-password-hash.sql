-- À exécuter dans pgAdmin si npx prisma db push échoue
-- Ajoute la colonne auth manquante sur User

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Après cette requête : npm run prisma:seed (met à jour le compte demo)
