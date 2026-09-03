import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DISCOVERY_WINDOW_MS } from "@/services/discovery-usage";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const windowStart = new Date(Date.now() - DISCOVERY_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", windowStart);

  return (
    <DashboardShell leadCount={count ?? 0}>{children}</DashboardShell>
  );
}
