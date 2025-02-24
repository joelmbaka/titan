import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnSignIn = nextUrl.pathname.startsWith('/sign-in');

      // Allow sign-in page when not logged in
      if (isOnSignIn) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      // Protect dashboard routes
      if (isOnDashboard) {
        return isLoggedIn;
      }

      return true;
    },
  },
  providers: [], // Auth providers are configured in auth.ts
}; 