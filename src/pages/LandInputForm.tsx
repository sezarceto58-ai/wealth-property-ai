import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Ruler, Building2, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const RESTRICTION_OPTIONS = [
  { id: "green_zone", label: "Green Zone" },
  { id: "height_limit", label: "Height Limit" },
  { id: "heritage_zone", label: "Heritage Zone" },
  { id: "flood_zone", label: "Flood Zone" },
  { id: "commercial_only", label: "Commercial Only" },
];

export default function LandInputForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    lat: "",
    lng: "",
    area_sqm: "",
    shape: "rectangle",
    max_floors: "10",
    restrictions: [] as string[],
  });

  const toggleRestriction = (id: string) => {
    setForm((prev) => ({
      ...prev,
      restrictions: prev.restrictions.includes(id)
        ? prev.restrictions.filter((r) => r !== id)
        : [...prev.restrictions, id],
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
          shape: form.shape,
          max_floors: parseInt(form.max_floors),
          restrictions: form.restrictions,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                placeholder="25.2048"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                placeholder="55.2708"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Right-click on Google Maps and copy coordinates.
          </p>
        </div>

        {/* Land Details */}
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" /> Land Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area (m²)</Label>
              <Input
                id="area"
                type="number"
                min="1"
                placeholder="2000"
                value={form.area_sqm}
                onChange={(e) => setForm({ ...form, area_sqm: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Shape</Label>
              <Select value={form.shape} onValueChange={(v) => setForm({ ...form, shape: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                </SelectContent>
              </Select>
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
            <Input
              id="floors"
              type="number"
              min="1"
              max="100"
              value={form.max_floors}
              onChange={(e) => setForm({ ...form, max_floors: e.target.value })}
            />
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
                <Checkbox
                  checked={form.restrictions.includes(r.id)}
                  onCheckedChange={() => toggleRestriction(r.id)}
                />
                <span className="text-sm font-medium text-foreground">{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground shadow-gold" disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing with AI…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Run AI Feasibility Analysis
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
