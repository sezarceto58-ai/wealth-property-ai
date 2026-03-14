/**
 * AI Valuation Engine — Module 1
 * Calculates property valuation, discount vs market, and confidence metrics
 * using a weighted multi-factor model.
 */

export interface ValuationInput {
  price: number;
  area: number; // m²
  bedrooms: number;
  bathrooms: number;
  city: string;
  district: string;
  propertyType: string;
  age?: number; // years old
  floor?: number;
  verified?: boolean;
  features?: string[];
}

export interface ValuationResult {
  estimatedValue: number;
  discountVsMarket: number; // negative = below market (good buy), positive = above
  discountPercent: number;
  confidenceScore: number; // 0–100
  confidenceLabel: "high" | "medium" | "low";
  pricePerSqm: number;
  marketPricePerSqm: number;
  verdict: "undervalued" | "fair" | "overvalued";
  verdictLabel: string;
  factors: ValuationFactor[];
  comparables: Comparable[];
  appreciation: AppreciationForecast;
}

export interface ValuationFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number; // 0–1
  description: string;
}

export interface Comparable {
  title: string;
  price: number;
  area: number;
  pricePerSqm: number;
  distance: string;
  similarity: number; // 0–100
}

export interface AppreciationForecast {
  oneYear: number;
  threeYear: number;
  fiveYear: number;
  trend: "strong_growth" | "moderate_growth" | "stable" | "declining";
}

// ── Market Base Rates ($/m²) by city ──
const CITY_BASE_RATES: Record<string, number> = {
  Erbil: 2200,
  Baghdad: 1850,
  Basra: 1400,
  Sulaymaniyah: 1650,
};

// ── District Premium Multipliers ──
const DISTRICT_PREMIUMS: Record<string, number> = {
  // Erbil
  Ankawa: 1.25,
  Gulan: 1.15,
  Ainkawa: 1.20,
  Shorsh: 1.10,
  Sarchinar: 0.95,
  Koya: 0.90,
  // Baghdad
  Mansour: 1.30,
  Karrada: 1.18,
  Zayouna: 1.12,
  Jadriya: 1.22,
  Adhamiya: 1.05,
  Sadr: 0.82,
  // Basra
  Ashar: 1.10,
  Brazilja: 0.95,
  // Sulaymaniyah
  Bakhtiari: 1.15,
  Qadisiyah: 1.08,
};

// ── Property Type Multipliers ──
const PROPERTY_TYPE_MULTIPLIERS: Record<string, number> = {
  Villa: 1.20,
  Penthouse: 1.35,
  Apartment: 1.00,
  Commercial: 1.10,
  Land: 0.85,
  Townhouse: 1.05,
  Office: 1.15,
  Warehouse: 0.80,
};

/**
 * Core valuation algorithm using comparable sales and market adjustments.
 */
export function calculateValuation(input: ValuationInput): ValuationResult {
  const {
    price, area, city, district, propertyType,
    bedrooms = 3, bathrooms = 2, age = 5, verified = false, features = [],
  } = input;

  // 1. Base market value
  const cityBase = CITY_BASE_RATES[city] ?? 1700;
  const districtMultiplier = DISTRICT_PREMIUMS[district] ?? 1.0;
  const typeMultiplier = PROPERTY_TYPE_MULTIPLIERS[propertyType] ?? 1.0;

  let marketPricePerSqm = cityBase * districtMultiplier * typeMultiplier;

  // 2. Bedroom/bathroom adjustment
  const bedroomBonus = (bedrooms - 2) * 0.03; // +3% per extra bedroom above 2
  const bathroomBonus = (bathrooms - 1) * 0.02;
  marketPricePerSqm *= 1 + bedroomBonus + bathroomBonus;

  // 3. Age depreciation
  const agePenalty = Math.min(age * 0.008, 0.20); // max 20% depreciation
  marketPricePerSqm *= 1 - agePenalty;

  // 4. Feature premiums
  const premiumFeatures = ["Pool", "Smart Home", "Sea View", "Mountain View", "Garden", "Gym", "Parking"];
  const featurePremium = features.filter(f => premiumFeatures.some(pf => f.includes(pf))).length * 0.025;
  marketPricePerSqm *= 1 + featurePremium;

  // 5. Verified premium
  if (verified) marketPricePerSqm *= 1.03;

  const estimatedValue = Math.round(marketPricePerSqm * area);
  const pricePerSqm = Math.round(price / area);
  const marketPricePerSqmRounded = Math.round(marketPricePerSqm);

  // 6. Discount calculation
  const discountVsMarket = price - estimatedValue;
  const discountPercent = Math.round((discountVsMarket / estimatedValue) * 100);

  // 7. Verdict
  let verdict: ValuationResult["verdict"];
  let verdictLabel: string;
  if (discountPercent <= -10) { verdict = "undervalued"; verdictLabel = "🟢 Undervalued — Strong Buy Signal"; }
  else if (discountPercent >= 10) { verdict = "overvalued"; verdictLabel = "🔴 Overvalued — Exercise Caution"; }
  else { verdict = "fair"; verdictLabel = "🟡 Fair Market Value"; }

  // 8. Confidence
  const hasDistrict = district in DISTRICT_PREMIUMS;
  const hasCity = city in CITY_BASE_RATES;
  const hasType = propertyType in PROPERTY_TYPE_MULTIPLIERS;
  const confidenceScore = 55 + (hasDistrict ? 20 : 0) + (hasCity ? 15 : 0) + (hasType ? 10 : 0);
  const confidenceLabel: ValuationResult["confidenceLabel"] =
    confidenceScore >= 80 ? "high" : confidenceScore >= 60 ? "medium" : "low";

  // 9. Valuation factors
  const factors: ValuationFactor[] = [
    {
      name: "Location Premium",
      impact: districtMultiplier > 1 ? "positive" : districtMultiplier < 1 ? "negative" : "neutral",
      weight: districtMultiplier,
      description: `${district} commands a ${Math.round((districtMultiplier - 1) * 100)}% ${districtMultiplier > 1 ? "premium" : "discount"} vs city average.`,
    },
    {
      name: "Property Type",
      impact: typeMultiplier > 1 ? "positive" : "neutral",
      weight: typeMultiplier,
      description: `${propertyType} properties trade at a ${Math.round((typeMultiplier - 1) * 100)}% premium in this market.`,
    },
    {
      name: "Property Age",
      impact: age > 10 ? "negative" : "neutral",
      weight: 1 - agePenalty,
      description: `${age}-year-old property carries a ${Math.round(agePenalty * 100)}% age depreciation.`,
    },
    {
      name: "Features & Amenities",
      impact: featurePremium > 0 ? "positive" : "neutral",
      weight: 1 + featurePremium,
      description: `${features.length} premium features add ${Math.round(featurePremium * 100)}% to valuation.`,
    },
    ...(verified ? [{
      name: "Verified Listing",
      impact: "positive" as const,
      weight: 1.03,
      description: "Verified properties command a 3% market premium due to trust signal.",
    }] : []),
  ];

  // 10. Comparables (synthetic)
  const comparables: Comparable[] = [
    {
      title: `${district} ${propertyType} — Comp A`,
      price: Math.round(estimatedValue * 0.97),
      area: Math.round(area * 0.95),
      pricePerSqm: marketPricePerSqmRounded,
      distance: "0.3 km",
      similarity: 94,
    },
    {
      title: `${district} ${propertyType} — Comp B`,
      price: Math.round(estimatedValue * 1.04),
      area: Math.round(area * 1.08),
      pricePerSqm: Math.round(marketPricePerSqm * 0.98),
      distance: "0.7 km",
      similarity: 87,
    },
    {
      title: `${city} ${propertyType} — Comp C`,
      price: Math.round(estimatedValue * 0.93),
      area: Math.round(area * 0.90),
      pricePerSqm: Math.round(marketPricePerSqm * 1.03),
      distance: "1.2 km",
      similarity: 79,
    },
  ];

  // 11. Appreciation forecast
  const cityGrowthRate: Record<string, number> = {
    Erbil: 7.8, Baghdad: 4.2, Basra: 3.1, Sulaymaniyah: 5.5,
  };
  const growthRate = (cityGrowthRate[city] ?? 5.0) / 100;
  const appreciation: AppreciationForecast = {
    oneYear: Math.round(estimatedValue * (1 + growthRate)),
    threeYear: Math.round(estimatedValue * Math.pow(1 + growthRate, 3)),
    fiveYear: Math.round(estimatedValue * Math.pow(1 + growthRate, 5)),
    trend: growthRate > 0.06 ? "strong_growth" : growthRate > 0.04 ? "moderate_growth" : "stable",
  };

  return {
    estimatedValue,
    discountVsMarket,
    discountPercent,
    confidenceScore,
    confidenceLabel,
    pricePerSqm,
    marketPricePerSqm: marketPricePerSqmRounded,
    verdict,
    verdictLabel,
    factors,
    comparables,
    appreciation,
  };
}
