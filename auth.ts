import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      accessToken?: string;
    };
    accessToken?: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "user:email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log('JWT Callback called. Account:', account);
      console.log('JWT Callback called. Profile:', profile);

      if (account) {
        token.accessToken = account.access_token;
        token.id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.accessToken = token.accessToken as string;
        session.user.accessToken = token.accessToken as string;
      }
      
      console.log("Auth.ts Session:", {
        hasUser: !!session.user,
        userId: session.user?.id || 'none',
        hasAccessToken: !!session.accessToken,
        tokenPrefix: session.accessToken ? session.accessToken.substring(0, 5) + '...' : 'none'
      });
      
      console.log('Auth function called. Environment Variables:', {
        GITHUB_ID: process.env.GITHUB_ID,
        GITHUB_SECRET: process.env.GITHUB_SECRET,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      });
      console.log('Auth function called. Session:', { session, token });
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/sign-in') && url.includes('callbackUrl=')) {
        const callbackUrl = new URL(url, baseUrl).searchParams.get('callbackUrl');
        if (callbackUrl) {
          if (callbackUrl.startsWith('/') || callbackUrl.startsWith(baseUrl)) {
            return callbackUrl;
          }
        }
        return `${baseUrl}/dashboard`;
      }
      
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
