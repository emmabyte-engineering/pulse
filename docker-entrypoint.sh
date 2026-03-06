#!/bin/sh
set -e

echo "Starting Pulse..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is up!"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database if SEED_DB is set
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

# Start the application
echo "Starting application..."
exec node build
