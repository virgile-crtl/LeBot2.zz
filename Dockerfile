FROM node:latest AS base

WORKDIR /lebot2.zz

RUN apt-get update && apt-get upgrade -y && apt-get install -y ffmpeg

FROM base AS dev

COPY package*.json ./
RUN npm install

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev"]

FROM base AS builder

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./ 
COPY src ./src/
COPY locales ./locales/

RUN npm install
RUN npx prisma generate
RUN npm run build

FROM base AS prod

COPY --from=builder /lebot2.zz/dist ./dist
COPY --from=builder /lebot2.zz/locales ./locales
COPY --from=builder /lebot2.zz/prisma ./prisma
COPY --from=builder /lebot2.zz/prisma.config.ts ./
COPY package*.json ./

RUN npm install --omit=dev

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start"]