/**
 * Platform Data Moat Strategy
 * Tracks and accumulates strategic data assets across the platform.
 *
 * Data assets:
 *   - Transaction prices (price discovery over time)
 *   - Investor behavior (search, offer, hold patterns)
 *   - Rental demand (yield compression / expansion signals)
 *   - Developer pricing patterns (launch vs settled pricing)
 *
 * These events are logged locally (and can be forwarded to Supabase/analytics)
 * to build the region's largest real estate intelligence dataset over time.
 */

// ── Event Types ──
export type DataMoatEventType =
  | "property_view"
  | "property_search"
  | "offer_submitted"
  | "offer_accepted"
  | "investment_intent"       // user signals intent to invest in syndication
  | "syndication_view"
  | "valuation_requested"
  | "market_intel_view"
  | "neighborhood_viewed"
  | "price_comparison"
  | "yield_filter_applied"
  | "developer_profile_view";

export interface DataMoatEvent {
  type: DataMoatEventType;
  timestamp: number;
  payload: Record<string, unknown>;
  sessionId: string;
}

// ── Simple session ID ──
let _sessionId: string | null = null;
function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
  return _sessionId;
}

// ── In-memory event buffer (flush to Supabase in production) ──
const eventBuffer: DataMoatEvent[] = [];

/**
 * Track a platform data moat event.
 * In production, this would batch-upload to Supabase `data_moat_events` table.
 */
export function trackEvent(type: DataMoatEventType, payload: Record<string, unknown> = {}): void {
  const event: DataMoatEvent = {
    type,
    timestamp: Date.now(),
    payload,
    sessionId: getSessionId(),
  };
  eventBuffer.push(event);

  // Development logging
  if (process.env.NODE_ENV === "development") {
    console.debug("[DataMoat]", type, payload);
  }

  // TODO: In production — batch flush to:
  // supabase.from("data_moat_events").insert(event)
  // or send to analytics pipeline every N events
  if (eventBuffer.length >= 20) {
    flushEvents();
  }
}

/**
 * Flush buffered events (no-op until Supabase integration).
 */
function flushEvents(): void {
  // Placeholder — replace with actual Supabase insert or analytics API call.
  eventBuffer.length = 0;
}

// ── Convenience wrappers ──

export function trackPropertyView(propertyId: string, city: string, price: number): void {
  trackEvent("property_view", { propertyId, city, price });
}

export function trackSearch(query: string, filters: Record<string, unknown>): void {
  trackEvent("property_search", { query, filters });
}

export function trackOffer(propertyId: string, offerPrice: number, askingPrice: number, city: string): void {
  trackEvent("offer_submitted", {
    propertyId,
    offerPrice,
    askingPrice,
    discountPct: Math.round(((askingPrice - offerPrice) / askingPrice) * 100),
    city,
  });
}

export function trackValuationRequest(propertyId: string, city: string, district: string, estimatedValue: number): void {
  trackEvent("valuation_requested", { propertyId, city, district, estimatedValue });
}

export function trackSyndicationView(dealId: string, dealTitle: string, targetRaise: number): void {
  trackEvent("syndication_view", { dealId, dealTitle, targetRaise });
}

export function trackInvestmentIntent(dealId: string, amount: number, city: string): void {
  trackEvent("investment_intent", { dealId, amount, city });
}

export function trackMarketIntelView(city: string, tab: string): void {
  trackEvent("market_intel_view", { city, tab });
}

export function trackNeighborhoodView(city: string, neighborhood: string): void {
  trackEvent("neighborhood_viewed", { city, neighborhood });
}

// ── Data Asset Aggregator (analytics summaries for admin) ──

export interface DataAssetSummary {
  totalEvents: number;
  topSearchedCities: { city: string; count: number }[];
  avgOfferDiscountPct: number;
  topViewedNeighborhoods: { name: string; count: number }[];
  syndicationInterestTotal: number;
  valuationRequestCount: number;
}

/**
 * Compute a summary of accumulated data moat signals.
 * In production, this would be a Supabase RPC or materialized view query.
 */
export function getDataAssetSummary(): DataAssetSummary {
  const cities: Record<string, number> = {};
  const neighborhoods: Record<string, number> = {};
  const offerDiscounts: number[] = [];
  let syndicationInterest = 0;
  let valuationCount = 0;

  for (const ev of eventBuffer) {
    if (ev.type === "property_view" || ev.type === "property_search") {
      const city = (ev.payload.city as string) ?? "Unknown";
      cities[city] = (cities[city] ?? 0) + 1;
    }
    if (ev.type === "offer_submitted") {
      const disc = ev.payload.discountPct as number;
      if (typeof disc === "number") offerDiscounts.push(disc);
    }
    if (ev.type === "neighborhood_viewed") {
      const name = (ev.payload.neighborhood as string) ?? "Unknown";
      neighborhoods[name] = (neighborhoods[name] ?? 0) + 1;
    }
    if (ev.type === "investment_intent") {
      syndicationInterest += (ev.payload.amount as number) ?? 0;
    }
    if (ev.type === "valuation_requested") {
      valuationCount++;
    }
  }

  return {
    totalEvents: eventBuffer.length,
    topSearchedCities: Object.entries(cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count })),
    avgOfferDiscountPct: offerDiscounts.length
      ? Math.round(offerDiscounts.reduce((s, v) => s + v, 0) / offerDiscounts.length)
      : 0,
    topViewedNeighborhoods: Object.entries(neighborhoods)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    syndicationInterestTotal: syndicationInterest,
    valuationRequestCount: valuationCount,
  };
}
