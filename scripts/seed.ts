import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  console.log("Seeding test data...");

  // First, sign in as the test user
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;

  if (!email || !password) {
    console.error("Set SEED_EMAIL and SEED_PASSWORD in .env.local before seeding.");
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }

  const userId = authData.user?.id;
  if (!userId) {
    console.error("No user ID");
    return;
  }

  console.log("Signed in as:", userId);

  // Create test campaigns
  const campaigns = [
    {
      user_id: userId,
      name: "EU SaaS Founders - Series A",
      industry: "SaaS",
      location: "EU",
      keywords: "Series A, hiring, outbound",
      target_description: "B2B SaaS companies in the EU with 20-80 staff that recently raised Series A",
      status: "active" as const,
    },
    {
      user_id: userId,
      name: "US Fintech Compliance Leads",
      industry: "Fintech",
      location: "US",
      keywords: "compliance, regulatory, B2B",
      target_description: "Fintech companies needing compliance solutions",
      status: "active" as const,
    },
    {
      user_id: userId,
      name: "Logistics Ops - Mid Market",
      industry: "Logistics",
      location: "US",
      keywords: "operations, supply chain, mid-market",
      target_description: "Mid-market logistics companies optimizing operations",
      status: "paused" as const,
    },
  ];

  const { data: campaignData, error: campaignError } = await supabase
    .from("campaigns")
    .insert(campaigns)
    .select();

  if (campaignError) {
    console.error("Campaign error:", campaignError.message);
    return;
  }

  console.log("Created", campaignData?.length, "campaigns");

  // Create test leads
  const leads = [
    {
      user_id: userId,
      campaign_id: campaignData![0].id,
      company_name: "Northwind Studio",
      contact_name: "Tom Ashby",
      job_title: "Founder & CEO",
      industry: "SaaS",
      location: "Berlin, Germany",
      email: "tom@northwind.studio",
      website: "https://northwind.studio",
      score: 85,
      temperature: "hot" as const,
      status: "replied" as const,
      description: "Agency owners, US mid-market",
    },
    {
      user_id: userId,
      campaign_id: campaignData![0].id,
      company_name: "Arcline Cloud",
      contact_name: "Dmitri Volkov",
      job_title: "VP Sales",
      industry: "SaaS",
      location: "Amsterdam, Netherlands",
      email: "dmitri@arcline.cloud",
      website: "https://arcline.cloud",
      score: 92,
      temperature: "hot" as const,
      status: "won" as const,
      description: "Closed from EU SaaS founders campaign",
    },
    {
      user_id: userId,
      campaign_id: campaignData![0].id,
      company_name: "Nadia Tech",
      contact_name: "Nadia Okonjo",
      job_title: "Head of Growth",
      industry: "SaaS",
      location: "Paris, France",
      email: "nadia@nadiatech.com",
      website: "https://nadiatech.com",
      score: 78,
      temperature: "warm" as const,
      status: "qualified" as const,
      description: "Promoted from warm to hot after hiring signal",
    },
    {
      user_id: userId,
      campaign_id: campaignData![1].id,
      company_name: "ComplianceFirst",
      contact_name: "Sarah Chen",
      job_title: "CTO",
      industry: "Fintech",
      location: "New York, US",
      email: "sarah@compliancefirst.com",
      website: "https://compliancefirst.com",
      score: 88,
      temperature: "hot" as const,
      status: "contacted" as const,
    },
    {
      user_id: userId,
      campaign_id: campaignData![1].id,
      company_name: "RegTech Solutions",
      contact_name: "Mike Johnson",
      job_title: "Founder",
      industry: "Fintech",
      location: "San Francisco, US",
      email: "mike@regtech.com",
      website: "https://regtech.com",
      score: 65,
      temperature: "warm" as const,
      status: "new" as const,
    },
    {
      user_id: userId,
      campaign_id: campaignData![2].id,
      company_name: "LogiFlow",
      contact_name: "Emma Wilson",
      job_title: "Ops Director",
      industry: "Logistics",
      location: "Chicago, US",
      email: "emma@logiflow.com",
      website: "https://logiflow.com",
      score: 42,
      temperature: "cold" as const,
      status: "new" as const,
    },
  ];

  const { data: leadData, error: leadError } = await supabase
    .from("leads")
    .insert(leads)
    .select();

  if (leadError) {
    console.error("Lead error:", leadError.message);
    return;
  }

  console.log("Created", leadData?.length, "leads");
  console.log("Seed complete!");
}

seed().catch(console.error);
