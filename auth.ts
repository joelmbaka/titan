import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { Neo4jAdapter } from "@auth/neo4j-adapter";
import driver from "@/lib/neo4j"; 

const session = driver.session();

console.log("GitHub Client ID:", process.env.GITHUB_ID);
console.log("GitHub Client Secret:", process.env.GITHUB_SECRET);

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
            return baseUrl
        }
    }
});
