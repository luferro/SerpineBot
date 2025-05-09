FROM node:lts-slim AS builder
WORKDIR /app
ARG APP_NAME
RUN echo "Building app: $APP_NAME"
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=$APP_NAME --docker


FROM node:lts-slim AS installer
WORKDIR /app
ARG APP_NAME
ARG ENV_PATH
RUN echo "Installing app: $APP_NAME"
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /app/.env .
COPY --from=builder /app/tsconfig.json .
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN if [ -f "/app/$ENV_PATH/.env" ]; then cp /app/$ENV_PATH/.env ./$ENV_PATH/.env; fi
RUN if [ -n "$ENV_PATH" ]; then cat /app/.env >> ./$ENV_PATH/.env 2>/dev/null || cp /app/.env ./$ENV_PATH/.env; fi

RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
RUN pnpm build --filter=$APP_NAME...

FROM node:lts-slim AS runner
WORKDIR /app
ARG APP_NAME
RUN echo "Running app: $APP_NAME"
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libnss3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libxss1 \
        libasound2 \
        libpangocairo-1.0-0 \
        libgtk-3-0 \
        ffmpeg && \
    rm -rf /var/lib/apt/lists/*
COPY --from=installer /app .

CMD ["pnpm", "start"]
