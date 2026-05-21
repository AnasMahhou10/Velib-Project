import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, JWT_COOKIE_MAX_AGE } from './constants';
import { signAccessToken, type JwtPayload } from './jwt';

export function setAuthCookie(response: NextResponse, payload: JwtPayload) {
  return signAccessToken(payload).then((token) => {
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: JWT_COOKIE_MAX_AGE,
    });
    return response;
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
