FROM node:lts AS builder
WORKDIR /usr/src/app
RUN npm install -g npm
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=bot --docker

FROM node:lts AS installer
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
COPY --from=builder /usr/src/app/prisma/ .
COPY --from=builder /usr/src/app/tsconfig.json .
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /usr/src/app/out/full/ .
ARG CONCURRENCY
RUN pnpm build --filter=bot... --concurrency=$CONCURRENCY

FROM node:lts AS runner
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    build-essential \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm-dev \
    libxkbcommon-dev \
    libgbm-dev \
    libasound-dev \
    libatspi2.0-0 \
    libxshmfence-dev \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
COPY --from=installer /usr/src/app .

RUN npx playwright install

CMD ["pnpm",  "start"]
