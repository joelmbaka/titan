import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        console.log(`User signed in with ${account.provider}`);
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
      console.log('Session created:', session);
      return session;
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
