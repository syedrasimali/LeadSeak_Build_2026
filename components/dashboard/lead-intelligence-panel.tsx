"use client";

import * as React from "react";
import { Brain, Lightbulb, Mail, MessageSquare, Target, TrendingUp, CheckCircle2, AlertCircle, Copy, Sparkles, Globe, BarChart3, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLeadAnalysisAction, getWhyThisLeadAction, generateOutreachAction, generateFollowUpAction, getWebsiteAnalysisAction } from "@/app/actions/ai";
import type { AiLeadAnalysis, WhyThisLead, WebsiteAnalysis } from "@/services/ai";

interface LeadIntelligencePanelProps {
  leadId: string;
  leadScore: number;
  leadTemperature: "hot" | "warm" | "cold";
}

export function LeadIntelligencePanel({ leadId, leadScore, leadTemperature }: LeadIntelligencePanelProps) {
  const [activeTab, setActiveTab] = React.useState<"analysis" | "why" | "outreach" | "followup" | "website">("analysis");
  const [analysis, setAnalysis] = React.useState<AiLeadAnalysis | null>(null);
  const [whyThisLead, setWhyThisLead] = React.useState<WhyThisLead | null>(null);
  const [outreach, setOutreach] = React.useState<string | null>(null);
  const [followUp, setFollowUp] = React.useState<{ message: string; timing: string; priority: string } | null>(null);
  const [websiteAnalysis, setWebsiteAnalysis] = React.useState<WebsiteAnalysis | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [outreachOptions, setOutreachOptions] = React.useState({
    tone: "professional" as const,
    type: "cold_email" as const,
  });
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (activeTab === "analysis" && !analysis) {
      setLoading(true);
      getLeadAnalysisAction(leadId).then((result) => {
        if (result.data) setAnalysis(result.data);
        setLoading(false);
      });
    } else if (activeTab === "why" && !whyThisLead) {
      setLoading(true);
      getWhyThisLeadAction(leadId).then((result) => {
        if (result.data) setWhyThisLead(result.data);
        setLoading(false);
      });
    } else if (activeTab === "outreach" && !outreach) {
      setLoading(true);
      generateOutreachAction(leadId, outreachOptions).then((result) => {
        if (result.data) setOutreach(result.data);
        setLoading(false);
      });
    } else if (activeTab === "followup" && !followUp) {
      setLoading(true);
      generateFollowUpAction(leadId).then((result) => {
        if (result.data) setFollowUp(result.data);
        setLoading(false);
      });
    } else if (activeTab === "website" && !websiteAnalysis) {
      setLoading(true);
      getWebsiteAnalysisAction(leadId).then((result) => {
        if (result.data) setWebsiteAnalysis(result.data);
        setLoading(false);
      });
    }
  }, [activeTab, leadId, analysis, whyThisLead, outreach, followUp, outreachOptions, websiteAnalysis]);

  const handleRegenerateOutreach = () => {
    setOutreach(null);
    setLoading(true);
    generateOutreachAction(leadId, outreachOptions).then((result) => {
      if (result.data) setOutreach(result.data);
      setLoading(false);
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "analysis", label: "Analysis", icon: Brain },
    { id: "why", label: "Why This Lead?", icon: Lightbulb },
    { id: "website", label: "Website", icon: Globe },
    { id: "outreach", label: "Outreach", icon: Mail },
    { id: "followup", label: "Follow-up", icon: MessageSquare },
  ] as const;

  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-electric-400" />
          <h3 className="text-small font-semibold text-content">AI Intelligence</h3>
          <Badge variant="neutral" className="ml-auto text-[10px]">
            ✦ AI Inferred
          </Badge>
        </div>
      </div>

      <div className="flex border-b border-line">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-caption font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-electric-400 text-electric-400"
                  : "text-content-muted hover:text-content"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-electric-400 border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === "analysis" && analysis && (
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-content-muted">Business Summary</p>
                  <p className="mt-1 text-small text-content">{analysis.business_summary}</p>
                </div>

                <div>
                  <p className="text-caption text-content-muted">What They Do</p>
                  <p className="mt-1 text-small text-content">{analysis.what_they_do}</p>
                </div>

                <div>
                  <p className="text-caption text-content-muted">Potential Needs</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {analysis.potential_needs.map((need, i) => (
                      <Badge key={i} variant="neutral" className="text-[11px]">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-caption text-content-muted">Buying Signals</p>
                  <div className="mt-1.5 space-y-1">
                    {analysis.buying_signals.length > 0 ? (
                      analysis.buying_signals.map((signal, i) => (
                        <div key={i} className="flex items-center gap-2 text-small text-content">
                          <TrendingUp className="size-3.5 text-electric-400" />
                          {signal}
                        </div>
                      ))
                    ) : (
                      <p className="text-small text-content-muted">No reliable signals detected</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-line bg-surface-2 p-3">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-electric-400" />
                    <p className="text-caption font-medium text-content">Lead Fit</p>
                    <Badge
                      variant={
                        analysis.lead_fit === "excellent"
                          ? "success"
                          : analysis.lead_fit === "good"
                          ? "electric"
                          : analysis.lead_fit === "fair"
                          ? "warning"
                          : "neutral"
                      }
                      className="ml-auto"
                    >
                      {analysis.lead_fit}
                    </Badge>
                  </div>
                  <p className="mt-2 text-caption text-content-secondary">{analysis.recommended_action}</p>
                </div>
              </div>
            )}

            {activeTab === "why" && whyThisLead && (
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-content-muted">Why This Lead?</p>
                  <div className="mt-2 space-y-2">
                    {whyThisLead.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-small text-content">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-electric-400" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-electric-400/20 bg-electric-400/5 p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-electric-400" />
                    <p className="text-caption font-medium text-electric-400">AI Recommendation</p>
                  </div>
                  <p className="mt-1.5 text-small text-content">{whyThisLead.recommendation}</p>
                </div>

                <div>
                  <p className="text-caption text-content-muted">Signal Quality</p>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-caption">
                      {whyThisLead.signals.industry_match ? (
                        <CheckCircle2 className="size-3.5 text-success" />
                      ) : (
                        <AlertCircle className="size-3.5 text-content-muted" />
                      )}
                      <span className="text-content-secondary">Industry match</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption">
                      {whyThisLead.signals.contact_quality ? (
                        <CheckCircle2 className="size-3.5 text-success" />
                      ) : (
                        <AlertCircle className="size-3.5 text-content-muted" />
                      )}
                      <span className="text-content-secondary">Contact quality</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption">
                      {whyThisLead.signals.company_info ? (
                        <CheckCircle2 className="size-3.5 text-success" />
                      ) : (
                        <AlertCircle className="size-3.5 text-content-muted" />
                      )}
                      <span className="text-content-secondary">Company info</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption">
                      {whyThisLead.signals.engagement_potential ? (
                        <CheckCircle2 className="size-3.5 text-success" />
                      ) : (
                        <AlertCircle className="size-3.5 text-content-muted" />
                      )}
                      <span className="text-content-secondary">Engagement</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "outreach" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={outreachOptions.type}
                    onChange={(e) => setOutreachOptions({ ...outreachOptions, type: e.target.value as any })}
                    className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-caption text-content"
                  >
                    <option value="cold_email">Cold Email</option>
                    <option value="linkedin_message">LinkedIn Message</option>
                    <option value="follow_up">Follow-up</option>
                  </select>
                  <select
                    value={outreachOptions.tone}
                    onChange={(e) => setOutreachOptions({ ...outreachOptions, tone: e.target.value as any })}
                    className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-caption text-content"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="short">Short</option>
                  </select>
                  <Button size="sm" variant="secondary" onClick={handleRegenerateOutreach} className="ml-auto">
                    Regenerate
                  </Button>
                </div>

                {outreach && (
                  <div className="relative">
                    <div className="rounded-lg border border-line bg-surface-2 p-4">
                      <pre className="whitespace-pre-wrap text-small text-content">{outreach}</pre>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-2"
                      onClick={() => handleCopy(outreach)}
                    >
                      <Copy className="size-3.5" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "followup" && followUp && (
              <div className="space-y-4">
                <div className="rounded-lg border border-line bg-surface-2 p-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-electric-400" />
                    <p className="text-caption font-medium text-content">Next Best Action</p>
                    <Badge
                      variant={followUp.priority === "high" ? "danger" : followUp.priority === "medium" ? "warning" : "neutral"}
                      className="ml-auto"
                    >
                      {followUp.priority} priority
                    </Badge>
                  </div>
                  <p className="mt-2 text-caption text-content-secondary">{followUp.timing}</p>
                </div>

                <div className="relative">
                  <p className="text-caption text-content-muted">Suggested Message</p>
                  <div className="mt-1.5 rounded-lg border border-line bg-surface-2 p-4">
                    <pre className="whitespace-pre-wrap text-small text-content">{followUp.message}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-8"
                    onClick={() => handleCopy(followUp.message)}
                  >
                    <Copy className="size-3.5" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "website" && websiteAnalysis && (
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-content-muted">Company Overview</p>
                  <p className="mt-1 text-small text-content">{websiteAnalysis.company_overview}</p>
                </div>

                {websiteAnalysis.business_model && (
                  <div>
                    <p className="text-caption text-content-muted">Business Model</p>
                    <p className="mt-1 text-small text-content">{websiteAnalysis.business_model}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-electric-400" />
                    <p className="text-caption font-medium text-content">Engagement Score</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-electric-400 transition-all"
                        style={{ width: `${websiteAnalysis.engagement_score}%` }}
                      />
                    </div>
                    <span className="text-caption font-medium text-content">{websiteAnalysis.engagement_score}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-caption text-content-muted">Strengths</p>
                  <div className="mt-1.5 space-y-1.5">
                    {websiteAnalysis.strengths.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-small text-content">
                        <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-caption text-content-muted">Opportunities</p>
                  <div className="mt-1.5 space-y-1.5">
                    {websiteAnalysis.opportunities.map((o, i) => (
                      <div key={i} className="flex items-center gap-2 text-small text-content">
                        <Zap className="size-3.5 shrink-0 text-electric-400" />
                        {o}
                      </div>
                    ))}
                  </div>
                </div>

                {websiteAnalysis.competitive_position && (
                  <div className="rounded-lg border border-electric-400/20 bg-electric-400/5 p-3">
                    <p className="text-caption font-medium text-electric-400">Competitive Position</p>
                    <p className="mt-1 text-small text-content">{websiteAnalysis.competitive_position}</p>
                  </div>
                )}

                <div>
                  <p className="text-caption text-content-muted">Target Audience</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {websiteAnalysis.target_audience.map((a, i) => (
                      <Badge key={i} variant="neutral" className="text-[11px]">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
