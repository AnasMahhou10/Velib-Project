import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './constants';
import { verifyAccessToken, type JwtPayload } from './jwt';

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookie) return cookie;

  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }

  return null;
}

export async function getAuthFromRequest(
  req: NextRequest,
): Promise<JwtPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}
