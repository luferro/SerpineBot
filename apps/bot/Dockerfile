FROM node:lts-bookworm AS builder
WORKDIR /usr/src/app
RUN npm install -g npm
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=bot --docker

FROM node:lts-bookworm AS installer
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
COPY --from=builder /usr/src/app/tsconfig.json .
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /usr/src/app/out/full/ .
ARG CONCURRENCY
RUN pnpm build --filter=bot... --concurrency=$CONCURRENCY

FROM node:lts-bookworm AS runner
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    build-essential \
    libdrm-dev \
    libxkbcommon-dev \
    libgbm-dev \
    libasound-dev \
    libxshmfence-dev \
    ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
COPY --from=installer /usr/src/app .

RUN npm install -g playwright@1.47.1
RUN npx -y playwright@1.47.1 install --with-deps

CMD ["pnpm",  "start"]
