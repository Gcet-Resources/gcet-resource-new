import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
)?.trim();

function isPublicConfiguration(): boolean {
  if (!url || !key || key.startsWith("sb_secret_")) return false;
  try {
    const endpoint = new URL(url);
    if (
      endpoint.protocol !== "https:" &&
      !(
        endpoint.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname)
      )
    )
      return false;
    if (key.startsWith("eyJ")) {
      const payload = JSON.parse(
        atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { role?: string };
      if (payload.role !== "anon") return false;
    } else if (!key.startsWith("sb_publishable_")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = isPublicConfiguration();
export const isPhoneMfaEnabled =
  import.meta.env.VITE_PHONE_MFA_ENABLED === "true";
export const turnstileSiteKey =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim() ?? "";
export const isTurnstileEnabled = Boolean(turnstileSiteKey);
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storageKey: "gcet.supabase.auth",
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase)
    throw new Error(
      "Campus accounts are not available on this deployment yet. Public resources are still available.",
    );
  return supabase;
}
