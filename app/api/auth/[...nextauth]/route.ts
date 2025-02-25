import NextAuth from "next-auth";
import { authOptions } from "@/auth";

// This is a special handler for NextAuth that works with subdomains
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

