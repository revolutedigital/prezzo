import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@prezzo.com";
  const senha = "admin123";
  const nome = "Administrador";

  // Verificar se usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("✅ Usuário admin já existe!");
    console.log("Email:", email);
    console.log("Senha: admin123");
    return;
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(senha, 10);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      email,
      senha: hashedPassword,
      nome,
      empresa: "Prezzo Admin",
      role: "admin",
      ativo: true,
    },
  });

  console.log("✅ Usuário admin criado com sucesso!");
  console.log("");
  console.log("📧 Email:", email);
  console.log("🔑 Senha:", senha);
  console.log("");
  console.log("Acesse: http://localhost:8001/login");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar usuário:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
