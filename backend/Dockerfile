# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install native dependencies for some Node modules if necessary
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Stage 2: Final Production Image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src

# Set default env to production
ENV NODE_ENV=production

# Expose port (default 5000, can be overridden by Dokploy)
EXPOSE 5000

# The CMD will be overridden in docker-compose.yml for the worker
CMD ["npm", "start"]
