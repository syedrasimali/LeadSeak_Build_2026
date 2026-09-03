/* ---------------------------------------------------------------------------
   DEMO DATA — UI phase only.

   Every value in this file is fabricated for the purposes of building and
   reviewing the interface. Nothing here is fetched, persisted, or derived from
   a real account. This module is the single place to delete once the data
   layer lands.
   --------------------------------------------------------------------------- */

export type Temperature = "hot" | "warm" | "cold";
export type CampaignStatus = "active" | "paused" | "draft" | "completed";

export interface DemoLead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  location: string;
  employees: string;
  industry: string;
  score: number;
  temperature: Temperature;
  campaign: string;
  stage: "New" | "Contacted" | "Replied" | "Qualified" | "Won";
  addedAt: string;
  signals: string[];
  scoreBreakdown: { label: string; value: number }[];
}

export interface DemoCampaign {
  id: string;
  name: string;
  criteria: string;
  status: CampaignStatus;
  prospects: number;
  qualified: number;
  hot: number;
  replyRate: number;
  createdAt: string;
  trend: number[];
}

export const demoTotals = {
  totalLeads: 2481,
  hotLeads: 312,
  warmLeads: 864,
  coldLeads: 1305,
  activeCampaigns: 6,
} as const;

export const demoDeltas = {
  totalLeads: { value: "+18.2%", trend: "up" as const },
  hotLeads: { value: "+9.4%", trend: "up" as const },
  warmLeads: { value: "+4.1%", trend: "up" as const },
  coldLeads: { value: "-2.6%", trend: "down" as const },
  activeCampaigns: { value: "+2", trend: "up" as const },
};

/* 12-point series used by the overview sparklines and area chart. */
export const demoDiscoverySeries = [
  128, 164, 142, 198, 176, 241, 218, 287, 264, 322, 298, 361,
];

export const demoSparklines = {
  totalLeads: [12, 18, 15, 24, 21, 29, 26, 34, 31, 38, 36, 44],
  hotLeads: [4, 6, 5, 8, 7, 11, 9, 13, 12, 15, 14, 18],
  warmLeads: [9, 12, 11, 16, 15, 19, 18, 23, 21, 26, 25, 30],
  coldLeads: [22, 26, 24, 28, 27, 25, 26, 24, 23, 22, 21, 20],
  activeCampaigns: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6],
};

export const demoCampaigns: DemoCampaign[] = [
  {
    id: "cmp_01",
    name: "EU SaaS founders, Series A",
    criteria: "B2B SaaS · 20–80 staff · EU · Series A",
    status: "active",
    prospects: 842,
    qualified: 214,
    hot: 68,
    replyRate: 31,
    createdAt: "12 Aug 2026",
    trend: [18, 24, 21, 32, 29, 41, 38, 52],
  },
  {
    id: "cmp_02",
    name: "Agency owners, US mid-market",
    criteria: "Marketing agency · 10–50 staff · US",
    status: "active",
    prospects: 613,
    qualified: 178,
    hot: 54,
    replyRate: 27,
    createdAt: "04 Aug 2026",
    trend: [14, 19, 22, 20, 28, 26, 34, 39],
  },
  {
    id: "cmp_03",
    name: "Logistics ops leads",
    criteria: "Freight & logistics · 100+ staff · NL/DE",
    status: "paused",
    prospects: 429,
    qualified: 96,
    hot: 22,
    replyRate: 18,
    createdAt: "27 Jul 2026",
    trend: [11, 16, 14, 21, 19, 17, 15, 12],
  },
  {
    id: "cmp_04",
    name: "DTC retail, holiday push",
    criteria: "E-commerce · DTC · $5M+ revenue",
    status: "draft",
    prospects: 397,
    qualified: 88,
    hot: 19,
    replyRate: 0,
    createdAt: "22 Jul 2026",
    trend: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "cmp_05",
    name: "Fintech compliance leads",
    criteria: "Fintech · 50–200 staff · UK",
    status: "active",
    prospects: 356,
    qualified: 121,
    hot: 41,
    replyRate: 24,
    createdAt: "18 Jul 2026",
    trend: [9, 13, 17, 15, 22, 25, 28, 31],
  },
  {
    id: "cmp_06",
    name: "Healthtech procurement",
    criteria: "Healthtech · 200+ staff · Nordics",
    status: "completed",
    prospects: 288,
    qualified: 74,
    hot: 16,
    replyRate: 22,
    createdAt: "02 Jul 2026",
    trend: [12, 15, 18, 22, 25, 24, 23, 21],
  },
];

export const demoLeads: DemoLead[] = [
  {
    id: "ld_01",
    name: "Nadia Okonjo",
    role: "VP Revenue",
    company: "Vertex Labs",
    email: "nadia@vertexlabs.io",
    location: "Berlin, DE",
    employees: "42",
    industry: "B2B SaaS",
    score: 92,
    temperature: "hot",
    campaign: "EU SaaS founders, Series A",
    stage: "Qualified",
    addedAt: "2h ago",
    signals: ["Hiring 3 AEs", "Raised Series A", "Uses HubSpot"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 96 },
      { label: "Buying signals", value: 91 },
      { label: "Contact quality", value: 88 },
    ],
  },
  {
    id: "ld_02",
    name: "Tom Ashby",
    role: "Founder",
    company: "Northwind Studio",
    email: "tom@northwind.studio",
    location: "Dublin, IE",
    employees: "28",
    industry: "Agency",
    score: 88,
    temperature: "hot",
    campaign: "Agency owners, US mid-market",
    stage: "Replied",
    addedAt: "5h ago",
    signals: ["Posted about outbound", "Expanding to US"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 90 },
      { label: "Buying signals", value: 87 },
      { label: "Contact quality", value: 86 },
    ],
  },
  {
    id: "ld_03",
    name: "Priya Raman",
    role: "Head of Operations",
    company: "Cobalt Freight",
    email: "priya@cobaltfreight.com",
    location: "Rotterdam, NL",
    employees: "61",
    industry: "Logistics",
    score: 74,
    temperature: "warm",
    campaign: "Logistics ops leads",
    stage: "Contacted",
    addedAt: "1d ago",
    signals: ["New ops director", "Fleet expansion"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 82 },
      { label: "Buying signals", value: 68 },
      { label: "Contact quality", value: 71 },
    ],
  },
  {
    id: "ld_04",
    name: "Erik Lund",
    role: "CTO",
    company: "Halden Systems",
    email: "erik@halden.no",
    location: "Oslo, NO",
    employees: "115",
    industry: "Healthtech",
    score: 68,
    temperature: "warm",
    campaign: "Healthtech procurement",
    stage: "Contacted",
    addedAt: "1d ago",
    signals: ["Evaluating vendors"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 74 },
      { label: "Buying signals", value: 61 },
      { label: "Contact quality", value: 69 },
    ],
  },
  {
    id: "ld_05",
    name: "Sofia Marchetti",
    role: "Director of Sales",
    company: "Lumen Retail",
    email: "sofia@lumenretail.it",
    location: "Milan, IT",
    employees: "88",
    industry: "E-commerce",
    score: 63,
    temperature: "warm",
    campaign: "DTC retail, holiday push",
    stage: "New",
    addedAt: "2d ago",
    signals: ["Seasonal hiring"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 71 },
      { label: "Buying signals", value: 55 },
      { label: "Contact quality", value: 64 },
    ],
  },
  {
    id: "ld_06",
    name: "James Whitfield",
    role: "COO",
    company: "Meridian Pay",
    email: "james@meridianpay.co.uk",
    location: "London, UK",
    employees: "146",
    industry: "Fintech",
    score: 81,
    temperature: "hot",
    campaign: "Fintech compliance leads",
    stage: "Qualified",
    addedAt: "2d ago",
    signals: ["FCA licence granted", "Hiring compliance"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 88 },
      { label: "Buying signals", value: 79 },
      { label: "Contact quality", value: 76 },
    ],
  },
  {
    id: "ld_07",
    name: "Mei Tanaka",
    role: "Growth Lead",
    company: "Orbit Retail",
    email: "mei@orbitretail.jp",
    location: "Tokyo, JP",
    employees: "54",
    industry: "E-commerce",
    score: 44,
    temperature: "cold",
    campaign: "DTC retail, holiday push",
    stage: "New",
    addedAt: "3d ago",
    signals: [],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 58 },
      { label: "Buying signals", value: 31 },
      { label: "Contact quality", value: 42 },
    ],
  },
  {
    id: "ld_08",
    name: "Samuel Adeyemi",
    role: "Sales Director",
    company: "Lagos Logistics",
    email: "samuel@lagoslog.ng",
    location: "Lagos, NG",
    employees: "203",
    industry: "Logistics",
    score: 37,
    temperature: "cold",
    campaign: "Logistics ops leads",
    stage: "New",
    addedAt: "4d ago",
    signals: [],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 49 },
      { label: "Buying signals", value: 24 },
      { label: "Contact quality", value: 38 },
    ],
  },
  {
    id: "ld_09",
    name: "Clara Nowak",
    role: "Head of Partnerships",
    company: "Bright Ledger",
    email: "clara@brightledger.pl",
    location: "Warsaw, PL",
    employees: "37",
    industry: "Fintech",
    score: 79,
    temperature: "warm",
    campaign: "Fintech compliance leads",
    stage: "Replied",
    addedAt: "4d ago",
    signals: ["Partnership programme launch"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 84 },
      { label: "Buying signals", value: 74 },
      { label: "Contact quality", value: 78 },
    ],
  },
  {
    id: "ld_10",
    name: "Dmitri Volkov",
    role: "VP Engineering",
    company: "Arcline Cloud",
    email: "dmitri@arcline.cloud",
    location: "Tallinn, EE",
    employees: "66",
    industry: "B2B SaaS",
    score: 85,
    temperature: "hot",
    campaign: "EU SaaS founders, Series A",
    stage: "Won",
    addedAt: "5d ago",
    signals: ["Migrated stack", "Hiring RevOps"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 92 },
      { label: "Buying signals", value: 83 },
      { label: "Contact quality", value: 80 },
    ],
  },
  {
    id: "ld_11",
    name: "Aisha Karim",
    role: "Marketing Director",
    company: "Solstice Media",
    email: "aisha@solsticemedia.ae",
    location: "Dubai, AE",
    employees: "31",
    industry: "Agency",
    score: 58,
    temperature: "warm",
    campaign: "Agency owners, US mid-market",
    stage: "Contacted",
    addedAt: "6d ago",
    signals: ["Rebranding"],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 66 },
      { label: "Buying signals", value: 48 },
      { label: "Contact quality", value: 61 },
    ],
  },
  {
    id: "ld_12",
    name: "Lucas Ferreira",
    role: "Head of Growth",
    company: "Verde Commerce",
    email: "lucas@verde.com.br",
    location: "São Paulo, BR",
    employees: "94",
    industry: "E-commerce",
    score: 41,
    temperature: "cold",
    campaign: "DTC retail, holiday push",
    stage: "New",
    addedAt: "1w ago",
    signals: [],
    scoreBreakdown: [
      { label: "Firmographic fit", value: 52 },
      { label: "Buying signals", value: 29 },
      { label: "Contact quality", value: 45 },
    ],
  },
];

export interface DemoActivity {
  id: string;
  kind: "discovery" | "score" | "reply" | "campaign" | "stage";
  title: string;
  detail: string;
  at: string;
}

export const demoActivity: DemoActivity[] = [
  {
    id: "ac_01",
    kind: "discovery",
    title: "Discovery run completed",
    detail: "142 new prospects added to EU SaaS founders, Series A",
    at: "12m ago",
  },
  {
    id: "ac_02",
    kind: "score",
    title: "Nadia Okonjo scored 92",
    detail: "Promoted from warm to hot after a hiring signal",
    at: "2h ago",
  },
  {
    id: "ac_03",
    kind: "reply",
    title: "Tom Ashby replied",
    detail: "Northwind Studio · Agency owners, US mid-market",
    at: "5h ago",
  },
  {
    id: "ac_04",
    kind: "stage",
    title: "Dmitri Volkov moved to Won",
    detail: "Arcline Cloud · closed from EU SaaS founders",
    at: "1d ago",
  },
  {
    id: "ac_05",
    kind: "campaign",
    title: "Logistics ops leads paused",
    detail: "Discovery credits preserved for next cycle",
    at: "2d ago",
  },
  {
    id: "ac_06",
    kind: "discovery",
    title: "Discovery run completed",
    detail: "96 new prospects added to Fintech compliance leads",
    at: "3d ago",
  },
];

/* Analytics */

export const demoFunnel = [
  { stage: "Discovered", value: 2481, pct: 100 },
  { stage: "Processed", value: 1902, pct: 77 },
  { stage: "Qualified", value: 614, pct: 25 },
  { stage: "Hot", value: 312, pct: 13 },
  { stage: "Won", value: 23, pct: 1 },
];

export const demoAnalyticsMetrics = [
  { label: "Qualification rate", value: "24.7%", delta: "+2.4pt", trend: "up" as const },
  { label: "Avg. lead score", value: "61.3", delta: "+1.8", trend: "up" as const },
  { label: "Reply rate", value: "26.4%", delta: "+3.1pt", trend: "up" as const },
  { label: "Cost per qualified lead", value: "$4.18", delta: "-$0.62", trend: "up" as const },
];

export const demoMonthlyLabels = [
  "Sep", "Oct", "Nov", "Dec", "Jan", "Feb",
  "Mar", "Apr", "May", "Jun", "Jul", "Aug",
];

export const demoQualifiedSeries = [
  38, 52, 44, 68, 61, 79, 72, 88, 81, 94, 86, 104,
];

export const demoIndustryBreakdown = [
  { label: "B2B SaaS", value: 782 },
  { label: "Agency", value: 594 },
  { label: "Fintech", value: 431 },
  { label: "E-commerce", value: 386 },
  { label: "Logistics", value: 288 },
];
