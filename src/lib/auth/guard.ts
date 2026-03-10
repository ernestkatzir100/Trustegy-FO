import { auth } from "@/lib/auth";

/**
 * Verifies the user is authenticated before proceeding.
 * Returns the user ID on success, or an error on failure.
 */
export async function requireAuth(): Promise<
  | { userId: string; error: null }
  | { userId: null; error: { code: string; message: string } }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      userId: null,
      error: { code: "UNAUTHORIZED", message: "נדרשת התחברות" },
    };
  }

  return { userId: session.user.id, error: null };
}
