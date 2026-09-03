import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  return (
    <DashboardShell leadCount={count ?? 0}>{children}</DashboardShell>
  );
}
