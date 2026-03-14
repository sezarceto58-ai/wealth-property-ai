/**
 * Market Intelligence Dashboard — Module 3
 * Analytics dashboard with neighborhood heat maps, rental yield maps,
 * and appreciation forecasts.
 */

import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, MapPin, DollarSign, Activity, Globe,
  Flame, Home, Building2, Target, ArrowUpRight, ArrowDownRight,
  ChevronRight, Layers, RefreshCw, Download,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import { trackMarketIntelView, trackNeighborhoodView } from "@/services/dataMoat";

// ── Data ──

const cities = ["Erbil", "Baghdad", "Basra", "Sulaymaniyah"];

const neighborhoodData: Record<string, {
  name: string;
  city: string;
  avgPrice: number;
  priceChange: number;
  rentalYield: number;
  demandScore: number; // 0–100 (heat intensity)
  listingsCount: number;
  daysOnMarket: number;
  forecast1yr: number;
}[]> = {
  Erbil: [
    { name: "Ankawa", city: "Erbil", avgPrice: 2650, priceChange: 9.2, rentalYield: 7.8, demandScore: 92, listingsCount: 148, daysOnMarket: 18, forecast1yr: 10.1 },
    { name: "Gulan", city: "Erbil", avgPrice: 2400, priceChange: 7.8, rentalYield: 8.2, demandScore: 85, listingsCount: 97, daysOnMarket: 22, forecast1yr: 8.9 },
    { name: "Shorsh", city: "Erbil", avgPrice: 2100, priceChange: 6.1, rentalYield: 9.1, demandScore: 78, listingsCount: 72, daysOnMarket: 28, forecast1yr: 7.4 },
    { name: "Sarchinar", city: "Erbil", avgPrice: 1850, priceChange: 4.3, rentalYield: 9.8, demandScore: 65, listingsCount: 53, daysOnMarket: 35, forecast1yr: 5.8 },
    { name: "Koya", city: "Erbil", avgPrice: 1580, priceChange: 2.1, rentalYield: 10.5, demandScore: 48, listingsCount: 31, daysOnMarket: 52, forecast1yr: 3.9 },
  ],
  Baghdad: [
    { name: "Mansour", city: "Baghdad", avgPrice: 2350, priceChange: 6.5, rentalYield: 6.9, demandScore: 88, listingsCount: 210, daysOnMarket: 21, forecast1yr: 7.2 },
    { name: "Karrada", city: "Baghdad", avgPrice: 2100, priceChange: 5.2, rentalYield: 7.4, demandScore: 82, listingsCount: 165, daysOnMarket: 25, forecast1yr: 6.1 },
    { name: "Jadriya", city: "Baghdad", avgPrice: 2280, priceChange: 5.8, rentalYield: 6.5, demandScore: 79, listingsCount: 88, daysOnMarket: 29, forecast1yr: 6.5 },
    { name: "Zayouna", city: "Baghdad", avgPrice: 1960, priceChange: 4.1, rentalYield: 7.8, demandScore: 70, listingsCount: 113, daysOnMarket: 33, forecast1yr: 4.9 },
    { name: "Adhamiya", city: "Baghdad", avgPrice: 1720, priceChange: 3.2, rentalYield: 8.3, demandScore: 61, listingsCount: 74, daysOnMarket: 41, forecast1yr: 3.8 },
    { name: "Sadr City", city: "Baghdad", avgPrice: 1150, priceChange: 1.8, rentalYield: 11.2, demandScore: 44, listingsCount: 95, daysOnMarket: 58, forecast1yr: 2.4 },
  ],
  Basra: [
    { name: "Ashar", city: "Basra", avgPrice: 1540, priceChange: 4.8, rentalYield: 8.9, demandScore: 73, listingsCount: 89, daysOnMarket: 31, forecast1yr: 5.6 },
    { name: "Brazilja", city: "Basra", avgPrice: 1290, priceChange: 2.9, rentalYield: 10.1, demandScore: 58, listingsCount: 55, daysOnMarket: 45, forecast1yr: 3.5 },
  ],
  Sulaymaniyah: [
    { name: "Bakhtiari", city: "Sulaymaniyah", avgPrice: 1890, priceChange: 7.2, rentalYield: 7.5, demandScore: 80, listingsCount: 62, daysOnMarket: 24, forecast1yr: 8.3 },
    { name: "Qadisiyah", city: "Sulaymaniyah", avgPrice: 1650, priceChange: 5.4, rentalYield: 8.6, demandScore: 71, listingsCount: 48, daysOnMarket: 30, forecast1yr: 6.4 },
  ],
};

const marketTrends = [
  { month: "Sep", avgPrice: 1920, transactions: 312, rentalYield: 7.8 },
  { month: "Oct", avgPrice: 1955, transactions: 328, rentalYield: 7.9 },
  { month: "Nov", avgPrice: 1980, transactions: 298, rentalYield: 8.0 },
  { month: "Dec", avgPrice: 2010, transactions: 275, rentalYield: 8.1 },
  { month: "Jan", avgPrice: 2050, transactions: 340, rentalYield: 7.9 },
  { month: "Feb", avgPrice: 2090, transactions: 365, rentalYield: 7.8 },
  { month: "Mar", avgPrice: 2135, transactions: 390, rentalYield: 7.7 },
];

const propertyTypeBreakdown = [
  { type: "Apartment", share: 42, avgYield: 8.5, growth: 6.2, color: "bg-primary" },
  { type: "Villa", share: 28, avgYield: 6.8, growth: 8.1, color: "bg-success" },
  { type: "Commercial", share: 18, avgYield: 9.2, growth: 4.3, color: "bg-warning" },
  { type: "Land", share: 8, avgYield: 0, growth: 5.8, color: "bg-purple-500" },
  { type: "Other", share: 4, avgYield: 7.1, growth: 3.9, color: "bg-muted-foreground" },
];

// ── Heat Map Cell ──
function HeatCell({ score, label }: { score: number; label: string }) {
  const intensity = score / 100;
  const bg =
    intensity > 0.85 ? "bg-red-500/80 text-white" :
    intensity > 0.70 ? "bg-orange-400/80 text-white" :
    intensity > 0.55 ? "bg-yellow-400/80 text-foreground" :
    intensity > 0.40 ? "bg-green-400/80 text-foreground" :
    "bg-blue-300/60 text-foreground";
  return (
    <div className={`rounded-lg p-2.5 text-center transition-all hover:scale-105 cursor-default ${bg}`}>
      <div className="text-lg font-bold leading-none">{score}</div>
      <div className="text-[10px] mt-0.5 font-medium opacity-90 truncate">{label}</div>
    </div>
  );
}

// ── Trend Bar ──
function TrendBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-2 bg-secondary rounded-full overflow-hidden w-full">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}

// ── Forecast Card ──
function ForecastCard({ city, growth, confidence, note }: {
  city: string; growth: number; confidence: string; note: string;
}) {
  const isUp = growth > 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{city}</p>
          <p className="text-[10px] text-muted-foreground">{confidence} confidence</p>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${
          isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        }`}>
          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {isUp ? "+" : ""}{growth}%
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
    </div>
  );
}

// ── Mini Chart (SVG sparkline) ──
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120, h = 36;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Main Page ──
export default function MarketIntelligence() {
  const [selectedCity, setSelectedCity] = useState("Erbil");
  const neighborhoods = neighborhoodData[selectedCity] ?? [];

  // Data Moat tracking
  useEffect(() => {
    trackMarketIntelView(selectedCity, "heatmap");
  }, [selectedCity]);

  const topGrowth = [...neighborhoods].sort((a, b) => b.priceChange - a.priceChange);
  const topYield = [...neighborhoods].sort((a, b) => b.rentalYield - a.rentalYield);

  const avgPrice = Math.round(neighborhoods.reduce((s, n) => s + n.avgPrice, 0) / neighborhoods.length);
  const avgYield = (neighborhoods.reduce((s, n) => s + n.rentalYield, 0) / neighborhoods.length).toFixed(1);
  const avgDemand = Math.round(neighborhoods.reduce((s, n) => s + n.demandScore, 0) / neighborhoods.length);

  const trendPrices = marketTrends.map(m => m.avgPrice);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Market Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time analytics, heat maps, rental yields, and appreciation forecasts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">
            <Activity className="w-3 h-3 mr-1" /> Live Data
          </Badge>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Avg $/m²" value={`$${avgPrice}`} change="+5.8% YoY" icon={DollarSign} trend="up" />
        <StatsCard title="Avg Rental Yield" value={`${avgYield}%`} change="+0.4%" icon={TrendingUp} trend="up" />
        <StatsCard title="Demand Index" value={`${avgDemand}/100`} icon={Flame} trend="up" />
        <StatsCard title="Active Listings" value={neighborhoods.reduce((s, n) => s + n.listingsCount, 0)} icon={Home} />
      </div>

      {/* City Selector */}
      <div className="flex gap-2 flex-wrap">
        {cities.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCity(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCity === c
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            <MapPin className="w-3 h-3 inline mr-1.5" />{c}
          </button>
        ))}
      </div>

      <Tabs defaultValue="heatmap">
        <TabsList className="bg-secondary rounded-xl p-1 h-auto flex-wrap">
          <TabsTrigger value="heatmap" className="rounded-lg text-xs gap-1.5">
            <Flame className="w-3 h-3" /> Demand Heat Map
          </TabsTrigger>
          <TabsTrigger value="yield" className="rounded-lg text-xs gap-1.5">
            <DollarSign className="w-3 h-3" /> Rental Yield Map
          </TabsTrigger>
          <TabsTrigger value="forecast" className="rounded-lg text-xs gap-1.5">
            <TrendingUp className="w-3 h-3" /> Appreciation Forecast
          </TabsTrigger>
          <TabsTrigger value="trends" className="rounded-lg text-xs gap-1.5">
            <Activity className="w-3 h-3" /> Market Trends
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="rounded-lg text-xs gap-1.5">
            <Layers className="w-3 h-3" /> Property Mix
          </TabsTrigger>
        </TabsList>

        {/* ── Demand Heat Map ── */}
        <TabsContent value="heatmap" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" /> Demand Intensity — {selectedCity}
              </h2>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="flex gap-1">
                  {["bg-blue-300/60","bg-green-400/80","bg-yellow-400/80","bg-orange-400/80","bg-red-500/80"].map((c,i) => (
                    <div key={i} className={`w-5 h-3 rounded-sm ${c}`} />
                  ))}
                </div>
                Low → High
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {neighborhoods.map(n => (
                <HeatCell key={n.name} score={n.demandScore} label={n.name} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Demand score (0–100) reflects search volume, listing velocity, and offer-to-listing ratio in each neighborhood.
            </p>
          </div>

          {/* Top neighborhoods table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">Neighborhood Ranking — {selectedCity}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {["Neighborhood", "Avg $/m²", "Price Change", "Rental Yield", "Demand", "Days on Market", "Listings"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {neighborhoods.sort((a,b) => b.demandScore - a.demandScore).map((n, i) => (
                    <tr key={n.name} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <span className="text-[10px] text-muted-foreground mr-1">#{i+1}</span>{n.name}
                      </td>
                      <td className="px-4 py-3">${n.avgPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-success font-medium">+{n.priceChange}%</td>
                      <td className="px-4 py-3 text-primary font-medium">{n.rentalYield}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TrendBar value={n.demandScore} max={100} color={
                            n.demandScore > 80 ? "bg-red-500" : n.demandScore > 60 ? "bg-orange-400" : "bg-yellow-400"
                          } />
                          <span className="text-xs font-medium w-8 text-right">{n.demandScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{n.daysOnMarket}d</td>
                      <td className="px-4 py-3 text-muted-foreground">{n.listingsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── Rental Yield Map ── */}
        <TabsContent value="yield" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Yield Heat Map */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-primary" /> Rental Yield by Neighborhood
              </h2>
              <div className="space-y-3">
                {topYield.map(n => (
                  <div key={n.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{n.name}</span>
                      <span className="font-bold text-primary">{n.rentalYield}%</span>
                    </div>
                    <TrendBar value={n.rentalYield} max={12} color="bg-primary" />
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Yield insight:</span>{" "}
                  Higher yields often appear in less prime neighborhoods — balance yield against capital growth potential.
                </p>
              </div>
            </div>

            {/* Yield vs Growth scatter */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-primary" /> Yield vs. Price Growth Matrix
              </h2>
              <div className="space-y-3">
                {neighborhoods.map(n => {
                  const quadrant =
                    n.rentalYield >= 8 && n.priceChange >= 5 ? "🏆 Ideal" :
                    n.rentalYield >= 8 ? "💰 High Yield" :
                    n.priceChange >= 5 ? "📈 Growth" : "⚠️ Balanced";
                  const qColor =
                    quadrant === "🏆 Ideal" ? "bg-success/10 text-success border-success/20" :
                    quadrant === "💰 High Yield" ? "bg-primary/10 text-primary border-primary/20" :
                    quadrant === "📈 Growth" ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-secondary text-muted-foreground border-border";
                  return (
                    <div key={n.name} className={`flex items-center justify-between p-3 rounded-lg border ${qColor}`}>
                      <div>
                        <p className="text-sm font-semibold">{n.name}</p>
                        <p className="text-[10px] opacity-70">Yield {n.rentalYield}% · Growth +{n.priceChange}%</p>
                      </div>
                      <span className="text-xs font-bold">{quadrant}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Appreciation Forecast ── */}
        <TabsContent value="forecast" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> 12-Month Price Forecasts
              </h2>
              {topGrowth.map(n => (
                <ForecastCard
                  key={n.name}
                  city={`${n.name}, ${n.city}`}
                  growth={n.forecast1yr}
                  confidence={n.demandScore > 75 ? "High" : n.demandScore > 55 ? "Medium" : "Low"}
                  note={`Based on ${n.listingsCount} active listings, ${n.daysOnMarket} avg days on market, and regional macro factors. Current avg: $${n.avgPrice}/m².`}
                />
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> City-Level 5-Year Outlook
              </h2>
              {[
                { city: "Erbil", y1: 8.9, y3: 28.4, y5: 51.2, note: "KRG investment climate improving. Tourism & expat demand growing.", trend: "strong" },
                { city: "Baghdad", y1: 6.1, y3: 19.5, y5: 34.6, note: "Reconstruction momentum continues. Prime district supply limited.", trend: "moderate" },
                { city: "Sulaymaniyah", y1: 7.4, y3: 23.8, y5: 42.1, note: "Steady growth driven by education hub and local demand.", trend: "moderate" },
                { city: "Basra", y1: 4.8, y3: 14.9, y5: 26.3, note: "Oil sector dependent. Yield plays strong but capital growth slower.", trend: "stable" },
              ].map(c => (
                <div key={c.city} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-foreground">{c.city}</p>
                    <Badge className={
                      c.trend === "strong" ? "bg-success/10 text-success border-success/20" :
                      c.trend === "moderate" ? "bg-primary/10 text-primary border-primary/20" :
                      "bg-secondary text-muted-foreground"
                    }>
                      {c.trend === "strong" ? "Strong Growth" : c.trend === "moderate" ? "Moderate Growth" : "Stable"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[["1 Year", `+${c.y1}%`], ["3 Years", `+${c.y3}%`], ["5 Years", `+${c.y5}%`]].map(([label, val]) => (
                      <div key={label} className="text-center rounded-lg bg-secondary/50 p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-sm font-bold text-success">{val}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.note}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Market Trends ── */}
        <TabsContent value="trends" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" /> Price Trend (7 Months)
              </h2>
              <div className="flex items-end gap-2 h-36">
                {marketTrends.map((m, i, arr) => {
                  const min = Math.min(...arr.map(x => x.avgPrice));
                  const max = Math.max(...arr.map(x => x.avgPrice));
                  const heightPct = ((m.avgPrice - min) / (max - min)) * 70 + 30;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">${(m.avgPrice / 1000).toFixed(1)}k</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/80 to-primary/40 transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-primary" /> Rental Yield Trend
              </h2>
              <div className="flex items-end gap-2 h-36">
                {marketTrends.map((m, i, arr) => {
                  const min = Math.min(...arr.map(x => x.rentalYield));
                  const max = Math.max(...arr.map(x => x.rentalYield));
                  const heightPct = ((m.rentalYield - min) / (max - min + 0.01)) * 50 + 50;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">{m.rentalYield}%</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-success/80 to-success/40"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-primary" /> Transaction Volume
              </h2>
              <div className="flex items-end gap-3 h-32">
                {marketTrends.map(m => {
                  const max = Math.max(...marketTrends.map(x => x.transactions));
                  const heightPct = (m.transactions / max) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">{m.transactions}</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-warning/80 to-warning/30"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Property Mix ── */}
        <TabsContent value="breakdown" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-primary" /> Market Composition
              </h2>
              <div className="space-y-4">
                {propertyTypeBreakdown.map(pt => (
                  <div key={pt.type}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-foreground">{pt.type}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Yield: <span className="text-primary font-semibold">{pt.avgYield > 0 ? `${pt.avgYield}%` : "N/A"}</span></span>
                        <span>Growth: <span className="text-success font-semibold">+{pt.growth}%</span></span>
                        <span className="font-bold text-foreground">{pt.share}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pt.color}`} style={{ width: `${pt.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-primary" /> Market Intelligence Signals
              </h2>
              {[
                { signal: "Rising Demand in Ankawa", detail: "Search volume +34% MoM. Avg DOM dropped from 28 to 18 days.", type: "bullish" },
                { signal: "Rental Yield Compression in Mansour", detail: "Prices rising faster than rents. Yield fell 0.4% over 3 months.", type: "bearish" },
                { signal: "New Supply Coming — Sulaymaniyah", detail: "12 new developments announced. May dampen price growth short-term.", type: "neutral" },
                { signal: "Foreign Investment Uptick — Erbil", detail: "Expat buyer inquiries +22% QoQ. KRG visa reforms cited as catalyst.", type: "bullish" },
                { signal: "Commercial Vacancy Rising — Basra", detail: "Commercial vacancy rate at 18%, highest in 2 years.", type: "bearish" },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl border p-4 ${
                  s.type === "bullish" ? "border-success/20 bg-success/5" :
                  s.type === "bearish" ? "border-destructive/20 bg-destructive/5" :
                  "border-warning/20 bg-warning/5"
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-base shrink-0">
                      {s.type === "bullish" ? "📈" : s.type === "bearish" ? "📉" : "⚠️"}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${
                        s.type === "bullish" ? "text-success" :
                        s.type === "bearish" ? "text-destructive" : "text-warning"
                      }`}>{s.signal}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
