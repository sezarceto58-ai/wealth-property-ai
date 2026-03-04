import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Ruler, Building2, ShieldAlert, Sparkles, Loader2, DollarSign, School, TreePine, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MapPicker = lazy(() => import("@/components/MapPicker"));

const RESTRICTION_OPTIONS = [
  { id: "green_zone", label: "Green Zone" },
  { id: "height_limit", label: "Height Limit" },
  { id: "heritage_zone", label: "Heritage Zone" },
  { id: "flood_zone", label: "Flood Zone" },
  { id: "commercial_only", label: "Commercial Only" },
];

const FACILITY_OPTIONS = [
  { id: "hospital", label: "Hospital / Clinic" },
  { id: "school", label: "School / University" },
  { id: "main_road", label: "Main Road / Highway" },
  { id: "park", label: "Park / Garden" },
  { id: "mall", label: "Mall / Shopping Center" },
  { id: "mosque", label: "Mosque / Place of Worship" },
  { id: "gas_station", label: "Gas Station" },
  { id: "government", label: "Government Building" },
];

export default function LandInputForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Analyze Land</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your land details and let AI generate a full feasibility report.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Location
          </h3>
          <Suspense fallback={<div className="h-[300px] rounded-xl bg-muted animate-pulse" />}>
            <MapPicker
              lat={parseFloat(form.lat) || 0}
              lng={parseFloat(form.lng) || 0}
              onLocationChange={(lat, lng) => setForm({ ...form, lat: lat.toFixed(6), lng: lng.toFixed(6) })}
            />
          </Suspense>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" type="number" step="any" placeholder="25.2048" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" type="number" step="any" placeholder="55.2708" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Street Type</Label>
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
              <Label>Sun Blockage from Tall Buildings</Label>
              <Select value={form.sun_blockage} onValueChange={(v) => setForm({ ...form, sun_blockage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None — Open sky</SelectItem>
                  <SelectItem value="partial">Partial — One side blocked</SelectItem>
                  <SelectItem value="significant">Significant — Multiple sides</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Click on the map or enter coordinates manually.</p>
        </div>

        {/* Land Details & Price */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" /> Land Details
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area (m²)</Label>
              <Input id="area" type="number" min="1" placeholder="2000" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Shape</Label>
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
              <Label htmlFor="land_price">Land Price ($)</Label>
              <Input id="land_price" type="number" min="0" placeholder="500000" value={form.land_price} onChange={(e) => setForm({ ...form, land_price: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Building Constraints */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Building Constraints
          </h3>
          <div className="space-y-2">
            <Label htmlFor="floors">Maximum Floors</Label>
            <Input id="floors" type="number" min="1" max="100" value={form.max_floors} onChange={(e) => setForm({ ...form, max_floors: e.target.value })} />
          </div>
        </div>

        {/* Nearby Facilities */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <School className="w-4 h-4 text-primary" /> Nearby Facilities
          </h3>
          <p className="text-xs text-muted-foreground">Select nearby facilities and enter approximate distance in km.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FACILITY_OPTIONS.map((f) => {
              const selected = form.nearby_facilities.find((nf) => nf.type === f.id);
              return (
                <div key={f.id} className={`rounded-lg border p-3 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border"}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox checked={!!selected} onCheckedChange={() => toggleFacility(f.id)} />
                    <span className="text-sm font-medium text-foreground">{f.label}</span>
                  </label>
                  {selected && (
                    <div className="mt-2 ml-7">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Distance (km)"
                        className="h-8 text-xs"
                        value={selected.distance_km}
                        onChange={(e) => updateFacilityDistance(f.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Neighborhood Context */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" /> Neighborhood Context
          </h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Neighboring Land / Property Prices</Label>
              <Textarea
                placeholder="e.g. Adjacent lot sold for $300/m², apartments nearby sell for $1,200/m²…"
                className="min-h-[70px] text-sm"
                value={form.neighborhood_prices}
                onChange={(e) => setForm({ ...form, neighborhood_prices: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nearby Projects & Land Uses</Label>
              <Textarea
                placeholder="e.g. 10-story residential tower under construction 200m away, new mall planned 1km north…"
                className="min-h-[70px] text-sm"
                value={form.neighborhood_projects}
                onChange={(e) => setForm({ ...form, neighborhood_projects: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Restrictions */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive" /> Restrictions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {RESTRICTION_OPTIONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  form.restrictions.includes(r.id) ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <Checkbox checked={form.restrictions.includes(r.id)} onCheckedChange={() => toggleRestriction(r.id)} />
                <span className="text-sm font-medium text-foreground">{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground shadow-gold" disabled={loading} size="lg">
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing with AI…</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Run AI Feasibility Analysis</>
          )}
        </Button>
      </form>
    </div>
  );
}
