# ==========================================================
# STAGE 1: Build the static bundle
# ==========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configuration files
COPY package*.json ./

# Install development and production packages
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Set build-time variables for client-side API routing
ARG VITE_USER_SERVICE_URL
ARG VITE_PRODUCT_SERVICE_URL
ARG VITE_ORDER_SERVICE_URL

ENV VITE_USER_SERVICE_URL=${VITE_USER_SERVICE_URL}
ENV VITE_PRODUCT_SERVICE_URL=${VITE_PRODUCT_SERVICE_URL}
ENV VITE_ORDER_SERVICE_URL=${VITE_ORDER_SERVICE_URL}

# Compile React project into static web assets (outputs to /app/dist)
RUN npm run build

# ==========================================================
# STAGE 2: Host using a secure, unprivileged Nginx server
# ==========================================================
FROM nginxinc/nginx-unprivileged:alpine

# Copy the compiled static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default Nginx configuration with our SPA-optimized routing rules
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port is exposed for service-to-client traffic
EXPOSE 3000

# Health check tests Nginx server availability.
# wget --spider tests url retrieval without downloading the file, preinstalled on alpine.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1
