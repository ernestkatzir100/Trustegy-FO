"use server";

import { signIn, signOut } from "@/lib/auth";

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function loginWithMicrosoft() {
  await signIn("microsoft-entra-id", { redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/sign-in" });
}
