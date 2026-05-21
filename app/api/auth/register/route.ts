import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/auth/cookies';
import { prismaErrorResponse, validationErrorResponse } from '@/lib/apiErrors';
import { registerSchema } from '@/lib/schemas/auth';
import { registerUser } from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const user = await registerUser(parsed.data);
    const response = NextResponse.json(
      {
        ok: true,
        user: { id: user.id, username: user.username, email: user.email },
      },
      { status: 201 },
    );

    await setAuthCookie(response, {
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'EMAIL_TAKEN') {
      return NextResponse.json(
        {
          error:
            'Cet email est déjà utilisé. Connecte-toi ou choisis un autre email.',
          code: 'EMAIL_TAKEN',
        },
        { status: 409 },
      );
    }

    if (message === 'USERNAME_TAKEN') {
      return NextResponse.json(
        {
          error:
            'Ce pseudo est déjà pris. Choisis un autre pseudo ou connecte-toi.',
          code: 'USERNAME_TAKEN',
        },
        { status: 409 },
      );
    }

    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return NextResponse.json(
        {
          error:
            'Compte déjà existant. Utilise la page Connexion si tu as déjà un compte.',
          code: 'DUPLICATE',
        },
        { status: 409 },
      );
    }

    return prismaErrorResponse(error);
  }
}
