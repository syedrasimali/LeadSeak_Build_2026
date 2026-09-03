import type { Campaign } from "@/types/db";
import type { ExaSearchResult } from "./exa";

export interface QualificationSignal {
  name: string;
  score: number;
  maxScore: number;
  reason: string;
}

export interface QualificationResult {
  score: number;
  temperature: "hot" | "warm" | "cold";
  signals: QualificationSignal[];
  reason: string;
}

function scoreIndustryRelevance(
  result: ExaSearchResult,
  campaign: Campaign
): QualificationSignal {
  if (!campaign.industry) {
    return { name: "Industry", score: 0, maxScore: 20, reason: "No industry specified" };
  }

  const text = [result.title, result.summary, result.text]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const industry = campaign.industry.toLowerCase();
  const keywords = industry.split(/\s+/);

  let matchCount = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) matchCount++;
  }

  const matchRatio = keywords.length > 0 ? matchCount / keywords.length : 0;
  const score = Math.round(matchRatio * 20);

  return {
    name: "Industry",
    score,
    maxScore: 20,
    reason:
      matchRatio > 0.6
        ? `Strong industry match (${Math.round(matchRatio * 100)}%)`
        : matchRatio > 0.3
          ? `Partial industry match (${Math.round(matchRatio * 100)}%)`
          : `Weak industry match (${Math.round(matchRatio * 100)}%)`,
  };
}

function scoreLocationRelevance(
  result: ExaSearchResult,
  campaign: Campaign
): QualificationSignal {
  if (!campaign.location) {
    return { name: "Location", score: 0, maxScore: 15, reason: "No location specified" };
  }

  const text = [result.title, result.summary, result.text]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const location = campaign.location.toLowerCase();
  const keywords = location.split(/\s+/);

  let matchCount = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) matchCount++;
  }

  const matchRatio = keywords.length > 0 ? matchCount / keywords.length : 0;
  const score = Math.round(matchRatio * 15);

  return {
    name: "Location",
    score,
    maxScore: 15,
    reason:
      matchRatio > 0.5
        ? `Location match found`
        : matchRatio > 0
          ? `Partial location match`
          : `No location match`,
  };
}

function scoreKeywordRelevance(
  result: ExaSearchResult,
  campaign: Campaign
): QualificationSignal {
  if (!campaign.keywords) {
    return { name: "Keywords", score: 0, maxScore: 20, reason: "No keywords specified" };
  }

  const text = [result.title, result.summary, result.text]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const keywords = campaign.keywords
    .toLowerCase()
    .split(/[,;]+/)
    .map((k) => k.trim())
    .filter(Boolean);

  let matchCount = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) matchCount++;
  }

  const matchRatio = keywords.length > 0 ? matchCount / keywords.length : 0;
  const score = Math.round(matchRatio * 20);

  return {
    name: "Keywords",
    score,
    maxScore: 20,
    reason:
      matchRatio > 0.6
        ? `Strong keyword match (${matchCount}/${keywords.length})`
        : matchRatio > 0.3
          ? `Partial keyword match (${matchCount}/${keywords.length})`
          : `Weak keyword match (${matchCount}/${keywords.length})`,
  };
}

function scoreCampaignRelevance(
  result: ExaSearchResult,
  campaign: Campaign
): QualificationSignal {
  if (!campaign.target_description) {
    return {
      name: "Campaign Fit",
      score: 0,
      maxScore: 15,
      reason: "No target description specified",
    };
  }

  const text = [result.title, result.summary, result.text]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const description = campaign.target_description.toLowerCase();
  const keywords = description.split(/\s+/).filter((k) => k.length > 3);

  let matchCount = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) matchCount++;
  }

  const matchRatio = keywords.length > 0 ? matchCount / keywords.length : 0;
  const score = Math.round(matchRatio * 15);

  return {
    name: "Campaign Fit",
    score,
    maxScore: 15,
    reason:
      matchRatio > 0.4
        ? `Strong alignment with campaign goals`
        : matchRatio > 0.2
          ? `Moderate alignment with campaign goals`
          : `Weak alignment with campaign goals`,
  };
}

function scoreBusinessInfoCompleteness(result: ExaSearchResult): QualificationSignal {
  const text = [result.summary, result.text].filter(Boolean).join(" ");

  let score = 0;
  const reasons: string[] = [];

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(text)) {
    score += 5;
    reasons.push("email found");
  }

  const phoneRegex = /\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
  if (phoneRegex.test(text)) {
    score += 5;
    reasons.push("phone found");
  }

  const linkedInRegex = /linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+/;
  if (linkedInRegex.test(text) || linkedInRegex.test(result.url)) {
    score += 3;
    reasons.push("LinkedIn found");
  }

  if (result.summary && result.summary.length > 100) {
    score += 2;
    reasons.push("detailed summary");
  }

  return {
    name: "Business Info",
    score: Math.min(15, score),
    maxScore: 15,
    reason: reasons.length > 0 ? reasons.join(", ") : "No contact info found",
  };
}

function scoreWebsiteAvailability(result: ExaSearchResult): QualificationSignal {
  const url = result.url || "";

  const isNonWebsite =
    url.includes("linkedin.com") ||
    url.includes("crunchbase.com") ||
    url.includes("twitter.com") ||
    url.includes("facebook.com");

  if (isNonWebsite) {
    return {
      name: "Website",
      score: 0,
      maxScore: 15,
      reason: "No direct website (profile link only)",
    };
  }

  if (url && url.startsWith("http")) {
    return {
      name: "Website",
      score: 15,
      maxScore: 15,
      reason: "Direct website available",
    };
  }

  return {
    name: "Website",
    score: 0,
    maxScore: 15,
    reason: "No website found",
  };
}

function determineTemperature(score: number): "hot" | "warm" | "cold" {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

function buildReasonString(signals: QualificationSignal[]): string {
  const strengths = signals.filter((s) => s.score >= s.maxScore * 0.6);
  const weaknesses = signals.filter((s) => s.score <= s.maxScore * 0.3);

  const parts: string[] = [];

  if (strengths.length > 0) {
    parts.push(`Strong in: ${strengths.map((s) => s.name).join(", ")}`);
  }

  if (weaknesses.length > 0) {
    parts.push(`Weak in: ${weaknesses.map((s) => s.name).join(", ")}`);
  }

  return parts.join(". ") || "Mixed qualification signals";
}

export function qualifyLead(
  result: ExaSearchResult,
  campaign: Campaign
): QualificationResult {
  const signals: QualificationSignal[] = [
    scoreIndustryRelevance(result, campaign),
    scoreLocationRelevance(result, campaign),
    scoreKeywordRelevance(result, campaign),
    scoreCampaignRelevance(result, campaign),
    scoreBusinessInfoCompleteness(result),
    scoreWebsiteAvailability(result),
  ];

  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
  const score = Math.min(100, Math.max(0, totalScore));
  const temperature = determineTemperature(score);
  const reason = buildReasonString(signals);

  return {
    score,
    temperature,
    signals,
    reason,
  };
}
