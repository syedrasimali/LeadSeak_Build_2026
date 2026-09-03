/* Database row types — kept in sync with supabase/migrations/001_init.sql. */

export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type Temperature = "hot" | "warm" | "cold";
export type LeadStatus =
  | "new"
  | "contacted"
  | "replied"
  | "qualified"
  | "won"
  | "lost";
export type SearchStatus = "pending" | "running" | "completed" | "failed";

export interface WorkspaceSettings {
  workspace_name: string;
  workspace_url: string;
  region: string;
  hot_threshold: string;
  notifications: {
    discovery_complete: boolean;
    new_hot_lead: boolean;
    weekly_digest: boolean;
  };
}

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  settings: WorkspaceSettings | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  kind: "discovery" | "score" | "reply" | "campaign" | "stage" | "lead" | "export";
  title: string;
  detail: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  industry: string | null;
  location: string | null;
  keywords: string | null;
  target_description: string | null;
  additional_criteria: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  campaign_id: string | null;
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
  temperature: Temperature;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface LeadSearch {
  id: string;
  user_id: string;
  campaign_id: string | null;
  query: string;
  status: SearchStatus;
  result_count: number | null;
  created_at: string;
}

export interface LeadScore {
  id: string;
  lead_id: string;
  score: number;
  temperature: Temperature;
  reason: string | null;
  created_at: string;
}

/* Insert shapes — omit server-managed fields. */
export type CampaignInsert = Omit<
  Campaign,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type CampaignUpdate = Partial<CampaignInsert>;

export type LeadInsert = Omit<
  Lead,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type LeadUpdate = Partial<LeadInsert>;

export type ProfileUpdate = Partial<Pick<Profile, "name" | "avatar_url" | "settings">>;
