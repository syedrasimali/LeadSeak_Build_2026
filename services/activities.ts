import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/types/db";

export async function listActivities(limit = 20): Promise<Activity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function createActivity(input: {
  kind: Activity["kind"];
  title: string;
  detail?: string;
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activities").insert({
    user_id: user.id,
    kind: input.kind,
    title: input.title,
    detail: input.detail ?? null,
  });
}
