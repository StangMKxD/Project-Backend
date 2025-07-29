const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Javamib123', 10);

  await prisma.user.upsert({
    where: { email: 'phusa13fu@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      surname: 'T',
      email: 'phusa13fu@gmail.com',
      password: hashedPassword,
      phone: '0000000000',
      role: 'ADMIN',
    },
  });

  console.log('✅ แอดมินมาละ');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = prisma;