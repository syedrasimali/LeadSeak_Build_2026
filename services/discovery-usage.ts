import { createClient } from "@/lib/supabase/server";
import {
  DISCOVERY_WINDOW_MS,
  DISCOVERY_LEAD_LIMIT,
  DISCOVERY_BATCH_SIZE,
} from "@/lib/discovery-constants";

export { DISCOVERY_WINDOW_MS, DISCOVERY_LEAD_LIMIT, DISCOVERY_BATCH_SIZE };

export interface DiscoveryUsage {
  leadsInWindow: number;
  remaining: number;
  resetAt: string | null;
}

export async function getDiscoveryUsage(): Promise<DiscoveryUsage> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { leadsInWindow: 0, remaining: DISCOVERY_LEAD_LIMIT, resetAt: null };
  }

  const windowStart = new Date(Date.now() - DISCOVERY_WINDOW_MS).toISOString();

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", windowStart);

  const leadsInWindow = count ?? 0;
  const remaining = Math.max(0, DISCOVERY_LEAD_LIMIT - leadsInWindow);

  let resetAt: string | null = null;
  if (leadsInWindow > 0) {
    const { data: oldest } = await supabase
      .from("leads")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (oldest) {
      resetAt = new Date(
        new Date(oldest.created_at).getTime() + DISCOVERY_WINDOW_MS
      ).toISOString();
    }
  }

  return { leadsInWindow, remaining, resetAt };
}
