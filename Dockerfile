# Railway deployment — Node.js + Google Chrome Stable
# Uses google-chrome-stable (Google's official Debian package) instead of
# Playwright's headless shell — avoids seccomp/syscall issues in Railway containers.
# Set CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome-stable in Railway env vars.

FROM node:22-bookworm-slim

# Install Google Chrome Stable from Google's apt repo
RUN apt-get update && apt-get install -y wget gnupg2 ca-certificates apt-transport-https \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub \
       | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" \
       > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Install Node dependencies (skip Playwright browser download — we use system Chrome)
COPY package.json pnpm-lock.yaml ./
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install --frozen-lockfile

# Build Next.js
COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start"]
