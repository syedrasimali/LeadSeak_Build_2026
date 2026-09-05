import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Target, Flame } from "lucide-react";
import type { Lead } from "@/types/db";

interface DashboardAiInsightsProps {
  leads: Lead[];
  leadCounts: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    byStatus: Record<string, number>;
  };
}

export function DashboardAiInsights({ leads, leadCounts }: DashboardAiInsightsProps) {
  const insights = generateInsights(leads, leadCounts);

  if (insights.length === 0) return null;

  return (
    <div className="rounded-xl border border-electric-400/20 bg-gradient-to-br from-electric-400/5 to-transparent p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-electric-400" />
        <h3 className="text-body font-semibold text-content">AI Insights</h3>
        <span className="ml-auto rounded-full bg-electric-400/10 px-2 py-0.5 text-[10px] font-medium text-electric-300">
          ✦ AI Generated
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-line bg-surface/50 p-3"
          >
            <div className="mt-0.5 shrink-0">
              {insight.type === "opportunity" && <TrendingUp className="size-4 text-success" />}
              {insight.type === "warning" && <AlertCircle className="size-4 text-warning" />}
              {insight.type === "action" && <Target className="size-4 text-electric-400" />}
              {insight.type === "success" && <CheckCircle2 className="size-4 text-success" />}
              {insight.type === "priority" && <Flame className="size-4 text-danger" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-small font-medium text-content">{insight.title}</p>
              <p className="mt-0.5 text-caption text-content-secondary">{insight.description}</p>
              {insight.recommendation && (
                <p className="mt-2 text-caption font-medium text-electric-300">
                  Recommended: {insight.recommendation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateInsights(
  leads: Lead[],
  leadCounts: DashboardAiInsightsProps["leadCounts"]
): Array<{
  type: "opportunity" | "warning" | "action" | "success" | "priority";
  title: string;
  description: string;
  recommendation?: string;
}> {
  const insights: Array<{
    type: "opportunity" | "warning" | "action" | "success" | "priority";
    title: string;
    description: string;
    recommendation?: string;
  }> = [];

  if (leads.length === 0) return insights;

  // High-potential uncontacted leads
  const uncontactedHot = leads.filter(
    (l) => l.temperature === "hot" && l.status === "new"
  );
  if (uncontactedHot.length > 0) {
    insights.push({
      type: "priority",
      title: `${uncontactedHot.length} high-potential lead${uncontactedHot.length > 1 ? "s" : ""} not contacted yet`,
      description: `You have ${uncontactedHot.length} hot lead${uncontactedHot.length > 1 ? "s" : ""} in your pipeline that haven't been contacted.`,
      recommendation: "Prioritize outreach to these leads within 24-48 hours",
    });
  }

  // Leads needing follow-up
  const contactedNotReplied = leads.filter(
    (l) => l.status === "contacted" && (l.temperature === "hot" || l.temperature === "warm")
  );
  if (contactedNotReplied.length > 0) {
    insights.push({
      type: "action",
      title: `${contactedNotReplied.length} lead${contactedNotReplied.length > 1 ? "s" : ""} awaiting follow-up`,
      description: `These leads were contacted but haven't replied yet.`,
      recommendation: "Send a follow-up message to re-engage",
    });
  }

  // Conversion rate insight
  const qualified = leadCounts.byStatus.qualified || 0;
  const won = leadCounts.byStatus.won || 0;
  if (leadCounts.total > 0 && qualified > 0) {
    const conversionRate = Math.round((won / qualified) * 100);
    if (conversionRate >= 50) {
      insights.push({
        type: "success",
        title: "Strong conversion rate",
        description: `${conversionRate}% of qualified leads converted to won.`,
        recommendation: "Your qualification process is working well",
      });
    } else if (conversionRate < 20 && qualified >= 3) {
      insights.push({
        type: "warning",
        title: "Low conversion rate detected",
        description: `Only ${conversionRate}% of qualified leads are converting to won.`,
        recommendation: "Review your qualification criteria and outreach approach",
      });
    }
  }

  // Pipeline health
  const newLeads = leadCounts.byStatus.new || 0;
  if (newLeads > leadCounts.total * 0.5 && leadCounts.total > 5) {
    insights.push({
      type: "opportunity",
      title: "Pipeline needs movement",
      description: `${Math.round((newLeads / leadCounts.total) * 100)}% of leads are still in 'new' status.`,
      recommendation: "Start qualifying and contacting leads to maintain pipeline flow",
    });
  }

  // High-value leads
  const highScoreLeads = leads.filter((l) => l.score >= 80);
  if (highScoreLeads.length > 0) {
    insights.push({
      type: "opportunity",
      title: `${highScoreLeads.length} high-value lead${highScoreLeads.length > 1 ? "s" : ""} identified`,
      description: `These leads scored 80+ based on fit and signals.`,
      recommendation: "Focus your best outreach efforts here",
    });
  }

  // Stale leads
  const staleLeads = leads.filter((l) => {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(l.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate > 30 && l.status !== "won" && l.status !== "lost";
  });
  if (staleLeads.length > 0) {
    insights.push({
      type: "warning",
      title: `${staleLeads.length} lead${staleLeads.length > 1 ? "s" : ""} haven't been updated in 30+ days`,
      description: "These leads may need re-engagement or archiving.",
      recommendation: "Review and decide: follow up or archive",
    });
  }

  return insights.slice(0, 4); // Limit to 4 insights
}
