import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/services/profiles";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await ensureProfile();
  const displayName = profile?.name ?? user.email ?? "User";

  const { count: leadCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const leadsUsed = leadCount ?? 0;
  const FREE_PLAN_LEAD_LIMIT = 100;

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage how you appear to teammates across shared campaigns and pipeline views."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Identity card */}
        <Card variant="elevated" className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <ProfileAvatar
              name={displayName}
              currentUrl={profile?.avatar_url ?? null}
            />
            <div className="flex flex-col gap-1">
              <p className="text-h3 text-content">{displayName}</p>
              <p className="text-small text-content-secondary">
                {profile?.email ?? user.email}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="electric" dot>
                Free plan — {leadsUsed}/{FREE_PLAN_LEAD_LIMIT} leads
              </Badge>
              <Badge variant="outline">Owner</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-caption text-content-muted">
              Joined {new Date(profile?.created_at ?? user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </CardFooter>
        </Card>

        {/* Details form */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>
              Update your name and review your account information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              name={profile?.name ?? ""}
              email={profile?.email ?? user.email ?? null}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
