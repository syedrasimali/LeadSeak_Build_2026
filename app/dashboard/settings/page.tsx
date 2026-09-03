import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/services/profiles";
import { PageHeader } from "@/components/layout/page-header";
import { DeleteWorkspaceDialog } from "@/components/dashboard/delete-workspace-dialog";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await ensureProfile();
  const settings = profile?.settings ?? null;
  const workspaceName = settings?.workspace_name ?? profile?.name ?? "My Workspace";

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Workspace configuration, notifications, and plan management."
      />

      <SettingsForm settings={settings} profileName={profile?.name ?? null} />

      <div className="mt-5">
        <div className="rounded-xl border border-danger/22 bg-danger/[0.035]">
          <div className="px-5 py-4">
            <h3 className="text-body font-semibold text-content">Delete workspace</h3>
            <p className="mt-1 text-caption text-content-muted">
              Permanently removes all campaigns, prospects, and pipeline
              history. This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end border-t border-danger/18 px-5 py-3">
            <DeleteWorkspaceDialog workspaceName={workspaceName} />
          </div>
        </div>
      </div>
    </>
  );
}
