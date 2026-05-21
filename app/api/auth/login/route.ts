import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/auth/cookies';
import { validationErrorResponse } from '@/lib/apiErrors';
import { loginSchema } from '@/lib/schemas/auth';
import { authenticateUser } from '@/services/authService';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const user = await authenticateUser(parsed.data);

  if (!user) {
    return NextResponse.json(
      { error: 'Email ou mot de passe incorrect.' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ user });
  await setAuthCookie(response, {
    userId: user.id,
    username: user.username,
    email: user.email,
  });

  return response;
}
