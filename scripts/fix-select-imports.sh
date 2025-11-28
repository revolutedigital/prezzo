#!/bin/bash

files=(
  "src/app/(dashboard)/materias-primas/materia-prima-form.tsx"
  "src/app/(dashboard)/materias-primas/page.tsx"
  "src/app/(dashboard)/orcamentos/novo/page.tsx"
  "src/app/(dashboard)/orcamentos/page.tsx"
  "src/app/(dashboard)/produtos/novo/page.tsx"
  "src/app/(dashboard)/produtos/[id]/variacao-form.tsx"
)

for file in "${files[@]}"; do
  echo "Processing $file..."
  # Replace import
  sed -i '' 's/import { Select } from "@\/components\/ui\/select"/import { NativeSelect } from "@\/components\/ui\/native-select"/g' "$file"
  
  # Replace component usage
  sed -i '' 's/<Select/<NativeSelect/g' "$file"
  sed -i '' 's/<\/Select>/<\/NativeSelect>/g' "$file"
  
  echo "  ✓ Fixed $file"
done

echo "Done!"
