import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../src/lib/prisma';

const input = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(128),
  name: z.string().min(2).max(100),
  phone: z.string().max(30).optional(),
}).parse({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  name: process.env.ADMIN_NAME || 'Administrator',
  phone: process.env.ADMIN_PHONE,
});

async function main() {
  const password = await bcrypt.hash(input.password, 12);
  const admin = await prisma.user.upsert({
    where: { email: input.email.toLowerCase() },
    create: { ...input, email: input.email.toLowerCase(), password, role: 'ADMIN' },
    update: { name: input.name, phone: input.phone, password, role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log(`Admin ready: ${admin.email}`);
}

main()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); })
  .finally(() => prisma.$disconnect());

