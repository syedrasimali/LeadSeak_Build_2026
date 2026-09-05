import type { Lead } from "@/types/db";

export interface AiLeadAnalysis {
  business_summary: string | null;
  what_they_do: string | null;
  potential_needs: string[];
  pain_points: string[];
  buying_signals: string[];
  lead_fit: "excellent" | "good" | "fair" | "poor" | null;
  recommended_action: string | null;
  confidence: "high" | "medium" | "low";
  data_source: "ai_inferred" | "verified" | "unavailable";
}

export interface AiOutreachOptions {
  tone: "professional" | "friendly" | "persuasive" | "short";
  type: "cold_email" | "linkedin_message" | "follow_up";
}

export interface WhyThisLead {
  reasons: string[];
  recommendation: string;
  confidence: "high" | "medium" | "low";
  signals: {
    industry_match: boolean;
    contact_quality: boolean;
    company_info: boolean;
    engagement_potential: boolean;
  };
}

function inferIndustryNeeds(industry: string | null): string[] {
  const needs: Record<string, string[]> = {
    saas: ["Lead generation automation", "Customer acquisition", "Churn reduction", "Sales pipeline optimization"],
    technology: ["Technical talent acquisition", "Product development", "Market expansion", "Partnership opportunities"],
    marketing: ["Content creation", "Lead nurturing", "Campaign optimization", "ROI measurement"],
    sales: ["Prospect identification", "Qualification automation", "Outreach personalization", "Pipeline management"],
    ecommerce: ["Customer acquisition", "Cart abandonment reduction", "Repeat purchases", "Customer lifetime value"],
    finance: ["Client acquisition", "Compliance automation", "Risk assessment", "Portfolio growth"],
    healthcare: ["Patient acquisition", "Practice optimization", "Compliance management", "Service expansion"],
    education: ["Student enrollment", "Course development", "Engagement optimization", "Alumni relations"],
    manufacturing: ["Supply chain optimization", "Quality control", "Cost reduction", "Market expansion"],
    retail: ["Customer acquisition", "Inventory optimization", "Omnichannel strategy", "Loyalty programs"],
  };

  if (!industry) return ["Business growth", "Customer acquisition", "Operational efficiency"];

  const key = industry.toLowerCase();
  for (const [k, v] of Object.entries(needs)) {
    if (key.includes(k)) return v;
  }
  return ["Business growth", "Customer acquisition", "Operational efficiency"];
}

function inferPainPoints(industry: string | null, description: string | null): string[] {
  const points: string[] = [];

  if (description?.toLowerCase().includes("startup") || description?.toLowerCase().includes("early")) {
    points.push("Limited resources for scaling", "Need for rapid customer acquisition");
  }

  if (industry?.toLowerCase().includes("saas") || industry?.toLowerCase().includes("software")) {
    points.push("High customer acquisition costs", "Competitive market pressure");
  }

  if (!points.length) {
    points.push("Lead qualification efficiency", "Sales pipeline optimization");
  }

  return points.slice(0, 3);
}

function detectBuyingSignals(lead: Lead): string[] {
  const signals: string[] = [];

  if (lead.website) signals.push("Active online presence");
  if (lead.linkedin_url) signals.push("Professional network engagement");
  if (lead.email) signals.push("Accessible contact information");
  if (lead.job_title?.toLowerCase().includes("founder") || lead.job_title?.toLowerCase().includes("ceo")) {
    signals.push("Decision-maker contact");
  }
  if (lead.score >= 70) signals.push("High qualification score");
  if (lead.description?.toLowerCase().includes("hiring") || lead.description?.toLowerCase().includes("growing")) {
    signals.push("Growth phase detected");
  }

  return signals.slice(0, 4);
}

function assessLeadFit(lead: Lead): { fit: AiLeadAnalysis["lead_fit"]; confidence: AiLeadAnalysis["confidence"] } {
  let score = 0;

  if (lead.score >= 80) score += 3;
  else if (lead.score >= 60) score += 2;
  else if (lead.score >= 40) score += 1;

  if (lead.email) score += 1;
  if (lead.phone) score += 1;
  if (lead.linkedin_url) score += 1;
  if (lead.website) score += 1;
  if (lead.description) score += 1;
  if (lead.industry) score += 1;

  if (score >= 8) return { fit: "excellent", confidence: "high" };
  if (score >= 6) return { fit: "good", confidence: "medium" };
  if (score >= 4) return { fit: "fair", confidence: "medium" };
  return { fit: "poor", confidence: "low" };
}

export function analyzeLead(lead: Lead): AiLeadAnalysis {
  const { fit, confidence } = assessLeadFit(lead);
  const needs = inferIndustryNeeds(lead.industry);
  const painPoints = inferPainPoints(lead.industry, lead.description);
  const buyingSignals = detectBuyingSignals(lead);

  const businessSummary = lead.description
    ? `${lead.company_name} is ${lead.description.toLowerCase()}`
    : `${lead.company_name} operates in the ${lead.industry || "business"} sector`;

  const whatTheyDo = lead.description || `${lead.company_name} provides services in ${lead.industry || "their industry"}`;

  const recommendedAction = fit === "excellent" || fit === "good"
    ? "Prioritize outreach — this lead shows strong potential"
    : fit === "fair"
    ? "Qualify further before investing significant time"
    : "Monitor for future engagement signals";

  return {
    business_summary: businessSummary,
    what_they_do: whatTheyDo,
    potential_needs: needs,
    pain_points: painPoints,
    buying_signals: buyingSignals,
    lead_fit: fit,
    recommended_action: recommendedAction,
    confidence,
    data_source: "ai_inferred",
  };
}

export function generateWhyThisLead(lead: Lead): WhyThisLead {
  const reasons: string[] = [];
  const signals = {
    industry_match: false,
    contact_quality: false,
    company_info: false,
    engagement_potential: false,
  };

  if (lead.score >= 70) {
    reasons.push(`High qualification score (${lead.score}/100)`);
    signals.engagement_potential = true;
  }

  if (lead.industry) {
    reasons.push(`Relevant industry: ${lead.industry}`);
    signals.industry_match = true;
  }

  if (lead.email || lead.phone) {
    reasons.push("Accessible contact information available");
    signals.contact_quality = true;
  }

  if (lead.description || lead.website) {
    reasons.push("Company information available for personalized outreach");
    signals.company_info = true;
  }

  if (lead.job_title?.toLowerCase().includes("founder") || lead.job_title?.toLowerCase().includes("ceo") || lead.job_title?.toLowerCase().includes("director")) {
    reasons.push("Decision-maker contact identified");
  }

  if (lead.temperature === "hot") {
    reasons.push("Classified as hot lead — high priority");
  }

  if (!reasons.length) {
    reasons.push("Lead added to pipeline for further qualification");
  }

  const recommendation = lead.score >= 70
    ? "Contact this lead soon — strong potential for conversion"
    : lead.score >= 50
    ? "Qualify this lead with targeted questions"
    : "Monitor and nurture for future opportunities";

  const confidence: WhyThisLead["confidence"] = lead.score >= 70 ? "high" : lead.score >= 50 ? "medium" : "low";

  return {
    reasons: reasons.slice(0, 5),
    recommendation,
    confidence,
    signals,
  };
}

export function generateOutreach(
  lead: Lead,
  options: AiOutreachOptions
): string {
  const contactName = lead.contact_name || "there";
  const companyName = lead.company_name;
  const industry = lead.industry || "your industry";

  const greetings = {
    professional: `Dear ${contactName},`,
    friendly: `Hi ${contactName},`,
    persuasive: `Hello ${contactName},`,
    short: `Hi ${contactName},`,
  };

  const openings = {
    cold_email: `I came across ${companyName} and was impressed by your work in ${industry}.`,
    linkedin_message: `Great to connect with you! I've been following ${companyName}'s progress in ${industry}.`,
    follow_up: `Following up on my previous message regarding ${companyName}.`,
  };

  const valueProps = {
    professional: "LeadSeak helps companies like yours identify and qualify prospects more efficiently, reducing acquisition costs while improving conversion rates.",
    friendly: "We help teams like yours find better prospects faster — thought it might be relevant given what you're building at ${companyName}.",
    persuasive: "Companies using LeadSeak see 3x more qualified leads in their pipeline within the first month.",
    short: "LeadSeak automates prospect research and qualification.",
  };

  const ctas = {
    cold_email: "Would you be open to a brief call this week to explore if this could help?",
    linkedin_message: "Would love to hear your thoughts — open to a quick chat?",
    follow_up: "Happy to jump on a quick call if timing is better now.",
  };

  return `${greetings[options.tone]}

${openings[options.type]}

${valueProps[options.tone]}

${ctas[options.type]}

Best regards`;
}

export function generateFollowUp(
  lead: Lead,
  lastContactDays: number
): {
  message: string;
  timing: string;
  priority: "high" | "medium" | "low";
} {
  const priority = lead.temperature === "hot" ? "high" : lead.temperature === "warm" ? "medium" : "low";

  const timing = lastContactDays >= 7
    ? "Follow up within 24 hours"
    : lastContactDays >= 3
    ? "Follow up in 2-3 days"
    : "Wait a few more days before following up";

  const message = `Hi ${lead.contact_name || "there"},

Just checking in on my previous message. I understand you're busy, but I'd love to explore how LeadSeak could help ${lead.company_name} streamline your prospect research.

Would a brief call work this week?

Best regards`;

  return { message, timing, priority };
}
