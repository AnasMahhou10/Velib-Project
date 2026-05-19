import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.info(`[api] ${request.method} ${request.nextUrl.pathname} id=${requestId}`);
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
