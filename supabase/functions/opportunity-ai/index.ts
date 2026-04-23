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

function getLangInstruction(lang: string): string {
  return LANG_INSTRUCTIONS[(lang as Lang)] ?? LANG_INSTRUCTIONS.en;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { token } = await requireUser(req);
    await consumeUsage(token, "opportunity_ai", 1);

    const { type, opportunity, criteria, language = "en" } = await req.json();
    const langInstruction = getLangInstruction(language);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";
    const langSuffix = `\n\nLANGUAGE INSTRUCTION (MANDATORY): ${langInstruction} All string values in the JSON response (summaries, descriptions, factor names, notes, insights, labels, recommendations text) MUST be written in the specified language. Only numeric values, JSON keys, and fixed enum tokens (like "BUY", "low", "high") stay in English.`;

    switch (type) {
      case "full_analysis":
        systemPrompt = `You are TerraVista AI, an expert real estate investment analyst for the Iraqi and Middle Eastern markets. Analyze opportunities comprehensively. Return ONLY valid JSON.${langSuffix}`;
        userPrompt = `Analyze this investment opportunity and return JSON:
${JSON.stringify(opportunity)}

Return:
{
  "investmentScore": { "overall": 0-100, "location": 0-100, "value": 0-100, "growth": 0-100, "risk": 0-100, "liquidity": 0-100 },
  "swot": { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] },
  "financials": {
    "roi": "X%", "irr": "X%", "capRate": "X%", "rentalYield": "X%",
    "noi": 0, "cashOnCash": "X%", "dscr": 0, "paybackYears": 0, "netProfit": 0,
    "gdv": 0, "annualCashFlow": 0, "breakEvenMonths": 0
  },
  "risk": { "overallScore": 0-100, "level": "low|medium|high", "factors": [{ "name": "...", "score": 0-100, "impact": "..." }] },
  "demographics": { "population": "...", "medianIncome": "...", "employmentRate": "...", "growthRate": "..." },
  "marketInsights": { "trend": "...", "pricePerSqm": 0, "areaGrowth": "...", "supplyDemand": "...", "forecast": "..." },
  "esg": { "score": 0-100, "environmental": 0-100, "social": 0-100, "governance": 0-100, "notes": "..." },
  "recommendation": "BUY|HOLD|SELL|AVOID",
  "summary": "3-4 sentence executive summary",
  "advisory": {
    "developmentRec": "...", "pricingSuggestion": "...", "unitMixOptimization": "...", "exitStrategy": "..."
  },
  "legalIntel": { "zoningStatus": "...", "permitRequirements": ["..."], "restrictions": ["..."], "regulatoryAlerts": ["..."] }
}`;
        break;

      case "predictive":
        systemPrompt = `You are TerraVista AI forecasting engine. Generate realistic predictive models for real estate in Iraq/Middle East. Return ONLY valid JSON.${langSuffix}`;
        userPrompt = `Generate predictive analysis for: ${JSON.stringify(opportunity)}

Return:
{
  "appreciation": { "year1": "X%", "year3": "X%", "year5": "X%", "year10": "X%" },
  "rentalDemand": { "current": "high|medium|low", "forecast": "...", "occupancyRate": "X%" },
  "developmentProfitability": { "scenario": "...", "margin": "X%", "confidence": 0-1 },
  "riskIndicators": [{ "factor": "...", "probability": "X%", "impact": "high|medium|low" }],
  "marketVolatility": { "level": "low|medium|high", "drivers": ["..."] },
  "scenarios": {
    "optimistic": { "roi5yr": "X%", "value": 0, "description": "..." },
    "base": { "roi5yr": "X%", "value": 0, "description": "..." },
    "pessimistic": { "roi5yr": "X%", "value": 0, "description": "..." }
  },
  "rentalProjections": { "year1": 0, "year3": 0, "year5": 0, "year10": 0 },
  "resaleEstimates": { "year1": 0, "year3": 0, "year5": 0, "year10": 0 },
  "sensitivityAnalysis": {
    "interestRateImpact": "...",
    "priceFluctuationImpact": "...",
    "costOverrunImpact": "..."
  }
}`;
        break;

      case "portfolio":
        systemPrompt = `You are TerraVista AI portfolio analyst. Analyze a portfolio of real estate opportunities. Return ONLY valid JSON.${langSuffix}`;
        userPrompt = `Analyze this portfolio: ${JSON.stringify(opportunity)}

Return:
{
  "totalValue": 0,
  "averageROI": "X%",
  "riskDistribution": { "low": 0, "medium": 0, "high": 0 },
  "geographicExposure": [{ "city": "...", "percentage": "X%", "value": 0 }],
  "performanceRanking": [{ "id": "...", "title": "...", "score": 0, "recommendation": "..." }],
  "diversificationScore": 0-100,
  "overallRecommendation": "...",
  "rebalancingSuggestions": ["..."]
}`;
        break;

      case "investment_plan":
        systemPrompt = `You are TerraVista AI strategic planner. Generate comprehensive investment strategy reports. Return ONLY valid JSON.${langSuffix}`;
        userPrompt = `Generate a full investment plan for: ${JSON.stringify(opportunity)}

Return:
{
  "executiveSummary": "...",
  "swot": { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] },
  "riskAssessment": { "overall": "low|medium|high", "mitigations": ["..."] },
  "marketPositioning": "...",
  "financialModel": { "totalInvestment": 0, "expectedReturn": 0, "timeline": "...", "breakeven": "..." },
  "exitStrategy": { "primary": "...", "secondary": "...", "timeline": "..." },
  "actionPlan": [{ "phase": "...", "actions": ["..."], "timeline": "..." }]
}`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid analysis type" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    console.error("Opportunity AI error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
