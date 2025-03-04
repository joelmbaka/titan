import { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function getSessionOrRedirect(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    // Handle redirection or throw an error
    throw new Error("User not authenticated");
  }
  return session;
} 