const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // Lista todos os usuários primeiro
    const users = await prisma.user.findMany({
      select: { id: true, email: true, nome: true }
    });

    console.log('\n📋 Usuários cadastrados:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email} | Nome: ${user.nome || 'Sem nome'}`);
    });

    if (users.length === 0) {
      console.log('\n❌ Nenhum usuário encontrado no banco de dados.');
      return;
    }

    // Pega o primeiro usuário (ou você pode especificar um email)
    const user = users[0];

    // Nova senha: "prezzo123"
    const newPassword = 'prezzo123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha
    await prisma.user.update({
      where: { id: user.id },
      data: { senha: hashedPassword }
    });

    console.log('\n✅ Senha resetada com sucesso!');
    console.log(`\n🔑 Credenciais de acesso:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: ${newPassword}`);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
