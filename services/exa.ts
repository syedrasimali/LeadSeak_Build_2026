import type { Campaign } from "@/types/db";
import { qualifyLead } from "./qualification";

export interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  summary?: string;
  text?: string;
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  requestId?: string;
}

export interface NormalizedLead {
  company_name: string;
  contact_name: string | null;
  job_title: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  google_maps_url: string | null;
  description: string | null;
  source: string | null;
  score: number;
  temperature: "hot" | "warm" | "cold";
  reason: string;
  domain: string | null;
}

class ExaApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ExaApiError";
  }
}

async function exaRequest<T>(
  endpoint: string,
  body: Record<string, unknown>,
  timeoutMs = 30000
): Promise<T> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new ExaApiError("EXA_API_KEY is not configured", 500, "CONFIG_ERROR");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://api.exa.ai${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Exa API error: ${response.status}`;

      if (response.status === 401) {
        throw new ExaApiError("Invalid API key", 401, "AUTH_ERROR");
      } else if (response.status === 429) {
        throw new ExaApiError("Rate limit exceeded", 429, "RATE_LIMIT");
      } else if (response.status >= 500) {
        throw new ExaApiError("Exa service unavailable", 503, "SERVICE_ERROR");
      }

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new ExaApiError(errorMessage, response.status);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ExaApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ExaApiError("Request timeout", 408, "TIMEOUT");
    }

    throw new ExaApiError(
      error instanceof Error ? error.message : "Unknown error",
      500,
      "NETWORK_ERROR"
    );
  }
}

function buildQuery(campaign: Campaign): string {
  const parts: string[] = [];

  if (campaign.industry) {
    parts.push(campaign.industry);
  }

  if (campaign.location) {
    parts.push(campaign.location);
  }

  if (campaign.keywords) {
    parts.push(campaign.keywords);
  }

  if (campaign.target_description) {
    parts.push(campaign.target_description);
  }

  return parts.join(" ");
}

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    if (!host || host === "localhost") return null;
    return host;
  } catch {
    return null;
  }
}

function extractCompanyFromUrl(url: string): string {
  const domain = extractDomain(url);
  if (!domain) return "Unknown Company";

  const parts = domain.split(".");
  if (parts.length < 2) return domain;

  const name = parts[0];

  const cleaned = name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return cleaned || domain;
}

const INVALID_EMAILS = new Set([
  "example.com",
  "email.com",
  "test.com",
  "domain.com",
  "yourcompany.com",
  "yourdomain.com",
  "company.com",
  "sentry.io",
  "github.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "linkedin.com",
]);

function isValidEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (INVALID_EMAILS.has(domain)) return false;
  if (domain.includes("linkedin") || domain.includes("facebook")) return false;
  return true;
}

function extractEmails(text: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) ?? [];

  for (const email of matches) {
    if (isValidEmail(email)) return email.toLowerCase();
  }
  return null;
}

function extractPhone(text: string): string | null {
  const patterns = [
    /\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
    /\(\d{3}\)\s?\d{3}[\s.-]?\d{4}/g,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern) ?? [];
    for (const phone of matches) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length >= 7 && digits.length <= 15) {
        return phone.trim();
      }
    }
  }
  return null;
}

function extractLinkedIn(url: string, text: string): string | null {
  const linkedInRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/;
  const urlMatch = url.match(linkedInRegex);
  if (urlMatch) return `https://${urlMatch[0]}`;

  const textMatch = text.match(linkedInRegex);
  if (textMatch) return `https://${textMatch[0]}`;

  return null;
}

function extractCompanyLinkedIn(url: string, text: string): string | null {
  const regex = /linkedin\.com\/company\/[a-zA-Z0-9_-]+/;
  const urlMatch = url.match(regex);
  if (urlMatch) return `https://${urlMatch[0]}`;

  const textMatch = text.match(regex);
  if (textMatch) return `https://${textMatch[0]}`;

  return null;
}

function generateGoogleMapsUrl(
  companyName: string,
  location: string | null
): string | null {
  if (!companyName || companyName === "Unknown Company") return null;
  const query = location
    ? `${companyName} ${location}`
    : companyName;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function cleanCompanyName(title: string, url: string): string {
  const domain = extractDomain(url);

  const patterns = [
    /\s*[-|–—]\s*(LinkedIn|Crunchbase|Twitter|Facebook|GitHub|YouTube|Instagram).*$/i,
    /\s*[-|–—]\s*(Home|About|Contact|Blog|Careers|Pricing|Docs|Documentation).*$/i,
    /^\s*(Home|About|Contact|Blog|Welcome|Login|Sign Up|Dashboard)\s*[-|–—]\s*/i,
    /\s*\|.*$/,
  ];

  let cleaned = title;
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned.trim();

  if (!cleaned || cleaned.length < 2) {
    return extractCompanyFromUrl(url);
  }

  if (domain) {
    const domainCompany = extractCompanyFromUrl(url);
    if (
      cleaned.toLowerCase().includes(domainCompany.toLowerCase()) ||
      domainCompany.toLowerCase().includes(cleaned.toLowerCase().split(" ")[0])
    ) {
      if (cleaned.length > domainCompany.length + 5) {
        return cleaned;
      }
    }
  }

  return cleaned;
}

function isValidContactName(name: string | null | undefined): boolean {
  if (!name) return false;
  const invalid = [
    "exa",
    "exa ai",
    "admin",
    "info",
    "support",
    "contact",
    "webmaster",
    "noreply",
    "no-reply",
    "root",
    "hello",
    "team",
    "sales",
    "marketing",
  ];
  return !invalid.includes(name.toLowerCase().trim());
}

const NON_WEBSITE_DOMAINS = new Set([
  "linkedin.com",
  "crunchbase.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "github.com",
  "medium.com",
  "tech.eu",
  "techcrunch.com",
]);

function isNonWebsiteDomain(domain: string | null): boolean {
  if (!domain) return false;
  const base = domain.replace(/^www\./, "");
  return NON_WEBSITE_DOMAINS.has(base);
}

function normalizeResult(
  result: ExaSearchResult,
  campaign: Campaign
): NormalizedLead {
  const text = [result.summary, result.text].filter(Boolean).join(" ");
  const domain = extractDomain(result.url);
  const companyName = cleanCompanyName(result.title, result.url);

  const contactName = isValidContactName(result.author)
    ? result.author!
    : null;

  const websiteIsNonWebsite = isNonWebsiteDomain(domain);
  const website = websiteIsNonWebsite
    ? null
    : result.url && domain
      ? `https://${domain}`
      : result.url || null;

  const leadDomain = websiteIsNonWebsite ? null : domain;

  const qualification = qualifyLead(result, campaign);

  return {
    company_name: companyName,
    contact_name: contactName,
    job_title: null,
    industry: campaign.industry || null,
    location: campaign.location || null,
    website,
    email: extractEmails(text),
    phone: extractPhone(text),
    linkedin_url:
      extractLinkedIn(result.url, text) ||
      extractCompanyLinkedIn(result.url, text),
    google_maps_url: generateGoogleMapsUrl(
      companyName,
      campaign.location || null
    ),
    description: result.summary || result.text?.slice(0, 500) || null,
    source: "exa",
    score: qualification.score,
    temperature: qualification.temperature,
    reason: qualification.reason,
    domain: leadDomain,
  };
}

export async function searchProspects(
  campaign: Campaign,
  limit = 10
): Promise<NormalizedLead[]> {
  const query = buildQuery(campaign);

  if (!query.trim()) {
    throw new ExaApiError(
      "Campaign must have industry, location, keywords, or target description",
      400,
      "INVALID_INPUT"
    );
  }

  const response = await exaRequest<ExaSearchResponse>("/search", {
    query,
    numResults: limit,
    contents: {
      text: true,
      summary: true,
    },
  });

  if (!response.results || !Array.isArray(response.results)) {
    throw new ExaApiError(
      "Invalid response format from Exa API",
      500,
      "INVALID_RESPONSE"
    );
  }

  if (response.results.length === 0) {
    return [];
  }

  return response.results.map((result) => normalizeResult(result, campaign));
}

export { ExaApiError };
