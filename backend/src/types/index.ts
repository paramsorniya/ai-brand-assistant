export interface BrandSummary {
  brand_name?: string | null;
  tagline?: string | null;
  target_audience?: string | null;
  tone?: string | null;
  core_values?: string[];
  keywords?: string[];
  industry?: string | null;
  unique_selling_point?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  summary: BrandSummary;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  brand_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatResponse {
  reply: string;
  updated_summary: BrandSummary;
}
