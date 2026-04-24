import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

const LANG_RECOMMENDATION_LABELS: Record<Lang, Record<string, string>> = {
  en: { BUY: "BUY", HOLD: "HOLD", SELL: "SELL", AVOID: "AVOID" },
  ar: { BUY: "شراء", HOLD: "احتفاظ", SELL: "بيع", AVOID: "تجنب" },
  ku: { BUY: "بکڕە", HOLD: "هەڵگرە", SELL: "بیفرۆشە", AVOID: "دووری لێبگرەوە" },
};

function getLangInstruction(lang: string): string {
  return LANG_INSTRUCTIONS[(lang as Lang)] ?? LANG_INSTRUCTIONS.en;
}

// ── Main handler ───────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { token } = await requireUser(req);
    await consumeUsage(token, "ai_property_analysis", 1);

    const { type, property, criteria, language = "en" } = await req.json();
    const langInstruction = getLangInstruction(language);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    // ── Language-aware base instruction appended to every system prompt ────────
    const langName = language === "ar" ? "Arabic (العربية)" : language === "ku" ? "Kurdish Sorani (کوردی سۆرانی)" : "English";
    const langSuffix = `\n\nLANGUAGE INSTRUCTION (ABSOLUTELY MANDATORY — HIGHEST PRIORITY):
${langInstruction}
The target output language is: ${langName}.
EVERY natural-language string value in the JSON response MUST be written in ${langName}. This includes (non-exhaustive): summary, description, descriptionAr, title, titleAr, highlights, targetBuyer, reasoning, marketComparison, areaGrowth, demandLevel, forecast, comparables, swot.strengths, swot.weaknesses, swot.opportunities, swot.threats, risk.factors[].name, risk.factors[].impact, demographics.*, marketInsights.*, esg.notes, tips, matchReasons, concerns, marketAdvice, suggestions, amortizationSummary text, affordabilityRating description, developerReputation.notes.
Do NOT mix languages. Do NOT default to English. If you are uncertain how to translate a term, translate it naturally rather than leaving it in English.
Only the following stay in English: JSON keys, numeric values, percentage symbols, currency codes, and these fixed enum tokens exactly as written: "BUY", "HOLD", "SELL", "AVOID", "low", "medium", "high", "affordable", "moderate", "stretched", "unaffordable", "above", "at", "below".`;

    switch (type) {

      case "full_analysis":
        systemPrompt = `You are AqarAI, an expert real estate investment analyst for the Iraqi market (Baghdad, Erbil, Basra, Sulaymaniyah, Mosul). Provide comprehensive property analysis in JSON format. Be specific with numbers and realistic for the Iraqi market. Return ONLY valid JSON.${langSuffix}`;
        userPrompt = `Analyze this property and return a JSON object with these exact keys:
Property: ${JSON.stringify(property)}

Return JSON with:
{
  "swot": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "opportunities": ["..."],
    "threats": ["..."]
  },
  "investmentScore": { "overall": 0-100, "location": 0-100, "value": 0-100, "growth": 0-100, "risk": 0-100, "liquidity": 0-100 },
  "financials": {
    "estimatedROI": "X%", "estimatedIRR": "X%", "capRate": "X%", "cashOnCash": "X%",
    "noi": 0, "annualCashFlow": 0, "gdv": 0, "dscr": 0,
    "peRatio": 0, "volatility": "low|medium|high", "breakEvenYears": 0
  },
  "risk": {
    "overallScore": 0-100, "level": "low|medium|high",
    "factors": [{ "name": "...", "score": 0-100, "impact": "..." }]
  },
  "demographics": { "population": "...", "medianIncome": "...", "employmentRate": "...", "growthRate": "..." },
  "marketInsights": { "trend": "...", "pricePerSqm": 0, "areaGrowth": "...", "supplyDemand": "...", "forecast": "..." },
  "esg": { "score": 0-100, "environmental": 0-100, "social": 0-100, "governance": 0-100, "notes": "..." },
  "recommendation": "BUY|HOLD|SELL|AVOID",
  "summary": "2-3 sentence executive summary in the specified language",
  "developerReputation": { "rating": 0-5, "completedProjects": 0, "onTimeDelivery": "X%", "qualityScore": 0-100, "notes": "..." }
}`;
        break;

      case "listing_assist":
        systemPrompt = `You are AqarAI, a premium real estate listing assistant for the Iraqi market. Help sellers create compelling, professional property listings with AI-powered insights. Return ONLY valid JSON.${langSuffix}`;
        userPrompt = `Create a professional listing and analysis for this property:
${JSON.stringify(property)}

Return JSON:
{
  "listing": {
    "title": "compelling property title",
    "titleAr": "Arabic title",
    "description": "detailed 3-4 paragraph description",
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
    "areaGrowth": "X%", "demandLevel": "high|medium|low",
    "avgDaysOnMarket": 0, "forecast": "6-12 month prediction",
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
        systemPrompt = `You are AqarAI, a smart property search assistant for the Iraqi real estate market. Help users find properties matching their criteria. Return structured recommendations in JSON format. Return ONLY valid JSON.${langSuffix}`;
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
        systemPrompt = `You are a mortgage calculator AI for Iraqi real estate. Provide detailed mortgage analysis in JSON. Return ONLY valid JSON.${langSuffix}`;
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
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   },
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

    return new Response(JSON.stringify({ analysis: parsed, language }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
