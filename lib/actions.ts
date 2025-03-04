"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { signIn } from 'next-auth/react';

export async function handleGitHubSignIn(callbackUrl: string) {
  // Logic to handle GitHub sign-in
  try {
    await signIn("github", { redirectTo: callbackUrl });
  } catch (error) {
    console.error('Error during GitHub sign-in:', error);
  }
}

export async function userSignOut() {
  // Logic to handle user sign-out
  try {
    await signOut();
  } catch (error) {
    console.error('Error during sign-out:', error);
  }
}