const fs = require('fs');
const path = require('path');

// Files to fix
const filesList = [
  { file: 'src/app/api/tipos-produto/[id]/route.ts', vars: 'id' },
  { file: 'src/app/api/variacoes-produto/[id]/route.ts', vars: 'id' },
  { file: 'src/app/api/materias-primas/[id]/route.ts', vars: 'id' },
  { file: 'src/app/api/notas-fiscais/[id]/route.ts', vars: 'id' },
  { file: 'src/app/api/notas-fiscais/[id]/confirmar/route.ts', vars: 'id' },
  { file: 'src/app/api/orcamentos/[id]/pdf/route.ts', vars: 'id' },
  { file: 'src/app/api/orcamentos/[id]/route.ts', vars: 'id' },
  { file: 'src/app/api/produtos/[id]/mao-de-obra/[composicaoId]/route.ts', vars: 'id, composicaoId' },
  { file: 'src/app/api/produtos/[id]/mao-de-obra/route.ts', vars: 'id' },
];

filesList.forEach(({ file, vars }) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`Processing ${file}...`);

  // Find each function and add the destructuring right after try {
  const functionPattern = /export async function (GET|POST|PUT|PATCH|DELETE)\([^)]+\) \{\s+try \{/g;

  let modified = false;
  content = content.replace(functionPattern, (match) => {
    // Check if already has the destructuring
    const nextLine = content.slice(content.indexOf(match) + match.length, content.indexOf(match) + match.length + 200);

    if (nextLine.includes(`const { ${vars} } = await params;`)) {
      return match; // Already fixed
    }

    modified = true;
    return match + `\n    const { ${vars} } = await params;`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Fixed ${file}`);
  } else {
    console.log(`  ℹ Already fixed or no changes needed for ${file}`);
  }
});

console.log('\nDone!');
