import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@cikizz.com';
  const password = 'AdminCiKiZz123!';
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin sudah ada.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin berhasil dibuat!');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());