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
RUN pnpm turbo run build --filter=bot...

FROM node:16 AS runner
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=installer /usr/src/app .

CMD ["pnpm", "start"]