#!/bin/bash
echo "🗄️ Initializing database..."
npx prisma db push --skip-generate
echo "🌱 Seeding database..."
npx tsx prisma/seed.ts
echo "✅ Database initialization complete!"
