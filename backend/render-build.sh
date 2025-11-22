#!/usr/bin/env bash
set -euo pipefail

echo "Installing PostgreSQL client (for pg_dump backups)..."
apt-get update -y
apt-get install -y postgresql-client
apt-get clean

echo "Installing Node dependencies (including devDependencies for build)..."
# Ensure devDependencies are installed even if NODE_ENV is set to production
# Explicitly set NODE_ENV to development for npm install
NODE_ENV=development npm install

echo "Building TypeScript..."
npm run build

echo "Copying schema.sql to dist..."
mkdir -p dist/db
cp src/db/schema.sql dist/db/schema.sql

