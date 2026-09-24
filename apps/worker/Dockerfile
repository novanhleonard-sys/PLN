FROM node:22-bullseye-slim

# Install system dependencies (ffmpeg and build tools for sharp)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo configuration and lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

# Build shared package
RUN pnpm --filter shared build

# Build worker (if typescript, but we use tsx directly in dev. Let's just run tsx for production too, or compile it)
# In package.json, worker uses tsx for dev. For production, we can run it via tsx or compile.
# Here we'll just use tsx to run it since it's a simple worker.

WORKDIR /app/apps/worker

# Health check (optional, Render does TCP check by default if web service, but this is a background worker)
# We can expose a simple HTTP server for health check if needed.

# Start worker
CMD ["pnpm", "start"]
