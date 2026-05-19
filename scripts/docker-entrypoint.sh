#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  if nc -z db 5432 2>/dev/null; then
    break
  fi
  sleep 2
done

if ! nc -z db 5432 2>/dev/null; then
  echo "PostgreSQL is not available after 60s"
  exit 1
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Applying database schema..."
npx prisma db push

echo "Seeding Velib stations (requires internet for OpenData Paris)..."
npm run prisma:seed

echo "Starting Next.js..."
exec npm start
