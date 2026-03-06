// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    '/auth/login',
    '/auth/cadastro',
    '/auth/recuperar-senha',
    '/termos',
    '/privacidade',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Sem token → redireciona pro login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  // Com token mas na página de login/cadastro → volta pra home
  if (token && isPublicRoute && pathname !== '/termos' && pathname !== '/privacidade') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};