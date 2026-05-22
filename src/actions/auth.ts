'use server';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const id = crypto.randomUUID();

  await db.insert(users).values({
    id,
    name,
    email,
    passwordHash,
  });

  return { success: true };
}
