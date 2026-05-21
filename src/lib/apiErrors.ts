import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function validationErrorResponse(error: ZodError) {
  const message = error.issues.map((i) => i.message).join('; ');
  return NextResponse.json({ error: message }, { status: 400 });
}

export function prismaErrorResponse(error: unknown) {
  const err = error as { code?: string; message?: string };
  const msg = typeof err.message === 'string' ? err.message : '';

  if (
    err.code === 'P2022' ||
    msg.includes('does not exist') ||
    msg.includes("n'existe pas") ||
    msg.includes('colonne')
  ) {
    return NextResponse.json(
      {
        error:
          'Base de données non à jour. Exécutez : npx prisma db push puis npm run prisma:seed',
      },
      { status: 503 },
    );
  }

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
