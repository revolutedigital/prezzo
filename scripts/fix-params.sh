#!/bin/bash

# Script to fix Next.js 15 params in API routes

echo "Fixing API route params for Next.js 15..."

# Find all route files with the old params pattern
files=$(grep -r "{ params }: { params: {" src/app/api/ --include="*.ts" -l)

for file in $files; do
  echo "Processing $file..."

  # Replace single id param
  sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"

  # Replace id + composicaoId params
  sed -i '' 's/{ params }: { params: { id: string; composicaoId: string } }/{ params }: { params: Promise<{ id: string; composicaoId: string }> }/g' "$file"

  echo "  ✓ Updated params type"
done

echo "Done!"
echo ""
echo "Note: You still need to add 'const { id } = await params;' or similar in each function"
