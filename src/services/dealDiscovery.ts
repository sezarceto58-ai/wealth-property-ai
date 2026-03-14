/**
 * Smart Deal Discovery Engine — Module 4
 * ─────────────────────────────────────────
 * Scans listings to surface the best deals using 4 signal categories:
 *   1. Undervalued  — price vs AI valuation gap
 *   2. Distressed   — DOM, price cuts, financial pressure signals
 *   3. Developer Discount — new builds priced below comparable resale
 *   4. Motivated Seller — urgency signals (relocation, financing, vacancy)
 *
 * Output per listing: DealResult — Deal Score 0-100, Expected ROI, Risk Level,
 * deal type classification, signal breakdown, and one-line deal thesis.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────────────────────────────────────

export interface DealInput {
  id: string;
  title: string;
  price: number;
  aiValuation: number;
  area: number;
  city: string;
  district: string;
  propertyType: string;
  bedrooms?: number;
  age?: number;
  verified?: boolean;
  image?: string;

  // Market signals
  daysOnMarket?: number;
  priceReductions?: number;
  originalPrice?: number;          // before any reductions
  isNewDevelopment?: boolean;
  developerDiscount?: number;      // % off developer list price

  // Rental
  rentalYield?: number;
  monthlyRent?: number;

  // Seller signals
  sellerMotivation?: "high" | "medium" | "low";
  hasVacancy?: boolean;
  isRelocation?: boolean;
  isEstate?: boolean;              // estate sale / probate

  // Additional context
  nearbyFacilities?: string[];
  terraScore?: number;
  developerRating?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

export type DealType = "Undervalued" | "Distressed Sale" | "Developer Discount" | "Motivated Seller" | "High-Yield" | "Off-Market Signal";

export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export interface DealSignal {
  type: DealType;
  strength: "Strong" | "Moderate" | "Weak";
  description: string;
  valueAdd: number;   // estimated % value contribution
}

export interface DealResult {
  id: string;
  title: string;
  price: number;
  aiValuation: number;
  image?: string;
  city: string;
  district: string;
  propertyType: string;

  // Core scores
  dealScore: number;          // 0-100
  dealGrade: "A+" | "A" | "B+" | "B" | "C" | "D";
  primaryDealType: DealType;
  signals: DealSignal[];

  // Returns
  expectedROI: number;        // % total return in 3 years
  annualROI: number;          // annualised %
  rentalYield: number;        // current gross yield %
  discountToMarket: number;   // % price is below AI valuation

  // Risk
  riskLevel: RiskLevel;
  riskScore: number;          // 0-100 (lower = safer)
  riskFlags: string[];

  // Narrative
  dealThesis: string;         // one compelling sentence
  timeHorizon: "Short (0–2yr)" | "Medium (2–5yr)" | "Long (5yr+)";
  urgency: "Act Now" | "Monitor" | "Low Priority";
}

// ─────────────────────────────────────────────────────────────────────────────
// Market data
// ─────────────────────────────────────────────────────────────────────────────

const CITY_GROWTH: Record<string, number> = { Erbil: 8.2, Baghdad: 4.8, Sulaymaniyah: 6.5, Basra: 3.4 };
const DISTRICT_MOM: Record<string, number> = {
  Ankawa: 10.2, Gulan: 9.1, Mansour: 7.8, Karrada: 6.9, Jadriya: 7.1,
  Bakhtiari: 8.4, "Salim Street": 7.2, Ashar: 5.8, Corniche: 6.2,
  Shorsh: 7.4, Zayouna: 5.4, Qadisiyah: 6.9,
};

// ─────────────────────────────────────────────────────────────────────────────
// Score engine
// ─────────────────────────────────────────────────────────────────────────────

export function scoreDeal(inp: DealInput): DealResult {
  const {
    id, title, price, aiValuation, area, city, district, propertyType,
    bedrooms = 3, age = 5, verified = false, image,
    daysOnMarket = 25, priceReductions = 0, originalPrice,
    isNewDevelopment = false, developerDiscount = 0,
    rentalYield: knownYield, monthlyRent, sellerMotivation = "medium",
    hasVacancy = false, isRelocation = false, isEstate = false,
    nearbyFacilities = [], terraScore = 65,
  } = inp;

  const signals: DealSignal[] = [];
  let scoreTotal = 0;
  let riskScore  = 40; // baseline medium risk

  const discountPct     = ((aiValuation - price) / aiValuation) * 100;
  const priceCutPct     = originalPrice && originalPrice > price ? ((originalPrice - price) / originalPrice) * 100 : 0;
  const cityGr          = CITY_GROWTH[city] ?? 5;
  const districtMom     = DISTRICT_MOM[district] ?? cityGr;

  // Implied rental yield
  const cityRentPsm: Record<string, number> = { Erbil: 12, Baghdad: 10, Sulaymaniyah: 11, Basra: 8 };
  const impliedMonthly  = monthlyRent ?? (area * (cityRentPsm[city] ?? 9));
  const currentYield    = knownYield ?? Math.round((impliedMonthly * 12) / price * 100 * 10) / 10;

  // ── Signal 1: Undervaluation ───────────────────────────────────────────────
  if (discountPct >= 15) {
    scoreTotal += 35;
    signals.push({ type: "Undervalued", strength: "Strong", description: `${discountPct.toFixed(1)}% below AI valuation — significant mispricing`, valueAdd: 35 });
  } else if (discountPct >= 8) {
    scoreTotal += 22;
    signals.push({ type: "Undervalued", strength: "Moderate", description: `${discountPct.toFixed(1)}% below AI valuation — meaningful discount`, valueAdd: 22 });
  } else if (discountPct >= 3) {
    scoreTotal += 10;
    signals.push({ type: "Undervalued", strength: "Weak", description: `${discountPct.toFixed(1)}% below AI valuation — slight discount`, valueAdd: 10 });
  } else if (discountPct < -8) {
    scoreTotal -= 12;
    riskScore  += 12;
  }

  // ── Signal 2: Distressed sale ──────────────────────────────────────────────
  if (daysOnMarket >= 90 || priceReductions >= 2) {
    const domAdj = daysOnMarket >= 90 ? 18 : 10;
    scoreTotal += domAdj;
    riskScore  += 8; // distressed = some risk
    signals.push({
      type: "Distressed Sale", strength: daysOnMarket >= 120 ? "Strong" : "Moderate",
      description: `${daysOnMarket}+ days on market${priceReductions > 0 ? `, ${priceReductions} price cut(s)` : ""}`,
      valueAdd: domAdj,
    });
  } else if (daysOnMarket >= 60) {
    scoreTotal += 8;
    signals.push({ type: "Distressed Sale", strength: "Weak", description: `${daysOnMarket} days on market — seller patience thinning`, valueAdd: 8 });
  }

  if (priceCutPct >= 10) {
    scoreTotal += 15;
    riskScore  += 5;
    signals.push({ type: "Distressed Sale", strength: "Strong", description: `Price cut ${priceCutPct.toFixed(0)}% from $${originalPrice?.toLocaleString()} — motivated seller`, valueAdd: 15 });
  } else if (priceCutPct >= 5) {
    scoreTotal += 8;
    signals.push({ type: "Distressed Sale", strength: "Moderate", description: `Price reduced ${priceCutPct.toFixed(0)}% — flexibility indicated`, valueAdd: 8 });
  }

  if (isEstate) {
    scoreTotal += 12; riskScore += 3;
    signals.push({ type: "Distressed Sale", strength: "Strong", description: "Estate/probate sale — executor typically prioritises speed over price", valueAdd: 12 });
  }

  // ── Signal 3: Developer discount ───────────────────────────────────────────
  if (developerDiscount >= 10) {
    scoreTotal += 20;
    signals.push({ type: "Developer Discount", strength: "Strong", description: `${developerDiscount}% off developer list price — launch discount`, valueAdd: 20 });
  } else if (developerDiscount >= 5) {
    scoreTotal += 12;
    signals.push({ type: "Developer Discount", strength: "Moderate", description: `${developerDiscount}% developer discount — bulk/early-buyer pricing`, valueAdd: 12 });
  }
  if (isNewDevelopment && discountPct >= 5) {
    scoreTotal += 8;
    signals.push({ type: "Developer Discount", strength: "Moderate", description: "New development priced below comparable resale — market entry opportunity", valueAdd: 8 });
  }

  // ── Signal 4: Motivated seller ──────────────────────────────────────────────
  if (sellerMotivation === "high") {
    scoreTotal += 14; riskScore += 2;
    signals.push({ type: "Motivated Seller", strength: "Strong", description: "High seller motivation (relocation / financial / vacancy) — negotiation leverage", valueAdd: 14 });
  } else if (sellerMotivation === "medium" && (hasVacancy || isRelocation)) {
    scoreTotal += 8;
    signals.push({ type: "Motivated Seller", strength: "Moderate", description: hasVacancy ? "Vacant property — holding costs pressuring seller" : "Seller relocating — timeline creating flexibility", valueAdd: 8 });
  }

  // ── Signal 5: High yield ────────────────────────────────────────────────────
  if (currentYield >= 10) {
    scoreTotal += 16;
    signals.push({ type: "High-Yield", strength: "Strong", description: `${currentYield}% gross yield — exceptional income return`, valueAdd: 16 });
  } else if (currentYield >= 8) {
    scoreTotal += 10;
    signals.push({ type: "High-Yield", strength: "Moderate", description: `${currentYield}% gross yield — strong income asset`, valueAdd: 10 });
  }

  // ── Signal 6: Terra/verification boosts ────────────────────────────────────
  if (verified && terraScore >= 80) {
    scoreTotal += 8;
    signals.push({ type: "Off-Market Signal", strength: "Moderate", description: `TerraScore™ ${terraScore} — top-tier platform rating, limited comparable supply`, valueAdd: 8 });
  }

  // ── Baseline location quality ────────────────────────────────────────────────
  scoreTotal += Math.round(districtMom * 2); // 0-20 from location momentum

  // ── Final deal score ──────────────────────────────────────────────────────
  const dealScore = Math.min(100, Math.max(0, Math.round(scoreTotal)));
  const dealGrade: DealResult["dealGrade"] =
    dealScore >= 88 ? "A+" : dealScore >= 78 ? "A" : dealScore >= 65 ? "B+" : dealScore >= 52 ? "B" : dealScore >= 38 ? "C" : "D";

  // Primary deal type = strongest signal
  const primarySignal = signals.length > 0 ? [...signals].sort((a, b) => b.valueAdd - a.valueAdd)[0] : null;
  const primaryDealType: DealType = primarySignal?.type ?? "Undervalued";

  // ── Return estimates ─────────────────────────────────────────────────────────
  const capitalGain3yr = (Math.pow(1 + districtMom / 100, 3) - 1) * 100;
  const rentCollected3yr = currentYield * 3 * (1 + districtMom * 0.4 / 100); // simplified
  const totalROI3yr = Math.round(capitalGain3yr + rentCollected3yr);
  const annualROI   = Math.round((Math.pow(1 + totalROI3yr / 100, 1 / 3) - 1) * 100 * 10) / 10;

  // ── Risk classification ───────────────────────────────────────────────────────
  const riskFlags: string[] = [];
  if (discountPct < -5)      riskFlags.push("Priced above AI valuation");
  if (daysOnMarket > 90)     riskFlags.push("Slow-moving listing — liquidity risk");
  if (age > 20)              riskFlags.push("Older building — renovation may be required");
  if (!verified)             riskFlags.push("Unverified listing — due diligence needed");
  if (propertyType === "Land") riskFlags.push("Land — longest holding/development timeline");

  const riskLevel: RiskLevel =
    riskScore <= 40 ? "Low" :
    riskScore <= 55 ? "Medium" :
    riskScore <= 70 ? "High" : "Very High";

  // ── Narrative ─────────────────────────────────────────────────────────────────
  const discStr   = discountPct > 0 ? `${discountPct.toFixed(0)}% below AI value` : "at market value";
  const retStr    = `${annualROI}% annualised (${totalROI3yr}% over 3yr)`;
  const dealThesis = `${title} — ${discStr} in ${district}, ${city}. ${primaryDealType} opportunity with ${retStr} expected return and ${riskLevel.toLowerCase()} risk.`;

  const timeHorizon: DealResult["timeHorizon"] =
    primaryDealType === "High-Yield" ? "Short (0–2yr)" :
    primaryDealType === "Developer Discount" ? "Medium (2–5yr)" : "Medium (2–5yr)";

  const urgency: DealResult["urgency"] =
    dealScore >= 80 && (daysOnMarket < 30 || sellerMotivation === "high") ? "Act Now" :
    dealScore >= 60 ? "Monitor" : "Low Priority";

  return {
    id, title, price, aiValuation, image, city, district, propertyType,
    dealScore, dealGrade, primaryDealType, signals,
    expectedROI: totalROI3yr, annualROI, rentalYield: currentYield,
    discountToMarket: Math.round(discountPct * 10) / 10,
    riskLevel, riskScore, riskFlags,
    dealThesis, timeHorizon, urgency,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch scanner — accepts any array of deal inputs
// ─────────────────────────────────────────────────────────────────────────────

export function scanDeals(listings: DealInput[]): DealResult[] {
  return listings
    .map(scoreDeal)
    .sort((a, b) => b.dealScore - a.dealScore);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock listings catalogue — rich diverse dataset for the discovery UI
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_DEAL_LISTINGS: DealInput[] = [
  {
    id: "d1", title: "Ankawa Villa — Owner Relocating", price: 285000, aiValuation: 342000,
    area: 380, city: "Erbil", district: "Ankawa", propertyType: "Villa", bedrooms: 5,
    age: 4, verified: true, image: "property-1", daysOnMarket: 12, priceReductions: 0,
    isNewDevelopment: false, rentalYield: 8.1, sellerMotivation: "high", isRelocation: true,
    nearbyFacilities: ["school", "mall", "park"], terraScore: 91,
  },
  {
    id: "d2", title: "Mansour Apartment — Long Listed", price: 165000, aiValuation: 178000,
    area: 155, city: "Baghdad", district: "Mansour", propertyType: "Apartment", bedrooms: 3,
    age: 8, verified: true, image: "property-2", daysOnMarket: 97, priceReductions: 2,
    originalPrice: 190000, rentalYield: 7.4, sellerMotivation: "high", hasVacancy: true,
    nearbyFacilities: ["school", "hospital"], terraScore: 74,
  },
  {
    id: "d3", title: "Bakhtiari New Development — Launch Price", price: 220000, aiValuation: 238000,
    area: 210, city: "Sulaymaniyah", district: "Bakhtiari", propertyType: "Apartment", bedrooms: 3,
    age: 0, verified: true, image: "property-3", daysOnMarket: 8, priceReductions: 0,
    isNewDevelopment: true, developerDiscount: 12, developerRating: 4.5, rentalYield: 8.8,
    nearbyFacilities: ["university", "mall"], terraScore: 88,
  },
  {
    id: "d4", title: "Corniche Commercial — Estate Sale", price: 390000, aiValuation: 455000,
    area: 290, city: "Basra", district: "Corniche", propertyType: "Commercial",
    age: 6, verified: false, image: "property-4", daysOnMarket: 134, priceReductions: 3,
    originalPrice: 510000, sellerMotivation: "high", isEstate: true, rentalYield: 10.2,
    nearbyFacilities: ["hospital", "metro"], terraScore: 66,
  },
  {
    id: "d5", title: "Salim Street Penthouse — Motivated Seller", price: 265000, aiValuation: 292000,
    area: 260, city: "Sulaymaniyah", district: "Salim Street", propertyType: "Penthouse", bedrooms: 4,
    age: 3, verified: true, image: "property-1", daysOnMarket: 31, priceReductions: 1,
    originalPrice: 280000, developerRating: 4.2, rentalYield: 7.9, sellerMotivation: "medium",
    nearbyFacilities: ["mall", "park", "school"], terraScore: 85,
  },
  {
    id: "d6", title: "Gulan Townhouse — Below Replacement Cost", price: 195000, aiValuation: 228000,
    area: 240, city: "Erbil", district: "Gulan", propertyType: "Townhouse", bedrooms: 4,
    age: 9, verified: true, image: "property-2", daysOnMarket: 55, priceReductions: 1,
    originalPrice: 210000, rentalYield: 9.3, sellerMotivation: "medium",
    nearbyFacilities: ["school", "park"], terraScore: 79,
  },
  {
    id: "d7", title: "Jadriya Apartment — Cash Only", price: 148000, aiValuation: 162000,
    area: 130, city: "Baghdad", district: "Jadriya", propertyType: "Apartment", bedrooms: 2,
    age: 12, verified: false, image: "property-3", daysOnMarket: 76, priceReductions: 1,
    originalPrice: 165000, rentalYield: 8.5, sellerMotivation: "medium",
    nearbyFacilities: ["university", "park"], terraScore: 68,
  },
  {
    id: "d8", title: "Ashar Office Space — Developer Clearance", price: 175000, aiValuation: 196000,
    area: 145, city: "Basra", district: "Ashar", propertyType: "Office",
    age: 2, verified: true, image: "property-4", daysOnMarket: 19, priceReductions: 0,
    isNewDevelopment: true, developerDiscount: 11, developerRating: 3.8, rentalYield: 9.8,
    nearbyFacilities: ["metro", "hospital"], terraScore: 73,
  },
  {
    id: "d9", title: "Ainkawa Villa — Priced to Sell", price: 310000, aiValuation: 368000,
    area: 420, city: "Erbil", district: "Ainkawa", propertyType: "Villa", bedrooms: 5,
    age: 7, verified: true, image: "property-1", daysOnMarket: 44, priceReductions: 1,
    originalPrice: 350000, rentalYield: 7.8, sellerMotivation: "high",
    nearbyFacilities: ["school", "mall", "park"], terraScore: 89, isRelocation: true,
  },
  {
    id: "d10", title: "Karrada Apartment — High-Yield Cash Cow", price: 125000, aiValuation: 132000,
    area: 120, city: "Baghdad", district: "Karrada", propertyType: "Apartment", bedrooms: 2,
    age: 6, verified: true, image: "property-2", daysOnMarket: 22, priceReductions: 0,
    monthlyRent: 1200, sellerMotivation: "low",
    nearbyFacilities: ["hospital", "mall", "park"], terraScore: 76,
  },
  {
    id: "d11", title: "Qadisiyah Mixed-Use — Below Market Entry", price: 240000, aiValuation: 275000,
    area: 200, city: "Sulaymaniyah", district: "Qadisiyah", propertyType: "Commercial",
    age: 5, verified: false, image: "property-3", daysOnMarket: 88, priceReductions: 2,
    originalPrice: 268000, rentalYield: 10.5, sellerMotivation: "high",
    nearbyFacilities: ["university", "metro"], terraScore: 70,
  },
  {
    id: "d12", title: "Shorsh Villa — Early Off-Plan Exit", price: 198000, aiValuation: 221000,
    area: 270, city: "Erbil", district: "Shorsh", propertyType: "Villa", bedrooms: 4,
    age: 1, verified: true, image: "property-4", daysOnMarket: 17, priceReductions: 0,
    isNewDevelopment: true, developerDiscount: 8, developerRating: 4.0, rentalYield: 8.6,
    nearbyFacilities: ["school", "park"], terraScore: 82,
  },
];

export const ALL_DEALS = scanDeals(MOCK_DEAL_LISTINGS);
