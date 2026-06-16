import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "user" | "admin";
  discord_id: string | null;
  banned: boolean;
  created_at: string;
};

/**
 * The authenticated Supabase user (revalidated against the auth server), or null.
 * Memoized per request with React `cache` so multiple callers don't re-fetch.
 */
/** True only when the Supabase env vars are present (lets the public site render pre-setup). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const getUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The current user's profile row (role, display name, …), or null if signed out. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, discord_id, banned, created_at")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
});

/** Redirect to /login if not signed in; otherwise return the user. */
export async function requireUser(redirectTo = "/account"): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

/** Redirect home unless the current user is an admin; otherwise return the profile. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }
  return profile;
}
