import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { Neo4jAdapter } from "@auth/neo4j-adapter";
import driver from "@/lib/neo4j"; 

const session = driver.session();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: Neo4jAdapter(session),
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
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
