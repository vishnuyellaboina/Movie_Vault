import type { IndustryKey } from "../types/domain.js";

export const INDUSTRY_CONFIG: Record<
  IndustryKey,
  { language?: string; withOriginCountry?: string; region?: string }
> = {
  hollywood: {
    language: "en",
    withOriginCountry: "US",
    region: "US",
  },
  bollywood: {
    language: "hi",
    withOriginCountry: "IN",
    region: "IN",
  },
  tollywood: {
    language: "te",
    withOriginCountry: "IN",
    region: "IN",
  },
  kollywood: {
    language: "ta",
    withOriginCountry: "IN",
    region: "IN",
  },
  mollywood: {
    language: "ml",
    withOriginCountry: "IN",
    region: "IN",
  },
};
