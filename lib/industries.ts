import { IndustryKey } from "@/types/movie";

export const INDUSTRY_CONFIG: Record<
  IndustryKey,
  { label: string; language?: string; region?: string; withOriginCountry?: string }
> = {
  hollywood: { label: "Hollywood", language: "en", region: "US", withOriginCountry: "US" },
  bollywood: { label: "Bollywood", language: "hi", region: "IN", withOriginCountry: "IN" },
  tollywood: { label: "Tollywood", language: "te", region: "IN", withOriginCountry: "IN" },
  kollywood: { label: "Kollywood", language: "ta", region: "IN", withOriginCountry: "IN" },
  mollywood: { label: "Mollywood", language: "ml", region: "IN", withOriginCountry: "IN" },
};
