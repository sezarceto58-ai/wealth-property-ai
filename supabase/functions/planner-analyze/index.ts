import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";
import { consumeUsage } from "../_shared/usage.ts";

// ── Language config ────────────────────────────────────────────────────────────

type Lang = "en" | "ar" | "ku";

const LANG_INSTRUCTIONS: Record<Lang, string> = {
  en: "Respond entirely in English.",
  ar: "أجب بالكامل باللغة العربية الفصحى المعاصرة. يجب أن تكون جميع النصوص والتحليلات والتوضيحات باللغة العربية الواضحة المناسبة لتطبيقات الأعمال.",
  ku: "بۆ کوردی سۆرانی وەڵام بدەرەوە. هەموو دەقەکان، شیکارییەکان و ڕوونکردنەوەکان دەبێت بە کوردیی سۆرانیی ستانداردی کاروباری نووسرابن.",
};

function getLangInstruction(lang: string): string {
  return LANG_INSTRUCTIONS[(lang as Lang)] ?? LANG_INSTRUCTIONS.en;
}

function extractJson(raw: string): any {
  // Strip markdown fences
  let cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find outermost JSON object boundaries
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in response");
  }
  cleaned = cleaned.substring(start, end + 1);

  // First attempt: direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Fix common LLM issues
    cleaned = cleaned
      .replace(/,\s*}/g, "}")           // trailing commas before }
      .replace(/,\s*]/g, "]")           // trailing commas before ]
      .replace(/[\x00-\x1F\x7F]/g, (c) => c === "\n" || c === "\r" || c === "\t" ? c : "") // control chars
      .replace(/\n/g, " ")              // flatten newlines inside strings
      .replace(/\t/g, " ");

    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      // Last resort: try to fix unescaped quotes in string values
      // by replacing single quotes used as string delimiters
      cleaned = cleaned.replace(/'/g, '"');
      return JSON.parse(cleaned);
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { token } = await requireUser(req);

    // Planner is heavier than normal AI calls: charge 5 credits
    await consumeUsage(token, "planner_analyze", 5);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const {
      lat, lng, area_sqm, land_price, shape, max_floors, restrictions,
      street_type, sun_blockage, nearby_facilities, neighborhood_prices, neighborhood_projects,
      language = "en",
    } = await req.json();
    const langInstruction = getLangInstruction(language);

    if (!lat || !lng || !area_sqm) throw new Error("lat, lng, and area_sqm are required");

    const { data: plan, error: insertError } = await supabase
      .from("project_plans")
      .insert({
        user_id: user.id,
        land_location: { lat, lng },
        land_area: area_sqm,
        shape: shape || "rectangle",
        max_floors: max_floors || 10,
        restrictions: restrictions || [],
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build rich context section
    const facilitiesText = (nearby_facilities && nearby_facilities.length > 0)
      ? nearby_facilities.map((f: any) => `- ${f.type}: ${f.distance_km} km away`).join("\n")
      : "No nearby facilities specified";

    const langSuffix = `\n\nLANGUAGE INSTRUCTION (MANDATORY): ${langInstruction} All string values in the JSON response (summaries, descriptions, factor names, notes, insights, labels, recommendations text, rationales, strategies) MUST be written in the specified language. Only numeric values, JSON keys, and fixed enum tokens (like "low", "high", "medium") stay in English.`;

    const prompt = `You are a world-class real estate feasibility consultant. Given the land data below, produce a COMPREHENSIVE feasibility report. Return ONLY valid JSON matching this exact schema (no markdown, no explanation):${langSuffix}`;

{
  "land_use": {
    "recommendation": "string - primary recommended use",
    "confidence": 0.0-1.0,
    "rationale": "string - detailed 3-4 paragraph explanation",
    "strengths": ["string - 4-6 location strengths"],
    "weaknesses": ["string - 3-5 location weaknesses"],
    "neighborhood": {
      "existing_activities": ["string - key activities/businesses nearby"],
      "upcoming_projects": ["string - known/likely future developments"],
      "infrastructure": ["string - roads, utilities, transit access"]
    },
    "zoning": {
      "validation": "string - zoning assessment",
      "allowed_uses": ["string"],
      "restrictions_analysis": "string - analysis of given restrictions",
      "recommendations": "string - how to work within zoning"
    },
    "development_recommendations": ["string - 4-6 strategic recommendations"],
    "pricing_suggestions": "string - 2-3 paragraph pricing strategy",
    "unit_mix_optimization": "string - detailed unit mix rationale"
  },
  "design": {
    "buildings_count": number,
    "building_shape": "string - L-shape, U-shape, tower, etc.",
    "floors": number,
    "units_per_floor": number,
    "total_units": number,
    "commercial_area_sqm": number,
    "green_area_sqm": number,
    "facilities": ["string - gym, pool, parking levels, etc."],
    "unit_types": [
      {
        "name": "string - e.g. Studio, 1BR, 2BR, 3BR, Penthouse",
        "area_sqm": number,
        "count": number,
        "bedrooms": number,
        "bathrooms": number,
        "balcony": "string - yes/no and size",
        "kitchen": "string - open or separate",
        "ceiling_height_m": number,
        "rooms": ["string - living, dining, master bedroom, etc."]
      }
    ],
    "parking_spaces": number,
    "basement_levels": number,
    "design_rationale": "string - why this design suits the area/city/country"
  },
  "pricing": {
    "currency": "string - USD or local",
    "price_per_sqm": number,
    "price_per_sqft": number,
    "by_unit_type": [
      {
        "type": "string",
        "area_sqm": number,
        "area_sqft": number,
        "price_per_unit": number,
        "price_per_sqm": number,
        "price_per_sqft": number
      }
    ],
    "by_floor": [{ "floor": number, "premium_pct": number, "price_per_sqm": number }],
    "payment_plans": [
      {
        "name": "string",
        "down_payment_pct": number,
        "installments": number,
        "duration_months": number,
        "monthly_payment_example": number,
        "description": "string"
      }
    ]
  },
  "marketing": {
    "channels": ["string"],
    "timeline_months": number,
    "target_audience": "string",
    "positioning": "string - market positioning statement",
    "offers": [
      {
        "name": "string",
        "description": "string",
        "discount_pct": number,
        "conditions": "string",
        "feasibility": "string - why this offer works financially",
        "expected_uptake_pct": number
      }
    ],
    "launch_strategy": "string - phased launch plan",
    "digital_strategy": "string",
    "branding_suggestions": "string"
  },
  "feasibility": {
    "total_construction_cost": number,
    "land_cost_estimate": number,
    "soft_costs": number,
    "total_investment": number,
    "projected_revenue": number,
    "net_profit": number,
    "roi_pct": number,
    "irr_pct": number,
    "cap_rate_pct": number,
    "payback_years": number,
    "breakeven_units": number,
    "breakeven_months": number,
    "cash_on_cash_return_pct": number,
    "timeline": [
      { "phase": "string", "start_month": number, "end_month": number, "cost": number, "description": "string" }
    ],
    "swot": {
      "strengths": ["string"],
      "weaknesses": ["string"],
      "opportunities": ["string"],
      "threats": ["string"]
    },
    "risk_assessment": [
      { "risk": "string", "probability": "low|medium|high", "impact": "low|medium|high", "mitigation": "string" }
    ],
    "market_positioning": "string - 2 paragraph market position analysis",
    "exit_strategies": [
      { "strategy": "string", "timeline_years": number, "expected_return_pct": number, "description": "string" }
    ],
    "forecasting": {
      "roi_5yr": number,
      "roi_10yr": number,
      "asset_growth_10yr_pct": number,
      "rental_income_monthly": number,
      "rental_yield_pct": number,
      "resale_value_5yr": number,
      "resale_value_10yr": number,
      "scenarios": [
        {
          "name": "string - e.g. Interest Rate +2%, Price Drop 15%, Cost Overrun 20%",
          "impact_on_roi_pct": number,
          "impact_on_irr_pct": number,
          "net_profit_change": number,
          "description": "string"
        }
      ]
    }
  }
}

LAND DATA:
- Location: lat ${lat}, lng ${lng}
- Area: ${area_sqm} m²
- Shape: ${shape || "rectangle"}
- Max floors allowed: ${max_floors || 10}
- Restrictions: ${JSON.stringify(restrictions || [])}
- Land purchase price: ${land_price ? `$${land_price.toLocaleString()}` : "Not specified — estimate based on location"}
- Street type: ${street_type || "secondary"} (main road has higher commercial value, alley has less visibility)
- Sun blockage from nearby buildings: ${sun_blockage || "none"}

NEARBY FACILITIES:
${facilitiesText}

NEIGHBORHOOD MARKET PRICES (user-provided):
${neighborhood_prices || "Not specified — use your knowledge of the area's market rates"}

NEARBY PROJECTS & LAND USES (user-provided):
${neighborhood_projects || "Not specified — infer from location"}

CRITICAL PRICING RULES:
- If user provided a land price, use it as "land_cost_estimate" in feasibility — do NOT invent a different number
- Pricing must be DIRECTLY informed by the neighborhood prices the user provided
- If neighboring apartments sell at $X/m², your project price should be in a logical range relative to that (premium or discount justified by quality/features)
- Nearby facilities (hospitals, schools, malls) INCREASE land value — factor this into pricing
- Main road frontage commands 15-40% premium over secondary streets
- Sun blockage DECREASES desirability for residential upper floors — adjust pricing tiers accordingly
- All financial numbers must be realistic for the location's country and city
- Design must be culturally appropriate for the region
- Unit sizes, ceiling heights, and layouts must follow local market standards
- Include both USD and local currency where possible
- Payment plans must be realistic for the market
- SWOT must be specific to this exact location, not generic
- Scenario testing must show realistic impacts
- Return ONLY the JSON object
- All text content MUST be in the specified language (${language})";

    const systemMsg = `You are a senior real estate feasibility consultant with 20+ years experience in Middle East and global markets. You produce realistic, data-driven analysis. Return only valid JSON.${langSuffix}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      await supabase.from("project_plans").update({ status: "error" }).eq("id", plan.id);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted, please add funds" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let result;
    try {
      result = extractJson(content);
    } catch (parseErr) {
      console.error("Failed to parse AI output. Raw content length:", content.length);
      console.error("First 500 chars:", content.substring(0, 500));
      console.error("Last 500 chars:", content.substring(content.length - 500));
      await supabase.from("project_plans").update({ status: "error" }).eq("id", plan.id);
      throw new Error("AI returned invalid output");
    }

    await supabase.from("project_plans").update({ status: "complete", result }).eq("id", plan.id);

    return new Response(JSON.stringify({ plan_id: plan.id, status: "complete" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("planner-analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
