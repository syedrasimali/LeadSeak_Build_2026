"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";
import { LabeledSelect } from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsListUnderline,
  TabsTriggerUnderline,
} from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { updateSettingsAction } from "@/app/actions/profile";
import type { WorkspaceSettings } from "@/types/db";

const defaultSettings: WorkspaceSettings = {
  workspace_name: "My Workspace",
  workspace_url: "my-workspace",
  region: "us",
  hot_threshold: "80",
  notifications: {
    discovery_complete: true,
    new_hot_lead: true,
    weekly_digest: false,
  },
};

const notificationItems = [
  {
    key: "discovery_complete" as const,
    title: "Discovery complete",
    description: "When a campaign finishes surfacing prospects.",
  },
  {
    key: "new_hot_lead" as const,
    title: "New hot lead",
    description: "When a prospect scores above your hot threshold.",
  },
  {
    key: "weekly_digest" as const,
    title: "Weekly digest",
    description: "A Monday summary of pipeline movement.",
  },
];

export function SettingsForm({
  settings,
  profileName,
}: {
  settings: WorkspaceSettings | null;
  profileName: string | null;
}) {
  const router = useRouter();
  const initial = settings ?? {
    ...defaultSettings,
    workspace_name: profileName ?? defaultSettings.workspace_name,
  };

  const [wsName, setWsName] = React.useState(initial.workspace_name);
  const [wsUrl, setWsUrl] = React.useState(initial.workspace_url);
  const [region, setRegion] = React.useState(initial.region);
  const [threshold, setThreshold] = React.useState(initial.hot_threshold);
  const [notifications, setNotifications] = React.useState(initial.notifications);
  const [saving, setSaving] = React.useState(false);

  const isDirty =
    wsName !== initial.workspace_name ||
    wsUrl !== initial.workspace_url ||
    region !== initial.region ||
    threshold !== initial.hot_threshold ||
    JSON.stringify(notifications) !== JSON.stringify(initial.notifications);

  async function handleSave() {
    setSaving(true);
    const newSettings: WorkspaceSettings = {
      workspace_name: wsName.trim() || "My Workspace",
      workspace_url: wsUrl.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "my-workspace",
      region,
      hot_threshold: threshold,
      notifications,
    };

    const { error } = await updateSettingsAction(newSettings);
    setSaving(false);

    if (error) {
      toast.error("Failed to save", { description: error });
      return;
    }

    toast.success("Settings saved", { description: "Your workspace preferences have been updated." });
    router.refresh();
  }

  function handleCancel() {
    setWsName(initial.workspace_name);
    setWsUrl(initial.workspace_url);
    setRegion(initial.region);
    setThreshold(initial.hot_threshold);
    setNotifications(initial.notifications);
  }

  function toggleNotification(key: keyof WorkspaceSettings["notifications"]) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Tabs defaultValue="workspace">
      <TabsListUnderline>
        <TabsTriggerUnderline value="workspace">
          Workspace
        </TabsTriggerUnderline>
        <TabsTriggerUnderline value="notifications">
          Notifications
        </TabsTriggerUnderline>
      </TabsListUnderline>

      <TabsContent value="workspace">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>
              Applies to everyone with access to this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Workspace name" htmlFor="ws-name">
              <Input
                id="ws-name"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
              />
            </Field>

            <Field
              label="Workspace URL"
              htmlFor="ws-url"
              hint="Lowercase letters, numbers, and hyphens only."
            >
              <Input
                id="ws-url"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                leadingIcon={
                  <span className="font-mono text-caption">app/</span>
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Default region" htmlFor="region">
                <LabeledSelect
                  id="region"
                  value={region}
                  onValueChange={setRegion}
                  options={[
                    { value: "us", label: "United States" },
                    { value: "eu", label: "Europe" },
                    { value: "apac", label: "Asia Pacific" },
                  ]}
                />
              </Field>

              <Field label="Hot lead threshold" htmlFor="threshold">
                <LabeledSelect
                  id="threshold"
                  value={threshold}
                  onValueChange={setThreshold}
                  options={[
                    { value: "70", label: "70 and above" },
                    { value: "80", label: "80 and above" },
                    { value: "90", label: "90 and above" },
                  ]}
                />
              </Field>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="ghost" onClick={handleCancel} disabled={!isDirty || saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isDirty || saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Email notifications</CardTitle>
              <Tooltip content="Delivery is enabled once authentication is connected.">
                <span className="text-content-muted">
                  <Info className="size-4" />
                </span>
              </Tooltip>
            </div>
            <CardDescription>
              Choose what LeadSeak sends to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            {notificationItems.map((item, i) => (
              <div key={item.key}>
                {i > 0 && <Separator className="my-1" />}
                <label className="flex cursor-pointer items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={() => toggleNotification(item.key)}
                    className="mt-0.5 size-4 shrink-0 rounded-xs border-line-strong bg-surface accent-electric-500"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-small font-medium text-content">
                      {item.title}
                    </span>
                    <span className="text-caption text-content-muted">
                      {item.description}
                    </span>
                  </span>
                </label>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="ghost" onClick={handleCancel} disabled={!isDirty || saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isDirty || saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
