import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";
import { consumeUsage } from "../_shared/usage.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require auth + enforce monthly AI credits server-side
    const { token } = await requireUser(req);
    await consumeUsage(token, "ai_property_analysis", 1);

    const { type, property, criteria, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      en: "English",
      ar: "Arabic (اللغة العربية)",
      ku: "Kurdish Sorani (کوردی سۆرانی)",
    };
    const lang = langMap[language as string] ?? "English";
    const langInstruction = `IMPORTANT: All textual values in the JSON response (summary, descriptions, SWOT items, factor names/impact, notes, reasoning, tips, market commentary, demographic descriptors, recommendation rationale, etc.) MUST be written in ${lang}. Keep JSON keys in English. Keep numeric values as numbers. Keep enum values like "BUY|HOLD|SELL|AVOID", "low|medium|high", "above|at|below market" in English.`;

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "full_analysis":
        systemPrompt = `You are TerraVista AI, an expert real estate investment analyst for the Iraqi market (Baghdad, Erbil, Basra, Sulaymaniyah). Provide comprehensive property analysis in JSON format. Be specific with numbers and realistic for the Iraqi market. Return ONLY valid JSON.`;
        userPrompt = `Analyze this property and return a JSON object with these exact keys:
Property: ${JSON.stringify(property)}

Return JSON with:
{
  "swot": { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] },
  "investmentScore": { "overall": 0-100, "location": 0-100, "value": 0-100, "growth": 0-100, "risk": 0-100, "liquidity": 0-100 },
  "financials": {
    "estimatedROI": "X%", "estimatedIRR": "X%", "capRate": "X%", "cashOnCash": "X%",
    "noi": 0, "annualCashFlow": 0, "gdv": 0, "dscr": 0,
    "peRatio": 0, "volatility": "low|medium|high", "breakEvenYears": 0
  },
  "risk": { "overallScore": 0-100, "level": "low|medium|high", "factors": [{ "name": "...", "score": 0-100, "impact": "..." }] },
  "demographics": { "population": "...", "medianIncome": "...", "employmentRate": "...", "growthRate": "..." },
  "marketInsights": { "trend": "...", "pricePerSqm": 0, "areaGrowth": "...", "supplyDemand": "...", "forecast": "..." },
  "esg": { "score": 0-100, "environmental": 0-100, "social": 0-100, "governance": 0-100, "notes": "..." },
  "recommendation": "BUY|HOLD|SELL|AVOID",
  "summary": "2-3 sentence executive summary",
  "developerReputation": { "rating": 0-5, "completedProjects": 0, "onTimeDelivery": "X%", "qualityScore": 0-100, "notes": "..." }
}`;
        break;

      case "listing_assist":
        systemPrompt = `You are TerraVista AI, a premium real estate listing assistant for the Iraqi market. Help sellers create compelling, professional property listings with AI-powered insights. Return ONLY valid JSON.`;
        userPrompt = `Create a professional listing and analysis for this property:
${JSON.stringify(property)}

Return JSON:
{
  "listing": {
    "title": "compelling property title",
    "titleAr": "Arabic title",
    "description": "detailed 3-4 paragraph description highlighting key features, location benefits, investment potential",
    "descriptionAr": "Arabic description",
    "highlights": ["5-7 key selling points"],
    "targetBuyer": "description of ideal buyer profile"
  },
  "pricing": {
    "recommendedPrice": 0,
    "priceRange": { "min": 0, "max": 0 },
    "pricePerSqm": 0,
    "marketComparison": "above|at|below market",
    "reasoning": "why this price range"
  },
  "marketTrends": {
    "areaGrowth": "X%",
    "demandLevel": "high|medium|low",
    "avgDaysOnMarket": 0,
    "forecast": "6-12 month prediction",
    "comparables": "summary of comparable properties"
  },
  "swot": { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] },
  "investmentScore": { "overall": 0-100, "location": 0-100, "value": 0-100, "growth": 0-100, "risk": 0-100, "liquidity": 0-100 },
  "financials": {
    "estimatedROI": "X%", "capRate": "X%", "cashOnCash": "X%",
    "noi": 0, "breakEvenYears": 0, "volatility": "low|medium|high"
  },
  "risk": { "overallScore": 0-100, "level": "low|medium|high", "factors": [{ "name": "...", "score": 0-100, "impact": "..." }] },
  "demographics": { "population": "...", "medianIncome": "...", "employmentRate": "...", "growthRate": "..." },
  "esg": { "score": 0-100, "environmental": 0-100, "social": 0-100, "governance": 0-100, "notes": "..." },
  "tips": ["3-5 tips to improve listing performance"]
}`;
        break;

      case "smart_search":
        systemPrompt = `You are TerraVista AI, a smart property search assistant for the Iraqi real estate market. Help users find properties matching their criteria. Return structured recommendations in JSON format. Return ONLY valid JSON.`;
        userPrompt = `User investment criteria: ${JSON.stringify(criteria)}
Available properties: ${JSON.stringify(property)}

Return JSON:
{
  "matches": [{ "propertyId": "...", "matchScore": 0-100, "matchReasons": ["..."], "concerns": ["..."] }],
  "marketAdvice": "Brief advice about their criteria",
  "suggestions": ["suggestions to refine search"]
}`;
        break;

      case "mortgage_calc":
        systemPrompt = `You are a mortgage calculator AI for Iraqi real estate. Provide detailed mortgage analysis in JSON. Return ONLY valid JSON.`;
        userPrompt = `Calculate mortgage for: ${JSON.stringify(property)}
Return JSON:
{
  "monthlyPayment": 0, "totalInterest": 0, "totalPayment": 0,
  "amortizationSummary": [{ "year": 1, "principal": 0, "interest": 0, "balance": 0 }],
  "affordabilityRating": "affordable|moderate|stretched|unaffordable",
  "tips": ["..."]
}`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid analysis type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `${systemPrompt}\n\n${langInstruction}` },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ analysis: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
