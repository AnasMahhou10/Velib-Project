import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function validationErrorResponse(error: ZodError) {
  const message = error.issues.map((i) => i.message).join('; ');
  return NextResponse.json({ error: message }, { status: 400 });
}

export function prismaErrorResponse(error: unknown) {
  const err = error as { code?: string; message?: string };

  if (err.code === 'P2025') {
    return NextResponse.json(
      {
        error:
          'Utilisateur ou station introuvable. Vérifie que les stations existent en base.',
      },
      { status: 400 },
    );
  }

  if (err.code === 'P2002') {
    return NextResponse.json(
      { error: 'L’utilisateur participe déjà à cette balade.' },
      { status: 409 },
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      error:
        typeof err.message === 'string' ? err.message : 'Erreur serveur.',
    },
    { status: 500 },
  );
}
