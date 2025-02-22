"use server";

import { signIn, signOut } from "@/auth";

export async function githubSignIn() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function userSignOut() {
  await signOut({ redirectTo: "/" });
} 