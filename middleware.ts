import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');

    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (isDashboard && !token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};