"use client";

import * as React from "react";
import { Users, Target, Zap, TrendingUp, CheckCircle2, Sparkles, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getIcpProfileAction } from "@/app/actions/ai";
import type { IcpProfile } from "@/services/ai";

export function IcpBuilderPanel() {
  const [profile, setProfile] = React.useState<IcpProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getIcpProfileAction().then((result) => {
      if (result.data) setProfile(result.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-line bg-surface-elevated py-12">
        <div className="size-6 animate-spin rounded-full border-2 border-electric-400 border-t-transparent" />
      </div>
    );
  }

  if (!profile || profile.ideal_industries.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface-elevated p-6 text-center">
        <Users className="mx-auto size-8 text-content-muted" />
        <p className="mt-3 text-body font-medium text-content">No data yet</p>
        <p className="mt-1 text-caption text-content-muted">
          Add more leads to generate your Ideal Customer Profile
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-electric-400/20 bg-gradient-to-br from-electric-400/5 to-transparent">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-electric-400" />
          <h3 className="text-body font-semibold text-content">AI Ideal Customer Profile</h3>
          <Badge variant="electric" className="ml-auto text-[10px]">
            Auto-generated
          </Badge>
        </div>
        <p className="mt-1 text-caption text-content-muted">
          Built from analyzing your lead data patterns
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-electric-400" />
            <p className="text-caption font-medium text-content">ICP Fit Score</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2.5 w-32 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-electric-400 transition-all"
                style={{ width: `${profile.fit_score}%` }}
              />
            </div>
            <span className="text-body font-semibold text-content">{profile.fit_score}%</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Target className="size-4 text-electric-400" />
            <p className="text-caption font-medium text-content">Ideal Industries</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.ideal_industries.map((ind, i) => (
              <Badge key={i} variant="electric" className="text-[11px]">
                {ind}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-electric-400" />
            <p className="text-caption font-medium text-content">Company Profile</p>
          </div>
          <p className="mt-1.5 text-small text-content">{profile.company_size}</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-electric-400" />
            <p className="text-caption font-medium text-content">Key Characteristics</p>
          </div>
          <div className="mt-2 space-y-1.5">
            {profile.key_characteristics.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-small text-content">
                <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                {c}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-electric-400" />
            <p className="text-caption font-medium text-content">Buying Triggers</p>
          </div>
          <div className="mt-2 space-y-1.5">
            {profile.buying_triggers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-small text-content">
                <Zap className="size-3.5 shrink-0 text-electric-400" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-electric-400" />
            <p className="text-caption font-medium text-content">Decision Makers</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.decision_makers.map((dm, i) => (
              <Badge key={i} variant="neutral" className="text-[11px]">
                {dm}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-electric-400" />
            <p className="text-caption font-medium text-content">Pain Points Addressed</p>
          </div>
          <div className="mt-2 space-y-1.5">
            {profile.pain_points_addressed.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-small text-content">
                <TrendingUp className="size-3.5 shrink-0 text-electric-400" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
