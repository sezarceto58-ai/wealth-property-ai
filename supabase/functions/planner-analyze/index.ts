import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { lat, lng, area_sqm, shape, max_floors, restrictions } = await req.json();
    if (!lat || !lng || !area_sqm) throw new Error("lat, lng, and area_sqm are required");

    // Insert plan as processing
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

    // Run AI analysis asynchronously (but in this edge function for simplicity)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a real estate feasibility expert. Given the land data below, return ONLY valid JSON matching this exact schema:
{
  "land_use": { "recommendation": "string", "confidence": 0.0-1.0, "rationale": "string" },
  "design": { "floors": number, "units_per_floor": number, "unit_mix": {"80m2": count, "120m2": count}, "amenities": ["string"] },
  "pricing": { "by_floor": [{ "floor": number, "price_per_unit": number }] },
  "marketing": { "channels": ["string"], "timeline_months": number, "target_audience": "string", "offers": "string" },
  "financials": { "total_cost": number, "projected_revenue": number, "roi_pct": number, "payback_years": number, "breakeven_units": number, "risk_range": [number, number] }
}

LAND DATA:
- Location: lat ${lat}, lng ${lng}
- Area: ${area_sqm} m²
- Shape: ${shape || "rectangle"}
- Max floors allowed: ${max_floors || 10}
- Restrictions: ${JSON.stringify(restrictions || [])}

Rules:
- land_use.confidence must be 0–1
- design.unit_mix keys are strings like "80m2"
- pricing.by_floor must have an entry for every floor in design.floors
- All numbers must be realistic for the given location
- financials must be deterministic and realistic
- Return ONLY the JSON object, no markdown, no explanation`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a real estate feasibility AI. Return only valid JSON." },
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
    
    // Parse JSON from response (strip markdown fences if present)
    let result;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI output:", content);
      await supabase.from("project_plans").update({ status: "error" }).eq("id", plan.id);
      throw new Error("AI returned invalid output");
    }

    // Post-process financials deterministically
    const floors = result.design?.floors || max_floors || 10;
    const unitsPerFloor = result.design?.units_per_floor || 4;
    const totalUnits = floors * unitsPerFloor;
    const avgPrice = result.pricing?.by_floor?.length
      ? result.pricing.by_floor.reduce((s: number, f: any) => s + (f.price_per_unit || 0), 0) / result.pricing.by_floor.length
      : 500000;
    const projRevenue = totalUnits * avgPrice;
    const constructCost = area_sqm * 3500 * floors; // rough cost/m² per floor
    const roi = constructCost > 0 ? ((projRevenue - constructCost) / constructCost) * 100 : 0;

    result.financials = {
      ...result.financials,
      total_cost: Math.round(constructCost),
      projected_revenue: Math.round(projRevenue),
      roi_pct: Math.round(roi * 100) / 100,
      payback_years: roi > 0 ? Math.round((constructCost / (projRevenue - constructCost)) * 10) / 10 : 0,
      breakeven_units: Math.ceil(constructCost / avgPrice),
      risk_range: result.financials?.risk_range || [roi * 0.7, roi * 1.3].map((v: number) => Math.round(v * 100) / 100),
    };

    // Save result
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
