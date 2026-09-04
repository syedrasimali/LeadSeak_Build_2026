"use server";

import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/types/db";

export type NotificationItem = Pick<
  Activity,
  "id" | "kind" | "title" | "detail" | "created_at"
>;

export async function getRecentNotifications(
  limit = 10
): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("activities")
    .select("id, kind, title, detail, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
