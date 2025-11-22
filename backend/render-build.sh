#!/usr/bin/env bash
set -euo pipefail

echo "Installing PostgreSQL client (for pg_dump backups)..."
apt-get update -y
apt-get install -y postgresql-client
apt-get clean

echo "Installing Node dependencies (including devDependencies for build)..."
# Ensure devDependencies are installed even if NODE_ENV is set
NODE_ENV= npm install

echo "Building TypeScript..."
npm run build

