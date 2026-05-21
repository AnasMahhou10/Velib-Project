import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import type { LoginInput, RegisterInput } from '../lib/schemas/auth';

export type RegistrationConflict = 'email' | 'username';

export async function findRegistrationConflict(
  username: string,
  email: string,
): Promise<RegistrationConflict | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedUsername = username.trim();

  const [byEmail, byUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: normalizedEmail } }),
    prisma.user.findUnique({ where: { username: trimmedUsername } }),
  ]);

  if (byEmail) return 'email';
  if (byUsername) return 'username';
  return null;
}

export async function registerUser(input: RegisterInput) {
  const conflict = await findRegistrationConflict(input.username, input.email);
  if (conflict === 'email') {
    const err = new Error('EMAIL_TAKEN');
    throw err;
  }
  if (conflict === 'username') {
    const err = new Error('USERNAME_TAKEN');
    throw err;
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      username: input.username.trim(),
      email: input.email.toLowerCase(),
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
}

export async function authenticateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (!user) {
    return null;
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}
