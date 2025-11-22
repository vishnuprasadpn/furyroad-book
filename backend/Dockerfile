# Multi-stage build for Fly.io
# Note: Build context is already in the backend directory
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --include=dev || npm install --include=dev

# Copy source files
COPY . ./

# Build TypeScript
RUN npm run build

# Copy schema.sql to dist
RUN mkdir -p dist/db && cp src/db/schema.sql dist/db/schema.sql

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/db/schema.sql ./dist/db/schema.sql

# Expose port
EXPOSE 5001

# Start the server
CMD ["node", "dist/start.js"]

