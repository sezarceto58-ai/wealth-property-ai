/**
 * Maps a DbProperty (from Supabase) to ValuationInput.
 * Extracted as a shared utility so both AIValuation page
 * and PropertyDetail can use the same mapping logic.
 */
import type { DbProperty } from "@/types/database";
import type { ValuationInput } from "./valuationEngine";

const TYPE_MAP: Record<string, string> = {
  apartment: "Apartment", villa: "Villa", townhouse: "Townhouse",
  penthouse: "Penthouse", commercial: "Commercial", office: "Office",
  land: "Land", warehouse: "Warehouse",
};

export function propertyToValuationInput(p: DbProperty): ValuationInput {
  const mappedType =
    TYPE_MAP[p.property_type?.toLowerCase()] ??
    TYPE_MAP[p.type?.toLowerCase()] ??
    "Apartment";

  const feats = (p.features ?? []).map(f => f.toLowerCase());
  const has = (k: string) => feats.some(f => f.includes(k));
  const isVilla = ["Villa", "Townhouse"].includes(mappedType);
  const isApt   = ["Apartment", "Penthouse"].includes(mappedType);

  return {
    price:        p.price,
    area:         p.area ?? 150,
    bedrooms:     p.bedrooms ?? 3,
    bathrooms:    p.bathrooms ?? 2,
    city:         p.city ?? "Erbil",
    district:     p.district ?? "Ankawa",
    propertyType: mappedType,
    age:          5,
    verified:     p.verified ?? false,
    features:     p.features ?? [],
    lat:          p.latitude  ?? 36.191,
    lng:          p.longitude ?? 44.009,
    locationType:     "residential",
    streetWidth:      "medium",
    nearbyFacilities: [],
    floors:           isVilla ? 2 : undefined,
    hasGarden:        isVilla ? has("garden") : false,
    gardenArea:       0,
    hasRooftop:       has("rooftop") || has("terrace"),
    hasBasement:      has("basement"),
    floorLevel:       isApt ? undefined : undefined,
    buildingFloors:   isApt ? undefined : undefined,
    hasElevator:      has("elevator"),
    balconies:        has("balcon") ? 1 : 0,
    balconyArea:      has("balcon") ? 15 : 0,
    view:             [],
    condition:        "good",
    interiorCladding: has("marble") ? "marble" : has("parquet") ? "parquet" : "ceramic",
    exteriorCladding: "painted",
    naturalLight:     "good",
    sunExposure:      "morning",
    noiseLevel:       "quiet",
    hasGenerator:     has("generator"),
    hasSolarPanels:   has("solar"),
    hasWaterTank:     true,
    hasCentralAC:     has("central ac") || has("central air"),
    hasHeating:       has("heating"),
    hasSecuritySystem:has("security") || has("cctv"),
    parkingSpaces:    has("parking") || has("garage") ? 1 : 0,
    hasPool:          has("pool") || has("swimming"),
    hasGym:           has("gym") || has("fitness"),
    hasSmartHome:     has("smart"),
    hasConcierge:     has("concierge"),
  };
}
