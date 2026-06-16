import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service role key — **bypasses RLS**.
 *
 * NEVER import this into a Client Component. Use only inside trusted server code
 * (Route Handlers / Server Actions) AFTER verifying the caller's identity:
 *   - PayPal webhooks writing subscriptions/orders
 *   - AdaaX license endpoints (device bind / validate)
 *   - Admin mutations (after requireAdmin())
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
