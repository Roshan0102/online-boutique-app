# ==========================================================
# STAGE 1: Build stage
# ==========================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# ==========================================================
# STAGE 2: Production runner
# ==========================================================
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/src ./src

# Run as non-root user (node)
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 5003

ENV PORT=5003
ENV NODE_ENV=production

# Health check using node's native fetch
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5003/health').then(res => { if (res.status !== 200) process.exit(1); }).catch(() => process.exit(1))"

CMD ["node", "src/app.js"]
