const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Verifica se já existe um admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@prezzo.com" },
    });

    if (existingAdmin) {
      console.log("\n⚠️  Usuário admin já existe!");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nome: ${existingAdmin.nome}`);

      // Resetar senha
      const newPassword = "prezzo123";
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { senha: hashedPassword },
      });

      console.log("\n✅ Senha resetada para: prezzo123");
      return;
    }

    // Criar novo admin
    const newPassword = "prezzo123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const admin = await prisma.user.create({
      data: {
        nome: "Administrador",
        email: "admin@prezzo.com",
        senha: hashedPassword,
        empresa: "Prezzo",
        role: "admin",
        ativo: true,
      },
    });

    console.log("\n✅ Usuário admin criado com sucesso!");
    console.log(`\n🔑 Credenciais de acesso:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Senha: ${newPassword}`);
    console.log(`   Role: ${admin.role}`);
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
