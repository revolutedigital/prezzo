const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'src/app/api/tipos-produto/[id]/route.ts',
  'src/app/api/variacoes-produto/[id]/route.ts',
  'src/app/api/materias-primas/[id]/route.ts',
  'src/app/api/notas-fiscais/[id]/route.ts',
  'src/app/api/notas-fiscais/[id]/confirmar/route.ts',
  'src/app/api/orcamentos/[id]/pdf/route.ts',
  'src/app/api/orcamentos/[id]/route.ts',
  'src/app/api/produtos/[id]/mao-de-obra/[composicaoId]/route.ts',
  'src/app/api/produtos/[id]/mao-de-obra/route.ts',
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace params.id with id, but first add destructuring
  // Find all function bodies that use params
  const regex = /export async function (GET|POST|PUT|PATCH|DELETE)\([^{]+\{([^}]+)\}\s*\)\s*\{/g;
  const matches = [...content.matchAll(regex)];

  console.log(`Processing ${file}...`);

  // For files with single id param
  if (!file.includes('composicaoId')) {
    // Add const { id } = await params; after the opening brace of each function
    content = content.replace(
      /(export async function (?:GET|POST|PUT|PATCH|DELETE)\([^{]+\{[^}]+\}\s*\)\s*\{\s*)(try \{)?/g,
      (match, p1, p2) => {
        if (p2 && !match.includes('const { id } = await params;')) {
          return `${p1}${p2}\n    const { id } = await params;`;
        }
        return match;
      }
    );

    // Replace all params.id with id
    content = content.replace(/params\.id/g, 'id');
  } else {
    // For files with id and composicaoId
    content = content.replace(
      /(export async function (?:GET|POST|PUT|PATCH|DELETE)\([^{]+\{[^}]+\}\s*\)\s*\{\s*)(try \{)?/g,
      (match, p1, p2) => {
        if (p2 && !match.includes('const { id, composicaoId } = await params;')) {
          return `${p1}${p2}\n    const { id, composicaoId } = await params;`;
        }
        return match;
      }
    );

    // Replace params.id and params.composicaoId
    content = content.replace(/params\.id/g, 'id');
    content = content.replace(/params\.composicaoId/g, 'composicaoId');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ Fixed ${file}`);
});

console.log('\nDone!');
