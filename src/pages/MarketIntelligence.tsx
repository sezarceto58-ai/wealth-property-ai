/**
 * Market Intelligence Dashboard — simplified 3-tab layout
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, TrendingUp, MapPin, DollarSign, Flame, Building2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import { trackMarketIntelView } from "@/services/dataMoat";

const cities = ["Erbil", "Baghdad", "Basra", "Sulaymaniyah"];

const neighborhoodData: Record<string, {
  name: string; avgPrice: number; priceChange: number;
  rentalYield: number; demandScore: number; daysOnMarket: number; forecast1yr: number;
}[]> = {
  Erbil: [
    { name: "Ankawa",     avgPrice: 2650, priceChange: 9.2,  rentalYield: 7.8,  demandScore: 92, daysOnMarket: 18, forecast1yr: 10.1 },
    { name: "Gulan",      avgPrice: 2400, priceChange: 7.8,  rentalYield: 8.2,  demandScore: 85, daysOnMarket: 22, forecast1yr: 8.9 },
    { name: "Shorsh",     avgPrice: 2100, priceChange: 6.1,  rentalYield: 9.1,  demandScore: 78, daysOnMarket: 28, forecast1yr: 7.4 },
    { name: "Sarchinar",  avgPrice: 1850, priceChange: 4.3,  rentalYield: 9.8,  demandScore: 65, daysOnMarket: 35, forecast1yr: 5.8 },
    { name: "Koya",       avgPrice: 1580, priceChange: 2.1,  rentalYield: 10.5, demandScore: 48, daysOnMarket: 52, forecast1yr: 3.9 },
  ],
  Baghdad: [
    { name: "Mansour",    avgPrice: 2350, priceChange: 6.5,  rentalYield: 6.9,  demandScore: 88, daysOnMarket: 21, forecast1yr: 7.2 },
    { name: "Karrada",    avgPrice: 2100, priceChange: 5.2,  rentalYield: 7.4,  demandScore: 82, daysOnMarket: 25, forecast1yr: 6.1 },
    { name: "Jadriya",    avgPrice: 2280, priceChange: 5.8,  rentalYield: 6.5,  demandScore: 79, daysOnMarket: 29, forecast1yr: 6.5 },
    { name: "Zayouna",    avgPrice: 1960, priceChange: 4.1,  rentalYield: 7.8,  demandScore: 70, daysOnMarket: 33, forecast1yr: 4.9 },
    { name: "Adhamiya",   avgPrice: 1720, priceChange: 3.2,  rentalYield: 8.3,  demandScore: 61, daysOnMarket: 41, forecast1yr: 3.8 },
    { name: "Sadr City",  avgPrice: 1150, priceChange: 1.8,  rentalYield: 11.2, demandScore: 44, daysOnMarket: 58, forecast1yr: 2.4 },
  ],
  Basra: [
    { name: "Ashar",      avgPrice: 1540, priceChange: 4.8,  rentalYield: 8.9,  demandScore: 73, daysOnMarket: 31, forecast1yr: 5.6 },
    { name: "Brazilja",   avgPrice: 1290, priceChange: 2.9,  rentalYield: 10.1, demandScore: 58, daysOnMarket: 45, forecast1yr: 3.5 },
  ],
  Sulaymaniyah: [
    { name: "Bakhtiari",  avgPrice: 1890, priceChange: 7.2,  rentalYield: 7.5,  demandScore: 80, daysOnMarket: 24, forecast1yr: 8.3 },
    { name: "Qadisiyah",  avgPrice: 1650, priceChange: 5.4,  rentalYield: 8.6,  demandScore: 71, daysOnMarket: 30, forecast1yr: 6.4 },
  ],
};

const cityForecasts = [
  { city: "Erbil",           y1: 8.9,  y3: 28.4, y5: 51.2, trend: "Strong Growth",    color: "text-emerald-600 dark:text-emerald-400" },
  { city: "Baghdad",         y1: 6.1,  y3: 19.5, y5: 34.6, trend: "Moderate Growth",  color: "text-primary" },
  { city: "Sulaymaniyah",    y1: 7.4,  y3: 23.8, y5: 42.1, trend: "Moderate Growth",  color: "text-primary" },
  { city: "Basra",           y1: 4.8,  y3: 14.9, y5: 26.3, trend: "Stable",           color: "text-amber-600 dark:text-amber-400" },
];

const marketSignals = [
  { type: "bullish", headline: "Rising demand in Ankawa", detail: "Avg days-on-market dropped from 28 → 18. Search volume +34% MoM." },
  { type: "bearish", headline: "Yield compression in Mansour", detail: "Prices rising faster than rents — yield fell 0.4% over 3 months." },
  { type: "neutral", headline: "New supply — Sulaymaniyah", detail: "12 new developments announced. May moderate short-term price growth." },
  { type: "bullish", headline: "Foreign investment — Erbil", detail: "Expat buyer inquiries +22% QoQ following KRG visa reforms." },
];

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 bg-secondary rounded-full overflow-hidden flex-1">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}

export default function MarketIntelligence() {
  const { t } = useTranslation();
  const [city, setCity] = useState("Erbil");
  const hoods = neighborhoodData[city] ?? [];

  useEffect(() => { trackMarketIntelView(city, "overview"); }, [city]);

  const avgPrice = Math.round(hoods.reduce((s, n) => s + n.avgPrice, 0) / hoods.length);
  const avgYield = (hoods.reduce((s, n) => s + n.rentalYield, 0) / hoods.length).toFixed(1);
  const avgDemand = Math.round(hoods.reduce((s, n) => s + n.demandScore, 0) / hoods.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> {t("market.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("market.pageSubtitle")}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title={t("market.avgPricePerSqm")} value={`$${avgPrice}`}       change="+5.8% YoY" icon={DollarSign}  trend="up" />
        <StatsCard title={t("market.avgRentalYield")} value={`${avgYield}%`}       change="+0.4%"     icon={TrendingUp}  trend="up" />
        <StatsCard title={t("market.demandIndex")}     value={`${avgDemand}/100`}                      icon={Flame}       trend="up" />
        <StatsCard title={t("market.activeListings")}  value={hoods.reduce((s, n) => s + n.daysOnMarket, 0)} icon={Building2} />
      </div>

      {/* City Picker */}
      <div className="flex gap-2 flex-wrap">
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              city === c
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-secondary rounded-xl p-1 h-auto">
          <TabsTrigger value="overview"   className="rounded-lg text-xs">{t("market.tabDemandYield")}</TabsTrigger>
          <TabsTrigger value="forecasts"  className="rounded-lg text-xs">{t("market.tabForecasts")}</TabsTrigger>
          <TabsTrigger value="signals"    className="rounded-lg text-xs">{t("market.tabSignals")}</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Demand & Yield ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{t("market.neighborhoodOverview", { city })}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t("market.sortedByDemand")}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    {[
                      t("market.colNeighborhood"),
                      t("market.colAvgPrice"),
                      t("market.colGrowth"),
                      t("market.colRentalYield"),
                      t("market.colDemand"),
                      t("market.colDaysOnMarket"),
                    ].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...hoods].sort((a, b) => b.demandScore - a.demandScore).map((n, i) => (
                    <tr key={n.name} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <span className="text-[10px] text-muted-foreground mr-1.5">#{i + 1}</span>{n.name}
                      </td>
                      <td className="px-4 py-3 text-foreground">${n.avgPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">+{n.priceChange}%</td>
                      <td className="px-4 py-3 font-semibold text-primary">{n.rentalYield}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ScoreBar
                            value={n.demandScore} max={100}
                            color={n.demandScore > 80 ? "bg-red-500" : n.demandScore > 60 ? "bg-amber-400" : "bg-emerald-400"}
                          />
                          <span className="text-xs font-semibold text-foreground w-7 text-right">{n.demandScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{n.daysOnMarket}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yield ranking */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">{t("market.rentalYieldRanking")}</h2>
            <div className="space-y-3">
              {[...hoods].sort((a, b) => b.rentalYield - a.rentalYield).map((n) => (
                <div key={n.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-28 shrink-0">{n.name}</span>
                  <ScoreBar value={n.rentalYield} max={12} color="bg-primary" />
                  <span className="text-sm font-bold text-primary w-12 text-right">{n.rentalYield}%</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Forecasts ── */}
        <TabsContent value="forecasts" className="mt-4 space-y-4">
          {/* Per-neighborhood */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{t("market.forecastsTitle", { city })}</h2>
            </div>
            <div className="divide-y divide-border">
              {[...hoods].sort((a, b) => b.forecast1yr - a.forecast1yr).map((n) => (
                <div key={n.name} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.name}</p>
                    <p className="text-xs text-muted-foreground">{t("market.currentAvg", { price: n.avgPrice.toLocaleString() })}</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{n.forecast1yr}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* City 5-year outlook */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">{t("market.fiveYearOutlook")}</h2>
            <div className="space-y-4">
              {cityForecasts.map((cf) => (
                <div key={cf.city} className="rounded-xl bg-secondary/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-foreground">{cf.city}</p>
                    <span className={`text-xs font-bold ${cf.color}`}>{cf.trend}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[["1 Year", cf.y1], ["3 Years", cf.y3], ["5 Years", cf.y5]].map(([label, val]) => (
                      <div key={label as string} className="rounded-lg bg-card border border-border p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className={`text-sm font-bold mt-0.5 ${cf.color}`}>+{val}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Market Signals ── */}
        <TabsContent value="signals" className="mt-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("market.liveSignals")}</p>
            {marketSignals.map((s, i) => {
              const isUp = s.type === "bullish";
              const isDown = s.type === "bearish";
              return (
                <div
                  key={i}
                  className={`rounded-2xl border p-4 flex gap-3 ${
                    isUp   ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20" :
                    isDown ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20" :
                    "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                  }`}
                >
                  <span className="text-xl shrink-0">{isUp ? "📈" : isDown ? "📉" : "⚠️"}</span>
                  <div>
                    <p dir="auto" className={`text-sm font-semibold ${isUp ? "text-emerald-700 dark:text-emerald-400" : isDown ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>
                      {s.headline}
                    </p>
                    <p dir="auto" className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
