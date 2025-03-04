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
        return true; // Allow access to sign-in page without requiring a session
      }

      // Protect dashboard routes
      if (isOnDashboard) {
        return isLoggedIn; // Require login for dashboard
      }

      return true; // Allow other routes
    },
  },
  providers: [], // Auth providers are configured in auth.ts
}; 