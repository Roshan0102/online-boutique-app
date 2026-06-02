# ==========================================================
# STAGE 1: Build stage
# ==========================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency configuration files
COPY package*.json ./

# Install all dependencies (including devDependencies if needed for build steps)
RUN npm ci

# Copy the rest of the application files
COPY . .

# ==========================================================
# STAGE 2: Production runner
# ==========================================================
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dependency configs
COPY package*.json ./

# Install only production dependencies for a smaller, cleaner image size
RUN npm ci --omit=dev

# Copy runtime application files from the builder stage
COPY --from=builder /usr/src/app/src ./src

# Apply security best practice: run application as a non-root user (node)
RUN chown -R node:node /usr/src/app
USER node

# Expose microservice port
EXPOSE 5001

# Set production environment flags
ENV PORT=5001
ENV NODE_ENV=production

# Embedded Health Check: runs inside the container to test service health periodically
# Uses Node.js 20 native global fetch API (avoids installing curl/wget in lightweight alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5001/health').then(res => { if (res.status !== 200) process.exit(1); }).catch(() => process.exit(1))"

# Start the application
CMD ["node", "src/app.js"]
