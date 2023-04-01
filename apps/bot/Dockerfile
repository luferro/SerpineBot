FROM node:16 AS builder
WORKDIR /usr/src/app
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=bot --docker

FROM node:16 AS installer
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate 
COPY --from=builder /usr/src/app/tsconfig.json .
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install
COPY --from=builder /usr/src/app/out/full/ .
ARG CONCURRENCY
RUN pnpm turbo run build --filter=bot... --concurrency=$CONCURRENCY

FROM node:16 AS runner
FROM mcr.microsoft.com/playwright:focal
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt update && apt upgrade -y && apt install libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libatspi2.0-0 libxshmfence-dev -y
COPY --from=installer /usr/src/app .
RUN pnpm install @discordjs/opus --force --filter bot

CMD ["pnpm", "start"]