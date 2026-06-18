"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Keeps the server-rendered Navbar in sync with the client session. After a
 * magic-link / OAuth redirect the layout can be served from the Router Cache
 * with stale logged-out chrome; when the real client session differs from what
 * the server rendered, we refresh so server components re-render.
 */
export function AuthSync({ serverUserId }: { serverUserId: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let current = serverUserId;

    const reconcile = (uid: string | null) => {
      if (uid !== current) {
        current = uid;
        router.refresh();
      }
    };

    supabase.auth.getUser().then(({ data }) => reconcile(data.user?.id ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      reconcile(session?.user?.id ?? null),
    );

    return () => subscription.unsubscribe();
  }, [router, serverUserId]);

  return null;
}
