#!/usr/bin/env bash
set -euo pipefail

echo "Installing PostgreSQL client (for pg_dump backups)..."
apt-get update -y
apt-get install -y postgresql-client
apt-get clean

echo "Installing Node dependencies (including devDependencies for build)..."
# Ensure devDependencies are installed - explicitly set NODE_ENV to empty/development
# This is critical for TypeScript compilation which needs @types/node
export NODE_ENV=""
npm install --include=dev
echo "Verifying @types/node is installed..."
if [ ! -d "node_modules/@types/node" ]; then
  echo "WARNING: @types/node not found, installing explicitly..."
  npm install --save-dev @types/node typescript
fi

echo "Building TypeScript..."
npm run build

echo "Copying schema.sql to dist..."
mkdir -p dist/db
cp src/db/schema.sql dist/db/schema.sql

