import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (isApiRoute && !isAuthRoute) {
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (isDashboardRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
