import { Link } from "react-router-dom";
import {
  Building2, Plus, Eye, Users, BadgeDollarSign, Edit, Trash2,
  MapPin, BadgeCheck, Loader2 } from
"lucide-react";
import TerraScore from "@/components/TerraScore";
import { useMyProperties, useDeleteProperty, useUpdateProperty } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import property1 from "@/assets/property-1.jpg";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  sold: "bg-secondary text-muted-foreground"
};

export default function SellerListings() {
  const { toast } = useToast();
  const [view, setView] = useState<"grid" | "list">("list");
  const { data: listings = [], isLoading } = useMyProperties();
  const deleteMut = useDeleteProperty();
  const updateMut = useUpdateProperty();

  const deleteListing = (id: string) => {
    deleteMut.mutate(id);
    toast({ title: "Listing deleted" });
  };

  const toggleStatus = (id: string) => {
    const p = listings.find((l) => l.id === id);
    if (!p) return;
    const next = p.status === "active" ? "pending" : p.status === "pending" ? "sold" : "active";
    updateMut.mutate({ id, status: next });
    toast({ title: "Status updated" });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> My Listings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{listings.filter((l) => l.status === "active").length} active listings</p>
        </div>
        <Link to="/seller/create" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-primary-foreground text-sm font-semibold shadow-gold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      <div className="flex gap-1 rounded-xl p-1 w-fit bg-primary">
        {(["list", "grid"] as const).map((v) =>
        <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{v}</button>
        )}
      </div>

      {listings.length === 0 ?
      <div className="text-center py-20 rounded-xl bg-card border border-border">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No listings yet.</p>
          <Link to="/seller/create" className="text-primary text-sm mt-2 inline-block hover:underline">Create your first listing</Link>
        </div> :
      view === "list" ?
      <div className="space-y-3">
          {listings.map((property) =>
        <div key={property.id} className="rounded-xl bg-card border border-border p-4 animate-fade-in hover:border-primary/20 transition-colors">
              <div className="flex gap-4">
                <img src={property.property_images?.[0]?.url || property1} alt={property.title} className="w-28 h-20 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{property.title}</h3>
                        {property.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" /> {property.district}, {property.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(property.id)} className={`px-2 py-0.5 rounded text-xs font-medium capitalize cursor-pointer hover:opacity-80 ${statusColors[property.status] || ""}`}>{property.status}</button>
                      <TerraScore score={property.terra_score} size="sm" showLabel={false} />
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-3">
                    <p className="text-lg font-bold text-foreground">${property.price.toLocaleString()}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {property.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link to="/seller/create" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors" title="Edit"><Edit className="w-4 h-4" /></Link>
                  <button onClick={() => deleteListing(property.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
        )}
        </div> :

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((property) =>
        <div key={property.id} className="rounded-xl bg-card border border-border overflow-hidden animate-fade-in hover:border-primary/20 transition-colors">
              <img src={property.property_images?.[0]?.url || property1} alt={property.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-sm truncate">{property.title}</h3>
                  <button onClick={() => toggleStatus(property.id)} className={`px-2 py-0.5 rounded text-xs font-medium capitalize cursor-pointer ${statusColors[property.status] || ""}`}>{property.status}</button>
                </div>
                <p className="text-lg font-bold text-foreground">${property.price.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.city}</p>
                <div className="flex gap-2 mt-3">
                  <Link to="/seller/create" className="flex-1 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium text-center hover:bg-secondary/80">Edit</Link>
                  <button onClick={() => deleteListing(property.id)} className="flex-1 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20">Delete</button>
                </div>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

}