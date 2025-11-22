# Multi-stage build for Fly.io
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --include=dev

# Copy source files
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Copy schema.sql to dist
RUN mkdir -p dist/db && cp src/db/schema.sql dist/db/schema.sql

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/db/schema.sql ./dist/db/schema.sql

# Expose port
EXPOSE 5001

# Start the server
CMD ["node", "dist/start.js"]

