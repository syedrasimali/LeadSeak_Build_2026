import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DeleteWorkspaceDialog } from "@/components/dashboard/delete-workspace-dialog";
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
import { Info } from "lucide-react";

export const metadata: Metadata = { title: "Settings" };

const notifications = [
  {
    title: "Discovery complete",
    description: "When a campaign finishes surfacing prospects.",
    defaultChecked: true,
  },
  {
    title: "New hot lead",
    description: "When a prospect scores above your hot threshold.",
    defaultChecked: true,
  },
  {
    title: "Weekly digest",
    description: "A Monday summary of pipeline movement.",
    defaultChecked: false,
  },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Workspace configuration, notifications, and plan management."
      />

      <Tabs defaultValue="workspace">
        <TabsListUnderline>
          <TabsTriggerUnderline value="workspace">
            Workspace
          </TabsTriggerUnderline>
          <TabsTriggerUnderline value="notifications">
            Notifications
          </TabsTriggerUnderline>
          <TabsTriggerUnderline value="danger">Danger zone</TabsTriggerUnderline>
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
                <Input id="ws-name" defaultValue="Northwind Studio" />
              </Field>

              <Field
                label="Workspace URL"
                htmlFor="ws-url"
                hint="Lowercase letters, numbers, and hyphens only."
              >
                <Input
                  id="ws-url"
                  defaultValue="northwind-studio"
                  leadingIcon={
                    <span className="font-mono text-caption">app/</span>
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Default region" htmlFor="region">
                  <LabeledSelect
                    id="region"
                    defaultValue="eu"
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
                    defaultValue="80"
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
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
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
              {notifications.map((item, i) => (
                <div key={item.title}>
                  {i > 0 && <Separator className="my-1" />}
                  <label className="flex cursor-pointer items-start gap-3 py-3">
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultChecked}
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
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-danger/22 bg-danger/[0.035]">
            <CardHeader>
              <CardTitle>Delete workspace</CardTitle>
              <CardDescription>
                Permanently removes all campaigns, prospects, and pipeline
                history. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-danger/18 justify-end">
              <DeleteWorkspaceDialog />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
