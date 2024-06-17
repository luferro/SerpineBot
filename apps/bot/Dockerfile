FROM node:18 AS builder
WORKDIR /usr/src/app
RUN npm install -g npm
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=bot --docker

FROM node:18 AS installer
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /usr/src/app/tsconfig.json .
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /usr/src/app/out/full/ .
ARG CONCURRENCY
RUN pnpm build --filter=bot... --concurrency=$CONCURRENCY

FROM mcr.microsoft.com/playwright:focal as runner
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update && apt-get upgrade -y && apt-get install build-essential libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libatspi2.0-0 libxshmfence-dev -y && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY --from=installer /usr/src/app .

RUN pnpm install @discordjs/opus --force --filter bot
RUN npx playwright install

CMD ["pnpm", "start"]
