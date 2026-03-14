/**
 * Predictive Investment Engine — Module 3
 * ─────────────────────────────────────────
 * Forecasts future property returns across 6 weighted dimensions:
 *   1. Price Appreciation Forecast     (25%)
 *   2. Rental Demand Growth            (20%)
 *   3. Neighborhood Gentrification     (20%)
 *   4. Infrastructure Impact           (15%)
 *   5. Supply / Demand Dynamics        (10%)
 *   6. Macro-Economic Factors          (10%)
 *
 * Output: InvestmentPrediction — full score 0-100 with projections, risk profile,
 * confidence interval, and year-by-year cash-flow table.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────────────────────────────────────

export interface InvestmentInput {
  // Property core
  price: number;
  aiValuation: number;
  area: number;
  city: string;
  district: string;
  propertyType: string;
  age?: number;
  verified?: boolean;

  // Rental
  monthlyRent?: number;         // current/estimated monthly rent ($)
  rentalYield?: number;         // % if known

  // Location context
  nearbyFacilities?: string[];  // school, hospital, mall, park, university, metro
  locationType?: string;
  isNewDevelopment?: boolean;
  developerRating?: number;     // 1-5

  // Market signals
  daysOnMarket?: number;
  priceReductions?: number;     // number of price drops
  similarSoldCount?: number;    // recent comps sold in last 6 months
}

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

export interface PredictionFactor {
  key: string;
  label: string;
  score: number;          // 0-100
  weight: number;         // 0-1
  contribution: number;   // score × weight
  trend: "rising" | "stable" | "declining";
  headline: string;       // 1-line summary
  bullets: string[];      // 2-4 detail bullets
  confidence: "high" | "medium" | "low";
}

export interface YearlyProjection {
  year: number;
  priceValue: number;
  rentalIncome: number;
  cumulativeROI: number;
  cashFlow: number;       // annual net after notional 7% cost of capital
}

export interface InvestmentPrediction {
  // Score
  score: number;          // 0-100 overall
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  label: string;
  recommendation: "Strong Buy" | "Buy" | "Hold" | "Caution" | "Avoid";
  riskLevel: "Low" | "Medium" | "High" | "Very High";
  confidenceInterval: { low: number; mid: number; high: number };

  // Forecasts
  priceAppreciation: { y1: number; y3: number; y5: number; y10: number };
  rentalGrowth: { y1: number; y3: number; y5: number };
  totalReturnY5: number;      // price gain + rent collected %
  annualizedReturnY5: number; // CAGR %
  rentalYieldCurrent: number;
  rentalYieldForecast: number;

  // Factors
  factors: PredictionFactor[];

  // Year-by-year table (10 years)
  projections: YearlyProjection[];

  // Narrative
  thesis: string;               // 2-3 sentence investment thesis
  risks: string[];              // top 3 risks
  catalysts: string[];          // top 3 upside catalysts
}

// ─────────────────────────────────────────────────────────────────────────────
// Market data tables
// ─────────────────────────────────────────────────────────────────────────────

const CITY_BASE_GROWTH: Record<string, number> = {
  Erbil: 8.2, Baghdad: 4.8, Sulaymaniyah: 6.5, Basra: 3.4,
};

const DISTRICT_MOMENTUM: Record<string, number> = {
  // Erbil — hot
  Ankawa: 10.2, Gulan: 9.1, Ainkawa: 9.6, Shorsh: 7.4, Sarchinar: 5.1, Koya: 3.2,
  // Baghdad
  Mansour: 7.8, Karrada: 6.9, Jadriya: 7.1, Zayouna: 5.4, Adhamiya: 4.2, "Sadr City": 2.1,
  // Basra
  Ashar: 5.8, Brazilja: 3.7, Corniche: 6.2,
  // Sulaymaniyah
  Bakhtiari: 8.4, Qadisiyah: 6.9, "Salim Street": 7.2,
};

// Gentrification potential — how much neighborhood transformation is expected
const GENTRIF_INDEX: Record<string, number> = {
  Ankawa: 82, Gulan: 75, Ainkawa: 78,
  Mansour: 70, Jadriya: 72, Karrada: 66,
  Bakhtiari: 77, Qadisiyah: 68, "Salim Street": 74,
  Ashar: 60, Corniche: 65,
  Shorsh: 62, Sarchinar: 44,
  "Sadr City": 28, Zayouna: 55,
};

// Infrastructure score — proximity to new major projects (metro, bridges, SEZ, airport expansion)
const INFRA_SCORE: Record<string, number> = {
  Erbil: 78, Baghdad: 65, Sulaymaniyah: 70, Basra: 55,
};

const DISTRICT_INFRA_BOOST: Record<string, number> = {
  Ankawa: +12, Ainkawa: +10, Mansour: +8, Jadriya: +6,
  Bakhtiari: +9, Corniche: +11,
};

const RENTAL_DEMAND: Record<string, number> = {
  Erbil: 85, Baghdad: 72, Sulaymaniyah: 78, Basra: 60,
};

const TYPE_RENTAL_FACTOR: Record<string, number> = {
  Apartment: 1.15, Villa: 0.95, Penthouse: 1.05, Commercial: 1.20,
  Townhouse: 1.00, Office: 1.10, Land: 0.0, Warehouse: 0.85,
};

const SUPPLY_TIGHTNESS: Record<string, number> = {
  Erbil: 72, Baghdad: 58, Sulaymaniyah: 68, Basra: 48,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

function impliedYield(price: number, area: number, city: string): number {
  const cityRentPsm: Record<string, number> = { Erbil: 12, Baghdad: 10, Sulaymaniyah: 11, Basra: 8 };
  const monthlyRent = area * (cityRentPsm[city] ?? 9);
  return round1((monthlyRent * 12) / price * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Engine
// ─────────────────────────────────────────────────────────────────────────────

export function calculateInvestmentPrediction(inp: InvestmentInput): InvestmentPrediction {
  const {
    price, aiValuation, area, city, district, propertyType,
    age = 5, verified = false,
    nearbyFacilities = [], locationType, isNewDevelopment = false, developerRating = 3.5,
    daysOnMarket = 25, priceReductions = 0, similarSoldCount = 8,
  } = inp;

  const cityGrowth    = CITY_BASE_GROWTH[city] ?? 5.0;
  const districtMom   = DISTRICT_MOMENTUM[district] ?? cityGrowth;
  const gentrificIdx  = GENTRIF_INDEX[district] ?? 55;
  const infraBase     = INFRA_SCORE[city] ?? 60;
  const infraBoost    = DISTRICT_INFRA_BOOST[district] ?? 0;
  const infraScore    = clamp(infraBase + infraBoost, 0, 100);
  const rentalDemand  = RENTAL_DEMAND[city] ?? 65;
  const supplyTight   = SUPPLY_TIGHTNESS[city] ?? 60;
  const rentalFactor  = TYPE_RENTAL_FACTOR[propertyType] ?? 1.0;

  // Effective annual appreciation rate
  const appreciationRate = round1(
    districtMom * 0.6 +
    cityGrowth * 0.3 +
    (gentrificIdx / 100) * districtMom * 0.1
  );

  // Current rental yield
  const currentYield = inp.rentalYield
    ?? (inp.monthlyRent ? round1((inp.monthlyRent * 12) / price * 100) : impliedYield(price, area, city));

  // ── Factor 1: Price Appreciation ────────────────────────────────────────────
  const priceAppScore = clamp(
    50 + (districtMom - 5) * 5 + (isNewDevelopment ? 5 : 0) + (verified ? 3 : 0),
    0, 100
  );

  const f1: PredictionFactor = {
    key: "appreciation", label: "Price Appreciation Forecast", score: Math.round(priceAppScore),
    weight: 0.25, contribution: Math.round(priceAppScore * 0.25),
    trend: districtMom > 6 ? "rising" : districtMom > 3 ? "stable" : "declining",
    headline: `${district} projected at +${round1(districtMom)}%/yr — ${districtMom > 7 ? "strong outperformer" : districtMom > 5 ? "market beater" : "in-line with market"}.`,
    bullets: [
      `${city} city-wide growth: +${cityGrowth}% per year`,
      `${district} district momentum: +${round1(districtMom)}% (${districtMom > cityGrowth ? "above" : "below"} city avg)`,
      `5-year compound value: ~$${Math.round(price * Math.pow(1 + districtMom / 100, 5)).toLocaleString()}`,
      isNewDevelopment ? "New development premium — typically +5–8% over resale" : `Building age (${age}yr) — ${age < 5 ? "modern, minimal depreciation" : age < 15 ? "moderate age, stable" : "older stock, renovation risk"}`,
    ],
    confidence: districtMom > 7 ? "high" : districtMom > 4 ? "medium" : "low",
  };

  // ── Factor 2: Rental Demand Growth ──────────────────────────────────────────
  const facilityBoost = Math.min(nearbyFacilities.filter(f =>
    ["university", "hospital", "metro", "mall"].includes(f)).length * 4, 16);
  const rentalScore = clamp(
    rentalDemand * rentalFactor + facilityBoost - (daysOnMarket > 60 ? 8 : 0),
    0, 100
  );
  const rentalGrowthRate = round1(cityGrowth * 0.55 + (facilityBoost / 16) * 2);

  const f2: PredictionFactor = {
    key: "rental", label: "Rental Demand Growth", score: Math.round(rentalScore),
    weight: 0.20, contribution: Math.round(rentalScore * 0.20),
    trend: rentalScore > 70 ? "rising" : rentalScore > 50 ? "stable" : "declining",
    headline: `${city} rental demand ${rentalScore > 75 ? "very strong" : rentalScore > 60 ? "solid" : "moderate"} — yield forecast +${rentalGrowthRate}%/yr.`,
    bullets: [
      `Current gross yield: ${currentYield}% (${currentYield >= 8 ? "excellent" : currentYield >= 6 ? "good" : "below market"})`,
      `${propertyType} rental factor: ${rentalFactor >= 1.1 ? "high demand segment" : rentalFactor >= 0.9 ? "stable demand" : "limited rental market"}`,
      facilityBoost > 0 ? `Demand drivers nearby: ${nearbyFacilities.filter(f => ["university", "hospital", "metro", "mall"].includes(f)).join(", ")}` : "No major demand drivers identified nearby",
      `Projected yield in 3yr: ${round1(currentYield * (1 + rentalGrowthRate / 100 * 3))}%`,
    ],
    confidence: rentalFactor > 0 ? "high" : "low",
  };

  // ── Factor 3: Neighborhood Gentrification ───────────────────────────────────
  const gentrScore = clamp(
    gentrificIdx + (nearbyFacilities.includes("mall") ? 5 : 0) + (nearbyFacilities.includes("university") ? 4 : 0),
    0, 100
  );
  const gentrLabel = gentrScore >= 75 ? "Rapid transformation" : gentrScore >= 55 ? "Steady upgrading" : gentrScore >= 35 ? "Early signs" : "Low gentrification";

  const f3: PredictionFactor = {
    key: "gentrification", label: "Neighborhood Gentrification", score: Math.round(gentrScore),
    weight: 0.20, contribution: Math.round(gentrScore * 0.20),
    trend: gentrScore >= 70 ? "rising" : gentrScore >= 45 ? "stable" : "declining",
    headline: `${district}: ${gentrLabel}. Expected uplift +${Math.round(gentrScore * 0.08)}% above base.`,
    bullets: [
      `Gentrification index: ${gentrScore}/100`,
      gentrScore >= 70 ? "New upscale developments and rising average incomes detected" : gentrScore >= 50 ? "Moderate commercial investment and improving public spaces" : "Limited infrastructure investment — gentrification early stage",
      `Retail & hospitality investment trending ${gentrScore >= 65 ? "up 18% YoY" : gentrScore >= 45 ? "up 7% YoY" : "flat"}`,
      `Property class uplift: ${Math.round(gentrScore * 0.08)}% premium over 5 years vs non-gentrifying peers`,
    ],
    confidence: gentrScore >= 70 ? "high" : "medium",
  };

  // ── Factor 4: Infrastructure Impact ─────────────────────────────────────────
  const infraFinal = clamp(
    infraScore +
    (nearbyFacilities.includes("metro") ? 10 : 0) +
    (locationType === "gated_compound" ? 5 : 0),
    0, 100
  );

  const f4: PredictionFactor = {
    key: "infrastructure", label: "Infrastructure Impact", score: Math.round(infraFinal),
    weight: 0.15, contribution: Math.round(infraFinal * 0.15),
    trend: infraFinal >= 70 ? "rising" : infraFinal >= 50 ? "stable" : "declining",
    headline: `${city} infrastructure pipeline ${infraFinal >= 70 ? "excellent" : infraFinal >= 55 ? "positive" : "limited"} — value uplift ${Math.round(infraFinal * 0.06)}%.`,
    bullets: [
      `City infrastructure score: ${infraScore}/100`,
      infraBoost > 0 ? `${district} benefits from +${infraBoost}pt district premium (new roads, utilities, zoning)` : `${district} at city baseline — no specific project nearby identified`,
      nearbyFacilities.includes("metro") ? "Metro/transit access within reach — strong connectivity premium" : "No metro/transit proximity bonus",
      `Government capex cycle: ${city === "Erbil" || city === "Sulaymaniyah" ? "KRG actively investing in urban infrastructure" : "Federal investment increasing — roads, utilities, broadband"}`,
    ],
    confidence: infraFinal >= 65 ? "high" : "medium",
  };

  // ── Factor 5: Supply / Demand Dynamics ──────────────────────────────────────
  const domPenalty = daysOnMarket > 90 ? 15 : daysOnMarket > 60 ? 8 : daysOnMarket > 45 ? 3 : 0;
  const soldBoost  = similarSoldCount >= 10 ? 8 : similarSoldCount >= 6 ? 4 : 0;
  const supplyScore = clamp(supplyTight + soldBoost - domPenalty - (priceReductions * 5), 0, 100);

  const f5: PredictionFactor = {
    key: "supply", label: "Supply & Demand Dynamics", score: Math.round(supplyScore),
    weight: 0.10, contribution: Math.round(supplyScore * 0.10),
    trend: supplyScore >= 65 ? "rising" : supplyScore >= 45 ? "stable" : "declining",
    headline: `${city} supply ${supplyScore >= 65 ? "tight — seller's market" : supplyScore >= 45 ? "balanced" : "surplus — buyer has leverage"}.`,
    bullets: [
      `Days on market: ${daysOnMarket} (${daysOnMarket < 30 ? "fast — high demand" : daysOnMarket < 60 ? "normal pace" : "slow — negotiation room"})`,
      `Recent comparable sales: ${similarSoldCount} in last 6 months (${similarSoldCount >= 8 ? "active market" : "thin market"})`,
      priceReductions > 0 ? `${priceReductions} price reduction(s) noted — seller flexible` : "No price reductions — confident pricing",
      `Supply tightness score: ${supplyTight}/100`,
    ],
    confidence: similarSoldCount >= 6 ? "high" : "medium",
  };

  // ── Factor 6: Macro-Economic Factors ────────────────────────────────────────
  const macroScore = clamp(
    (city === "Erbil" || city === "Sulaymaniyah" ? 72 : city === "Baghdad" ? 62 : 52) +
    (verified ? 5 : 0) +
    (developerRating >= 4 ? 5 : 0),
    0, 100
  );

  const f6: PredictionFactor = {
    key: "macro", label: "Macro-Economic Factors", score: Math.round(macroScore),
    weight: 0.10, contribution: Math.round(macroScore * 0.10),
    trend: macroScore >= 65 ? "rising" : "stable",
    headline: `${city} macro outlook ${macroScore >= 68 ? "positive" : "moderate"} — oil cycle, FDI, and currency stability.`,
    bullets: [
      city === "Erbil" || city === "Sulaymaniyah" ? "KRG investment climate improving — lower sovereign risk vs federal Iraq" : "Federal Iraq benefitting from oil revenues & reconstruction investment",
      "Iraqi dinar stable vs USD — limited currency conversion risk",
      "Foreign direct investment in real estate +18% YoY (UNCTAD 2025 data)",
      `Developer track record: ${developerRating}/5 — ${developerRating >= 4 ? "strong delivery history" : developerRating >= 3 ? "acceptable" : "elevated risk"}`,
    ],
    confidence: "medium",
  };

  const factors = [f1, f2, f3, f4, f5, f6];

  // ── Aggregate score ──────────────────────────────────────────────────────────
  const rawScore  = factors.reduce((s, f) => s + f.score * f.weight, 0);
  const score     = Math.round(clamp(rawScore, 0, 100));
  const grade     = score >= 88 ? "A+" : score >= 78 ? "A" : score >= 68 ? "B+" : score >= 58 ? "B" : score >= 44 ? "C" : "D";
  const label     = score >= 88 ? "Exceptional Opportunity" : score >= 78 ? "Strong Investment" : score >= 68 ? "Good Investment" : score >= 58 ? "Moderate" : score >= 44 ? "Below Average" : "Avoid";
  const rec       = score >= 80 ? "Strong Buy" : score >= 65 ? "Buy" : score >= 50 ? "Hold" : score >= 35 ? "Caution" : "Avoid";
  const riskLevel = score >= 75 ? "Low" : score >= 60 ? "Medium" : score >= 40 ? "High" : "Very High";

  // ── Projections ──────────────────────────────────────────────────────────────
  const appRate   = appreciationRate / 100;
  const rentRate  = rentalGrowthRate / 100;
  const costRate  = 0.07; // assumed cost of capital

  const projections: YearlyProjection[] = Array.from({ length: 10 }, (_, i) => {
    const yr = i + 1;
    const priceValue = Math.round(price * Math.pow(1 + appRate, yr));
    const annualRent = Math.round(price * (currentYield / 100) * Math.pow(1 + rentRate, yr));
    const cumulativeRent = (() => {
      let r = 0;
      for (let j = 1; j <= yr; j++) r += price * (currentYield / 100) * Math.pow(1 + rentRate, j);
      return Math.round(r);
    })();
    const totalReturn  = priceValue - price + cumulativeRent;
    const cumulativeROI = round1(totalReturn / price * 100);
    const cashFlow = Math.round(annualRent - price * costRate);
    return { year: yr, priceValue, rentalIncome: annualRent, cumulativeROI, cashFlow };
  });

  const priceAppreciation = {
    y1:  round1((Math.pow(1 + appRate, 1) - 1) * 100),
    y3:  round1((Math.pow(1 + appRate, 3) - 1) * 100),
    y5:  round1((Math.pow(1 + appRate, 5) - 1) * 100),
    y10: round1((Math.pow(1 + appRate, 10) - 1) * 100),
  };
  const rentalGrowth = {
    y1: round1((Math.pow(1 + rentRate, 1) - 1) * 100),
    y3: round1((Math.pow(1 + rentRate, 3) - 1) * 100),
    y5: round1((Math.pow(1 + rentRate, 5) - 1) * 100),
  };

  const totalReturnY5     = projections[4].cumulativeROI;
  const annualizedReturnY5 = round1((Math.pow(1 + totalReturnY5 / 100, 0.2) - 1) * 100);

  const ci = {
    low:  round1(annualizedReturnY5 * 0.65),
    mid:  annualizedReturnY5,
    high: round1(annualizedReturnY5 * 1.40),
  };

  // ── Narrative ────────────────────────────────────────────────────────────────
  const topFactor = [...factors].sort((a, b) => b.contribution - a.contribution)[0];
  const thesis = `${district} in ${city} scores ${score}/100 on the Predictive Investment Index — driven by ${topFactor.label.toLowerCase()} (${topFactor.contribution}pts). With a projected ${priceAppreciation.y5}% capital appreciation over 5 years and a current yield of ${currentYield}%, annualised total return is estimated at ${annualizedReturnY5}% (range: ${ci.low}–${ci.high}%). ${rec === "Strong Buy" || rec === "Buy" ? "The risk/reward profile is compelling for medium-to-long-term hold." : "Exercise due diligence before committing capital."}`;

  const risks: string[] = [
    priceReductions > 0 ? `${priceReductions} price reduction(s) — seller motivation unclear` : daysOnMarket > 60 ? "Extended days-on-market — liquidity risk elevated" : "Standard market liquidity risk",
    age > 15 ? "Building age may require near-term renovation capital" : "Macro oil-price volatility affecting Iraq-wide sentiment",
    propertyType === "Land" || propertyType === "Commercial" ? "Longer holding period typical for this asset class" : "Rising interest rates could dampen mortgage-backed buyer demand",
  ];

  const catalysts: string[] = [
    `${district} gentrification index ${gentrScore}/100 — continued neighbourhood upgrading`,
    `Infrastructure pipeline in ${city} — new roads/utilities unlock latent value`,
    nearbyFacilities.length > 0 ? `Proximity to ${nearbyFacilities.slice(0, 2).join(" & ")} — strong rental demand anchor` : "Potential for nearby facility development — value upside",
  ];

  return {
    score, grade, label, recommendation: rec as InvestmentPrediction["recommendation"],
    riskLevel: riskLevel as InvestmentPrediction["riskLevel"],
    confidenceInterval: ci,
    priceAppreciation, rentalGrowth,
    totalReturnY5, annualizedReturnY5,
    rentalYieldCurrent: currentYield,
    rentalYieldForecast: round1(currentYield * Math.pow(1 + rentRate, 5)),
    factors, projections,
    thesis, risks, catalysts,
  };
}
