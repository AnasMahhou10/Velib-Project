import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { JwtPayload } from './jwt';
import { getAuthFromRequest } from './request';

export function unauthorizedResponse(message = 'Authentification requise.') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireAuth(
  req: NextRequest,
): Promise<JwtPayload | NextResponse> {
  const auth = await getAuthFromRequest(req);
  if (!auth) {
    return unauthorizedResponse();
  }
  return auth;
}

export function isAuthPayload(
  result: JwtPayload | NextResponse,
): result is JwtPayload {
  return !(result instanceof NextResponse);
}
