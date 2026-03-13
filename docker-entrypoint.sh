#!/bin/sh
set -e

echo "Starting Pulse..."

# Detect database provider from DATABASE_URL
case "${DATABASE_URL:-}" in
  postgresql://*|postgres://*)
    DB_PROVIDER="postgresql"
    ;;
  *)
    DB_PROVIDER="sqlite"
    ;;
esac

if [ "$DB_PROVIDER" = "postgresql" ]; then
  # Wait for PostgreSQL to be ready
  echo "Waiting for PostgreSQL..."
  until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
  done
  echo "PostgreSQL is up!"
else
  # Ensure SQLite data directory exists
  echo "Using SQLite database"
  mkdir -p /app/data
fi

# Run database migrations
echo "Running database migrations..."
node_modules/.bin/prisma migrate deploy

# Start the application
echo "Starting application..."
exec node build
