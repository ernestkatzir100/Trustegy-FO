# Railway deployment — Node.js + Playwright Chromium
# Single-stage build so apt packages and Chromium binary live in the same image layer.

FROM node:22-bookworm-slim

# Install Chrome system dependencies directly in the runtime image
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxshmfence1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Install dependencies (skip Playwright's postinstall browser download)
COPY package.json pnpm-lock.yaml ./
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install --frozen-lockfile

# Build Next.js
COPY . .
RUN pnpm run build

# Install Playwright's Chromium binary into the image
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright-browsers
RUN pnpm exec playwright install chromium

EXPOSE 3000
CMD ["pnpm", "start"]
