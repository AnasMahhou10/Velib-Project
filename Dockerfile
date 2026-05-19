FROM node:20-alpine

RUN apk add --no-cache libc6-compat openssl netcat-openbsd

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://velib:velib@db:5432/velib_db

RUN npx prisma generate && npm run build

RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
