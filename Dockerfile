FROM node:20-alpine

RUN apk add --no-cache libc6-compat openssl netcat-openbsd curl

WORKDIR /app

# Variables requises avant npm ci (postinstall = prisma generate via prisma.config.ts)
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://velib:velib@db:5432/velib_db
ARG JWT_SECRET=velib-docker-build-jwt-secret-min-32-chars
ENV JWT_SECRET=$JWT_SECRET

# Copier tout le code avant npm ci (schema.prisma + prisma.config.ts obligatoires)
COPY . .

RUN npm ci

RUN npm run build

RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
