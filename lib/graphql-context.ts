import { auth } from '@/auth';
import { Session } from "next-auth";

export async function createGraphQLContext(req: Request) {
  const session = await auth();
  const user = session?.user ? { ...session.user } : undefined;
  return { session, user };
} 