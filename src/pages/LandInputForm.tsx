import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, Ruler, Building2, ShieldAlert, Sparkles, Loader2,
  DollarSign, School, TreePine, Landmark, Zap, ArrowRight,
  Navigation, Sun, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const MapPicker = lazy(() => import("@/components/MapPicker"));

const RESTRICTION_OPTIONS = [
  { id: "green_zone", label: "Green Zone", icon: TreePine },
  { id: "height_limit", label: "Height Limit", icon: Building2 },
  { id: "heritage_zone", label: "Heritage Zone", icon: Landmark },
  { id: "flood_zone", label: "Flood Zone", icon: Layers },
  { id: "commercial_only", label: "Commercial Only", icon: DollarSign },
];

const FACILITY_OPTIONS = [
  { id: "hospital", label: "Hospital / Clinic", icon: "🏥" },
  { id: "school", label: "School / University", icon: "🎓" },
  { id: "main_road", label: "Main Road / Highway", icon: "🛣️" },
  { id: "park", label: "Park / Garden", icon: "🌳" },
  { id: "mall", label: "Mall / Shopping Center", icon: "🛒" },
  { id: "mosque", label: "Mosque / Place of Worship", icon: "🕌" },
  { id: "gas_station", label: "Gas Station", icon: "⛽" },
  { id: "government", label: "Government Building", icon: "🏛️" },
];

const STEPS = [
  { label: "Location", icon: MapPin },
  { label: "Land Details", icon: Ruler },
  { label: "Constraints", icon: Building2 },
  { label: "Context", icon: Landmark },
  { label: "Review", icon: Sparkles },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeItem = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function LandInputForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    lat: "",
    lng: "",
    area_sqm: "",
    land_price: "",
    shape: "rectangle",
    max_floors: "10",
    restrictions: [] as string[],
    street_type: "secondary",
    sun_blockage: "none",
    nearby_facilities: [] as { type: string; distance_km: string }[],
    neighborhood_prices: "",
    neighborhood_projects: "",
  });

  const toggleRestriction = (id: string) => {
    setForm((prev) => ({
      ...prev,
      restrictions: prev.restrictions.includes(id)
        ? prev.restrictions.filter((r) => r !== id)
        : [...prev.restrictions, id],
    }));
  };

  const toggleFacility = (id: string) => {
    setForm((prev) => {
      const exists = prev.nearby_facilities.find((f) => f.type === id);
      return {
        ...prev,
        nearby_facilities: exists
          ? prev.nearby_facilities.filter((f) => f.type !== id)
          : [...prev.nearby_facilities, { type: id, distance_km: "" }],
      };
    });
  };

  const updateFacilityDistance = (type: string, distance: string) => {
    setForm((prev) => ({
      ...prev,
      nearby_facilities: prev.nearby_facilities.map((f) =>
        f.type === type ? { ...f, distance_km: distance } : f
      ),
    }));
  };

  const canAdvance = () => {
    if (step === 0) return form.lat && form.lng;
    if (step === 1) return form.area_sqm;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.lat || !form.lng || !form.area_sqm) {
      toast({ title: "Missing fields", description: "Please fill in location and area.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("planner-analyze", {
        body: {
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng),
          area_sqm: parseFloat(form.area_sqm),
          land_price: form.land_price ? parseFloat(form.land_price) : null,
          shape: form.shape,
          max_floors: parseInt(form.max_floors),
          restrictions: form.restrictions,
          street_type: form.street_type,
          sun_blockage: form.sun_blockage,
          nearby_facilities: form.nearby_facilities
            .filter((f) => f.distance_km)
            .map((f) => ({ type: f.type, distance_km: parseFloat(f.distance_km) })),
          neighborhood_prices: form.neighborhood_prices,
          neighborhood_projects: form.neighborhood_projects,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Analysis complete", description: "Your feasibility report is ready." });
      navigate(`/developer/plan/${data.plan_id}`);
    } catch (err: any) {
      toast({
        title: "Analysis failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-gold p-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary-foreground/20">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-primary-foreground">AI Land Analyzer</h1>
          </div>
          <p className="text-sm text-primary-foreground/80 max-w-lg">
            Enter your land details and our AI will generate a comprehensive feasibility report with land use optimization, pricing analysis, and marketing strategy.
          </p>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isDone
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "bg-muted/30 text-muted-foreground cursor-default"
                }`}
              >
                <StepIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
        <Progress value={progressPct} className="h-1" />
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
      >
        {step === 0 && (
          <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10"><MapPin className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Location & Environment</h3>
                <p className="text-xs text-muted-foreground">Click on the map or enter coordinates</p>
              </div>
            </div>
            <Suspense fallback={<div className="h-[300px] rounded-xl bg-muted/30 animate-pulse" />}>
              <div className="rounded-xl overflow-hidden border border-border">
                <MapPicker
                  lat={parseFloat(form.lat) || 0}
                  lng={parseFloat(form.lng) || 0}
                  onLocationChange={(lat, lng) => setForm({ ...form, lat: lat.toFixed(6), lng: lng.toFixed(6) })}
                />
              </div>
            </Suspense>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat" className="text-xs">Latitude</Label>
                <Input id="lat" type="number" step="any" placeholder="36.1901" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng" className="text-xs">Longitude</Label>
                <Input id="lng" type="number" step="any" placeholder="44.0091" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5"><Navigation className="w-3 h-3" /> Street Type</Label>
                <Select value={form.street_type} onValueChange={(v) => setForm({ ...form, street_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Road / Highway</SelectItem>
                    <SelectItem value="secondary">Secondary Street</SelectItem>
                    <SelectItem value="alley">Alley / Narrow Street</SelectItem>
                    <SelectItem value="corner">Corner Lot (2+ streets)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5"><Sun className="w-3 h-3" /> Sun Blockage</Label>
                <Select value={form.sun_blockage} onValueChange={(v) => setForm({ ...form, sun_blockage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None — Open sky</SelectItem>
                    <SelectItem value="partial">Partial — One side</SelectItem>
                    <SelectItem value="significant">Significant — Multiple sides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10"><Ruler className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Land Specifications</h3>
                <p className="text-xs text-muted-foreground">Area, shape, and pricing information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area" className="text-xs">Area (m²) *</Label>
                <Input id="area" type="number" min="1" placeholder="2000" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Shape</Label>
                <Select value={form.shape} onValueChange={(v) => setForm({ ...form, shape: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="irregular">Irregular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="land_price" className="text-xs">Land Price ($)</Label>
                <Input id="land_price" type="number" min="0" placeholder="500,000" value={form.land_price} onChange={(e) => setForm({ ...form, land_price: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="floors" className="text-xs">Maximum Floors</Label>
              <div className="flex items-center gap-4">
                <Input id="floors" type="number" min="1" max="100" className="w-32" value={form.max_floors} onChange={(e) => setForm({ ...form, max_floors: e.target.value })} />
                <div className="flex gap-1.5">
                  {[3, 5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, max_floors: String(n) })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        form.max_floors === String(n) ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {n}F
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-destructive/10"><ShieldAlert className="w-5 h-5 text-destructive" /></div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Zoning Restrictions</h3>
                  <p className="text-xs text-muted-foreground">Select any applicable restrictions</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {RESTRICTION_OPTIONS.map((r) => {
                  const RIcon = r.icon;
                  const selected = form.restrictions.includes(r.id);
                  return (
                    <motion.label
                      key={r.id}
                      variants={fadeItem}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                        selected ? "border-destructive/50 bg-destructive/5 shadow-sm" : "border-border hover:border-muted"
                      }`}
                    >
                      <Checkbox checked={selected} onCheckedChange={() => toggleRestriction(r.id)} />
                      <RIcon className={`w-4 h-4 ${selected ? "text-destructive" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium text-foreground">{r.label}</span>
                    </motion.label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-success/10"><School className="w-5 h-5 text-success" /></div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Nearby Facilities</h3>
                  <p className="text-xs text-muted-foreground">Select facilities and enter distance in km</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FACILITY_OPTIONS.map((f) => {
                  const selected = form.nearby_facilities.find((nf) => nf.type === f.id);
                  return (
                    <motion.div
                      key={f.id}
                      variants={fadeItem}
                      className={`rounded-xl border p-3.5 transition-all ${
                        selected ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border hover:border-muted"
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox checked={!!selected} onCheckedChange={() => toggleFacility(f.id)} />
                        <span className="text-base">{f.icon}</span>
                        <span className="text-sm font-medium text-foreground">{f.label}</span>
                      </label>
                      {selected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2 ml-9"
                        >
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Distance (km)"
                            className="h-8 text-xs"
                            value={selected.distance_km}
                            onChange={(e) => updateFacilityDistance(f.id, e.target.value)}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-warning/10"><Landmark className="w-5 h-5 text-warning" /></div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Neighborhood Context</h3>
                <p className="text-xs text-muted-foreground">Help the AI understand the local market</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Neighboring Land / Property Prices</Label>
                <Textarea
                  placeholder="e.g. Adjacent lot sold for $300/m², apartments nearby sell for $1,200/m²…"
                  className="min-h-[80px] text-sm"
                  value={form.neighborhood_prices}
                  onChange={(e) => setForm({ ...form, neighborhood_prices: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Nearby Projects & Land Uses</Label>
                <Textarea
                  placeholder="e.g. 10-story residential tower under construction 200m away, new mall planned 1km north…"
                  className="min-h-[80px] text-sm"
                  value={form.neighborhood_projects}
                  onChange={(e) => setForm({ ...form, neighborhood_projects: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10"><Sparkles className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Review & Analyze</h3>
                <p className="text-xs text-muted-foreground">Verify your inputs before running the AI analysis</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Location", value: form.lat && form.lng ? `${parseFloat(form.lat).toFixed(4)}, ${parseFloat(form.lng).toFixed(4)}` : "Not set", icon: MapPin },
                { label: "Area", value: form.area_sqm ? `${Number(form.area_sqm).toLocaleString()} m²` : "Not set", icon: Ruler },
                { label: "Shape", value: form.shape, icon: Layers },
                { label: "Max Floors", value: form.max_floors, icon: Building2 },
                { label: "Street Type", value: form.street_type, icon: Navigation },
                { label: "Land Price", value: form.land_price ? `$${Number(form.land_price).toLocaleString()}` : "Not set", icon: DollarSign },
                { label: "Restrictions", value: form.restrictions.length ? form.restrictions.join(", ") : "None", icon: ShieldAlert },
                { label: "Facilities", value: form.nearby_facilities.length ? `${form.nearby_facilities.length} selected` : "None", icon: School },
              ].map((row) => {
                const RowIcon = row.icon;
                return (
                  <div key={row.label} className="flex items-start gap-3 rounded-xl bg-muted/20 border border-border/50 p-3">
                    <RowIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium text-foreground">{row.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-gradient-gold text-primary-foreground shadow-gold gap-2"
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with AI…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Run AI Analysis</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
