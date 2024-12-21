import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.user.deleteMany({});

        console.log('Database cleared.');

        const hashedPassword = await bcrypt.hash('password123', 10);

        await tx.user.create({
          data: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Jeffer Marcelino',
          },
        });

        console.log('Admin user created');
      },
      {
        timeout: 30000,
      },
    );

    console.log('All operations completed successfully.');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
