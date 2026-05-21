/**
 * Corrige les User sans passwordHash (ex. compte démo créé avant l'auth JWT).
 * Usage: node scripts/fix-password-hash.cjs
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT id, email, username FROM "User"
    WHERE "passwordHash" IS NULL OR "passwordHash" = ''
  `;

  if (!rows.length) {
    console.log('Aucun utilisateur sans mot de passe — OK.');
    return;
  }

  const defaultPassword = 'demo1234';
  const hash = await bcrypt.hash(defaultPassword, 10);

  for (const row of rows) {
    await prisma.user.update({
      where: { id: row.id },
      data: { passwordHash: hash },
    });
    console.log(
      `User #${row.id} (${row.email}) — passwordHash défini (mot de passe: ${defaultPassword})`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
