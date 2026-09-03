"use client";

import {
  Building2,
  Calendar,
  Mail,
  MapPin,
  Sparkles,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { TemperatureBadge } from "@/components/dashboard/temperature-badge";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import type { DemoLead } from "@/lib/demo-data";

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line-subtle py-2.5 last:border-0">
      <span className="text-content-muted [&_svg]:size-3.5">{icon}</span>
      <span className="text-caption text-content-muted">{label}</span>
      <span className="ml-auto truncate text-small text-content">{value}</span>
    </div>
  );
}

interface LeadDetailPanelProps {
  lead: DemoLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LeadDetailPanel({ lead, open, onOpenChange }: LeadDetailPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {lead && (
          <>
            <SheetHeader>
              <div className="flex items-start gap-3">
                <UserAvatar name={lead.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate">{lead.name}</SheetTitle>
                  <SheetDescription className="truncate">
                    {lead.role} · {lead.company}
                  </SheetDescription>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <TemperatureBadge value={lead.temperature} />
                    <Badge variant="outline" size="sm">
                      {lead.stage}
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <SheetBody className="flex flex-col gap-6">
              {/* Score */}
              <div className="rounded-xl border border-line bg-surface-elevated p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-caption text-content-muted">
                      Lead score
                    </p>
                    <p className="mt-0.5 font-mono text-h2 leading-none text-content">
                      {lead.score}
                      <span className="text-body text-content-disabled">
                        /100
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {lead.scoreBreakdown.map((item) => (
                    <div key={item.label} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-caption text-content-secondary">
                          {item.label}
                        </span>
                        <span className="font-mono text-[0.625rem] text-content-muted">
                          {item.value}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          style={{ width: `${item.value}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-electric-500 to-indigo-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company details */}
              <div>
                <p className="mb-1 text-overline uppercase text-content-muted">
                  Details
                </p>
                <DetailRow icon={<UserRound />} label="Role" value={lead.role} />
                <DetailRow
                  icon={<Building2 />}
                  label="Company"
                  value={lead.company}
                />
                <DetailRow
                  icon={<Users />}
                  label="Employees"
                  value={lead.employees}
                />
                <DetailRow
                  icon={<MapPin />}
                  label="Location"
                  value={lead.location}
                />
                <DetailRow icon={<Mail />} label="Email" value={lead.email} />
                <DetailRow
                  icon={<Target />}
                  label="Campaign"
                  value={lead.campaign}
                />
                <DetailRow
                  icon={<Calendar />}
                  label="Added"
                  value={lead.addedAt}
                />
              </div>

              {/* Signals */}
              <div>
                <p className="mb-2.5 text-overline uppercase text-content-muted">
                  Buying signals
                </p>
                {lead.signals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.signals.map((signal) => (
                      <span
                        key={signal}
                        className="inline-flex items-center gap-1.5 rounded-full border border-electric-500/26 bg-electric-500/10 px-2.5 py-1 text-caption text-electric-300"
                      >
                        <Sparkles className="size-3" />
                        {signal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-caption text-content-muted">
                    No signals detected yet
                  </p>
                )}
              </div>
            </SheetBody>

            <SheetFooter className="flex flex-col gap-2.5 sm:flex-row">
              <Button
                variant="secondary"
                fullWidth
                onClick={() =>
                  toast("UI phase only", {
                    description: "Email composition arrives with the CRM phase.",
                  })
                }
              >
                <Mail />
                Email
              </Button>
              <Button
                fullWidth
                onClick={() =>
                  toast.success("UI phase only", {
                    description: `Nothing was saved for ${lead.name}.`,
                  })
                }
              >
                Advance stage
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { LeadDetailPanel };
