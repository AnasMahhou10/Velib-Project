import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthFromRequest } from './src/lib/auth/request';

function isProtectedApiRoute(pathname: string, method: string): boolean {
  if (method === 'POST' && pathname === '/api/ride-groups') {
    return true;
  }
  if (method === 'POST' && /^\/api\/ride-groups\/\d+\/join$/.test(pathname)) {
    return true;
  }
  if (method === 'GET' && pathname === '/api/stats') {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { pathname } = request.nextUrl;

  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    isProtectedApiRoute(pathname, request.method)
  ) {
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentification requise.' },
        { status: 401, headers: { 'x-request-id': requestId } },
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  if (pathname.startsWith('/api/')) {
    console.info(
      `[api] ${request.method} ${pathname} id=${requestId}`,
    );
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
