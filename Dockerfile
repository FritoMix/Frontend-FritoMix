# ═══════════════════════════════════════════════════════════════
#  STAGE 1: Build Angular Application
# ═══════════════════════════════════════════════════════════════
FROM node:24-alpine AS builder
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code
COPY . .

# Set environment variables and build production distribution
ENV BACKEND_URL=""
RUN npm run build

# ═══════════════════════════════════════════════════════════════
#  STAGE 2: Serve with Nginx
# ═══════════════════════════════════════════════════════════════
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx website
RUN rm -rf ./*

# Copy built Angular distribution from Stage 1
COPY --from=builder /app/dist/fritomix-frontend/browser /usr/share/nginx/html

# Copy Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
