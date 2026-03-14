import { useState } from "react";
import { Users, Phone, Mail, Plus, X, Loader2 } from "lucide-react";
import { useLeads, useUpdateLead, useCreateLead } from "@/hooks/useLeads";
import { useToast } from "@/hooks/use-toast";
import PlanGate from "@/components/PlanGate";

const stageColors: Record<string, string> = {
  new: "bg-info/10 text-info",
  contacted: "bg-primary/10 text-primary",
  qualified: "bg-success/10 text-success",
  closed: "bg-success/20 text-success",
  lost: "bg-destructive/10 text-destructive",
};

export default function AgentCRM() {
  const { toast } = useToast();
  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const createLead = useCreateLead();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "" });

  const advanceLead = (id: string) => {
    const stages = ["new", "contacted", "qualified", "closed"];
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const idx = stages.indexOf(lead.stage);
    if (idx < stages.length - 1) {
      const next = stages[idx + 1];
      updateLead.mutate({ id, stage: next });
      toast({ title: "Lead advanced", description: `Moved to ${next}` });
    }
  };

  const markLost = (id: string) => {
    updateLead.mutate({ id, stage: "lost" });
    toast({ title: "Lead marked as lost" });
  };

  const addContact = () => {
    if (!newContact.name) {
      toast({ title: "Missing name", variant: "destructive" });
      return;
    }
    createLead.mutate({ name: newContact.name, email: newContact.email, phone: newContact.phone, stage: "new", source: "Manual" });
    setNewContact({ name: "", email: "", phone: "" });
    setShowAddContact(false);
    toast({ title: "Lead added" });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <PlanGate requiredTier="pro" featureLabel="CRM & Lead Management">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your leads.</p>
        </div>
        <button onClick={() => setShowAddContact(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-primary-foreground text-sm font-semibold shadow-gold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {showAddContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAddContact(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-elevated p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-foreground">Add Lead</h2>
              <button onClick={() => setShowAddContact(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="Full Name *" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
              <input value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} placeholder="Email" type="email" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
              <input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={addContact} className="w-full py-2.5 rounded-xl bg-gradient-gold text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">Add Lead</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {(["new", "contacted", "qualified", "closed", "lost"] as const).map((stage) => {
          const count = leads.filter((l) => l.stage === stage).length;
          return (
            <div key={stage} className="rounded-xl bg-card border border-border p-4 text-center">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold capitalize ${stageColors[stage]}`}>{stage}</span>
              <p className="text-2xl font-bold text-foreground mt-2">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between animate-fade-in hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">{lead.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                <p className="text-xs text-muted-foreground">{lead.email || lead.phone || "No contact"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${stageColors[lead.stage] || ""}`}>{lead.stage}</span>
              <span className="text-xs text-muted-foreground">{lead.source}</span>
              {lead.stage !== "closed" && lead.stage !== "lost" && (
                <div className="flex gap-1">
                  <button onClick={() => advanceLead(lead.id)} className="px-2 py-1 rounded text-xs bg-success/10 text-success hover:bg-success/20 transition-colors">Advance</button>
                  <button onClick={() => markLost(lead.id)} className="px-2 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Lost</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No leads yet. Add your first lead above.</p>}
      </div>
    </div>
    </PlanGate>
  );
}