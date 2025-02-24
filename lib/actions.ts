"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";

export async function githubSignIn() {
  redirect("/api/auth/signin?provider=github");
}

export async function userSignOut() {
await signOut();
}