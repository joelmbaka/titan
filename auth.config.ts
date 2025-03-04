import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isOnSignIn = nextUrl.pathname.startsWith('/sign-in');

      // Allow access to sign-in page without requiring a session
      if (isOnSignIn) {
        return true; 
      }

      // Allow all other routes without session checks
      return true; 
    },
  },
  providers: [], // Auth providers are configured in auth.ts
}; 