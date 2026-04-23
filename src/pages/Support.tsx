import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LifeBuoy, Plus, Send, ChevronRight, ArrowLeft,
  Clock, CheckCircle2, MessageSquare, AlertCircle, X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  mockTickets, STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_LABELS,
  Ticket, TicketCategory, TicketPriority, TicketMessage,
} from "@/data/supportData";

// ── Time helper ──
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// ── New Ticket Form ──
function NewTicketForm({ onSubmit, onCancel }: {
  onSubmit: (t: Ticket) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [subject,     setSubject]     = useState("");
  const [category,    setCategory]    = useState<TicketCategory>("technical");
  const [priority,    setPriority]    = useState<TicketPriority>("medium");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) {
      toast({ title: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: `TKT-${String(Math.floor(Math.random() * 900) + 100)}`,
      subject, category, priority,
      status: "open",
      userId: "current-user",
      userName: "You",
      userEmail: "you@example.com",
      userRole: "buyer",
      createdAt: now,
      updatedAt: now,
      messages: [{
        id: `m-${Date.now()}`, ticketId: "", authorName: "You", authorRole: "user",
        body: description, createdAt: now,
      }],
    };
    onSubmit(newTicket);
    toast({ title: `Ticket ${newTicket.id} submitted`, description: "We'll respond within 24 hours." });
  };

  const fieldClass = "w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground";

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> New Support Ticket
        </h2>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Subject */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">Subject *</label>
          <input
            className={fieldClass}
            placeholder="Brief description of your issue"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as TicketCategory)}
              className={fieldClass}
            >
              {(Object.entries(CATEGORY_LABELS) as [TicketCategory, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TicketPriority)}
              className={fieldClass}
            >
              {(Object.keys(PRIORITY_CONFIG) as TicketPriority[]).map(p => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">Description *</label>
          <Textarea
            placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or screenshots if possible."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="min-h-[120px] resize-none rounded-xl"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" /> Submit Ticket
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-secondary/40 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Ticket Thread View ──
function TicketThread({ ticket, onClose, onReply }: {
  ticket: Ticket;
  onClose: () => void;
  onReply: (ticketId: string, body: string) => void;
}) {
  const [reply, setReply] = useState("");
  const { toast } = useToast();
  const sc = STATUS_CONFIG[ticket.status];
  const pc = PRIORITY_CONFIG[ticket.priority];

  const handleReply = () => {
    if (!reply.trim()) return;
    onReply(ticket.id, reply);
    setReply("");
    toast({ title: "Reply sent." });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onClose}
          className="mt-0.5 p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${sc.style}`}>{sc.label}</span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${pc.style}`}>{pc.icon} {pc.label}</span>
          </div>
          <h2 className="font-semibold text-foreground">{ticket.subject}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {CATEGORY_LABELS[ticket.category]} · Opened {timeAgo(ticket.createdAt)}
            {ticket.assignedTo && ` · Assigned to ${ticket.assignedTo}`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {ticket.messages.map(msg => {
            const isSupport = msg.authorRole === "support" || msg.authorRole === "admin";
            return (
              <div key={msg.id} className={`p-4 ${isSupport ? "bg-primary/3" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isSupport
                      ? "bg-primary text-white"
                      : "bg-secondary text-secondary-foreground"
                  }`}>
                    {msg.authorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-foreground">{msg.authorName}</span>
                      {isSupport && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">Support</span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">{timeAgo(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply box */}
        {ticket.status !== "closed" && ticket.status !== "resolved" && (
          <div className="p-4 border-t border-border bg-secondary/20">
            <Textarea
              placeholder="Write a reply…"
              value={reply}
              onChange={e => setReply(e.target.value)}
              className="min-h-[80px] resize-none rounded-xl bg-background"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleReply}
                disabled={!reply.trim()}
                className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Send Reply
              </button>
            </div>
          </div>
        )}
        {(ticket.status === "resolved" || ticket.status === "closed") && (
          <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-emerald-500" />
            This ticket is {ticket.status}. Open a new ticket if you need further help.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ticket Row ──
function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const sc = STATUS_CONFIG[ticket.status];
  const pc = PRIORITY_CONFIG[ticket.priority];
  const unread = ticket.messages.length > 1 && ticket.status !== "resolved" && ticket.status !== "closed";

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors border-b border-border last:border-0"
    >
      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${pc.style}`}>{pc.icon} {pc.label}</span>
          {unread && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">New reply</span>}
        </div>
        <p className="text-sm font-medium text-foreground mt-0.5 truncate">{ticket.subject}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {CATEGORY_LABELS[ticket.category]} · {timeAgo(ticket.updatedAt)}
          {ticket.messages.length > 1 && ` · ${ticket.messages.length} messages`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.style}`}>{sc.label}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
}

// ── FAQ Items ──
const FAQ = [
  { q: "How long does seller verification take?", a: "Verification typically takes 2–3 business days once all documents are submitted. You'll receive an email when the review is complete." },
  { q: "Why was my offer rejected?", a: "Offers may be rejected if payment proof is unclear, the offered amount is too low, or the seller has accepted another offer. Check your offer status page for details." },
  { q: "How do I upgrade my subscription?", a: "Go to Settings → Subscription or visit the Pricing page. Changes take effect immediately after payment." },
  { q: "Can I list properties in multiple cities?", a: "Yes — you can create separate listings for each property. Each listing is tied to its own location." },
];

// ── Main Page ──
export default function Support() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>(
    mockTickets.filter(t => t.userId === "u2" || t.userId === "u3" || t.userId === "u5")
  );
  const [view,        setView]        = useState<"list" | "new" | "thread">("list");
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "resolved">("all");

  const openTicket = (t: Ticket) => { setActiveTicket(t); setView("thread"); };

  const handleNewTicket = (t: Ticket) => {
    setTickets(prev => [t, ...prev]);
    setView("list");
  };

  const handleReply = (ticketId: string, body: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const msg: TicketMessage = {
        id: `m-${Date.now()}`, ticketId, authorName: "You", authorRole: "user",
        body, createdAt: new Date().toISOString(),
      };
      return { ...t, messages: [...t.messages, msg], updatedAt: new Date().toISOString() };
    }));
    if (activeTicket?.id === ticketId) {
      setActiveTicket(prev => {
        if (!prev) return prev;
        const msg: TicketMessage = {
          id: `m-${Date.now()}`, ticketId, authorName: "You", authorRole: "user",
          body, createdAt: new Date().toISOString(),
        };
        return { ...prev, messages: [...prev.messages, msg] };
      });
    }
  };

  const filtered = tickets.filter(t => {
    if (filterStatus === "open")     return t.status === "open" || t.status === "in_progress" || t.status === "waiting";
    if (filterStatus === "resolved") return t.status === "resolved" || t.status === "closed";
    return true;
  });

  const openCount     = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-primary" /> Support Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get help, track your tickets, and read our FAQ.
          </p>
        </div>
        {view === "list" && (
          <button
            onClick={() => setView("new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        )}
      </div>

      {/* New Ticket Form */}
      {view === "new" && (
        <NewTicketForm onSubmit={handleNewTicket} onCancel={() => setView("list")} />
      )}

      {/* Thread View */}
      {view === "thread" && activeTicket && (
        <TicketThread
          ticket={activeTicket}
          onClose={() => setView("list")}
          onReply={handleReply}
        />
      )}

      {/* Ticket List */}
      {view === "list" && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Tickets",  value: tickets.length,  icon: MessageSquare, color: "text-primary" },
              { label: "Open",           value: openCount,       icon: AlertCircle,   color: "text-amber-600 dark:text-amber-400" },
              { label: "Resolved",       value: resolvedCount,   icon: CheckCircle2,  color: "text-emerald-600 dark:text-emerald-400" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${s.color}`} />
                  <div>
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
            {(["all", "open", "resolved"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === f ? "bg-primary text-white" : "text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                {f === "all" ? "All Tickets" : f === "open" ? "Open" : "Resolved"}
              </button>
            ))}
          </div>

          {/* Tickets */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-14 text-center text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-25" />
                <p className="font-medium">No tickets found.</p>
                <p className="text-xs mt-1">Submit a new ticket if you need help.</p>
              </div>
            ) : (
              filtered.map(t => <TicketRow key={t.id} ticket={t} onClick={() => openTicket(t)} />)
            )}
          </div>

          {/* FAQ */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-border">
              {FAQ.map((item, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-secondary/20 transition-colors">
                    <span className="text-sm font-medium text-foreground">{item.q}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 ml-3" />
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-foreground">Need urgent help?</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Email us at <span className="text-primary font-medium">support@aqarai.iq</span> or call{" "}
                <span className="text-primary font-medium">+964 750 000 0000</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Support online</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
