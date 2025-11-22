#!/usr/bin/env bash
set -euo pipefail

echo "Installing PostgreSQL client (for pg_dump backups)..."
apt-get update -y
apt-get install -y postgresql-client
apt-get clean

echo "Installing Node dependencies (including devDependencies for build)..."
# Ensure devDependencies are installed - unset NODE_ENV to force installation
# Try multiple methods to ensure compatibility
unset NODE_ENV
npm install --include=dev 2>&1 || npm install --production=false 2>&1 || npm install 2>&1

echo "Building TypeScript..."
npm run build

echo "Copying schema.sql to dist..."
mkdir -p dist/db
cp src/db/schema.sql dist/db/schema.sql

