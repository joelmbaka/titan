import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { Neo4jAdapter } from "@auth/neo4j-adapter";
import driver from "@/lib/neo4j";
import type { User } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      accessToken?: string;
    };
  }
}

// Ensure this file is only used on the server
if (typeof window !== "undefined") {
  throw new Error("Neo4j adapter should only be used on the server side");
}

// Add session creation right before adapter configuration
const session = driver.session();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: Neo4jAdapter(session),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "user:email",
        },
      },
      profile(profile) {
        console.log("GitHub Profile Response:", profile); // Log the profile response
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If the provided URL is relative, append it to the baseUrl.
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If the URL is absolute and matches our origin, allow it.
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise, fall back to the baseUrl.
      return baseUrl;
    }
  }
});
