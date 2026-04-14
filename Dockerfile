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
RUN echo "Installing app: $APP_NAME"
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /app/tsconfig.json .
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
ENV YOUTUBE_DL_SKIP_DOWNLOAD=true
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
        curl \
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
        ffmpeg \
        python3 \
        pipx && \
    pipx install yt-dlp && \
    rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.local/bin:$PATH"
COPY --from=installer /app .

CMD ["pnpm", "start"]
