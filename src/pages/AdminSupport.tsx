import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Headphones, Search, ChevronRight, ArrowLeft, Send, Lock,
  UserCheck, Clock, CheckCircle2, AlertCircle, Inbox, Filter,
  BarChart3, TrendingUp, MessageSquare,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "@/components/StatsCard";
import {
  mockTickets, STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_LABELS,
  Ticket, TicketStatus, TicketPriority, TicketMessage,
} from "@/data/supportData";

// ── Helpers ──
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const AGENTS = ["Sarah (Support)", "Omar (Support)", "Zainab (Support)", "Unassigned"];

// ── Ticket Row ──
function TicketRow({ ticket, onClick, isSelected }: {
  ticket: Ticket; onClick: () => void; isSelected: boolean;
}) {
  const sc = STATUS_CONFIG[ticket.status];
  const pc = PRIORITY_CONFIG[ticket.priority];
  const hasUnreplied = ticket.messages[ticket.messages.length - 1]?.authorRole === "user";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 p-4 border-b border-border last:border-0 transition-colors ${
        isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-secondary/20"
      }`}
    >
      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-[11px] font-mono text-muted-foreground">{ticket.id}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pc.style}`}>{pc.icon} {pc.label}</span>
          {hasUnreplied && (
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-bold">
              Needs reply
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {ticket.userName} · {CATEGORY_LABELS[ticket.category]} · {timeAgo(ticket.updatedAt)}
        </p>
      </div>
      <div className="shrink-0">
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${sc.style}`}>{sc.label}</span>
      </div>
    </button>
  );
}

// ── Ticket Detail Panel ──
function TicketDetail({ ticket, onUpdate }: {
  ticket: Ticket;
  onUpdate: (updated: Ticket) => void;
}) {
  const { toast } = useToast();
  const [reply,      setReply]      = useState("");
  const [internalNote, setNote]     = useState("");
  const [showNote,   setShowNote]   = useState(false);
  const [status,     setStatus]     = useState<TicketStatus>(ticket.status);
  const [priority,   setPriority]   = useState<TicketPriority>(ticket.priority);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo ?? "Unassigned");

  const sc = STATUS_CONFIG[status];
  const pc = PRIORITY_CONFIG[priority];

  const saveProperty = (field: Partial<Ticket>) => {
    const updated = { ...ticket, ...field, updatedAt: new Date().toISOString() };
    onUpdate(updated);
    toast({ title: "Ticket updated." });
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    const msg: TicketMessage = {
      id: `m-${Date.now()}`, ticketId: ticket.id,
      authorName: "Support Team", authorRole: "support",
      body: reply, createdAt: new Date().toISOString(),
    };
    const updated = { ...ticket, messages: [...ticket.messages, msg], status: "waiting" as TicketStatus, updatedAt: new Date().toISOString() };
    onUpdate(updated);
    setReply("");
    toast({ title: "Reply sent to user." });
  };

  const handleNote = () => {
    if (!internalNote.trim()) return;
    const msg: TicketMessage = {
      id: `m-${Date.now()}`, ticketId: ticket.id,
      authorName: "Support Team", authorRole: "admin",
      body: internalNote, createdAt: new Date().toISOString(), isInternal: true,
    };
    const updated = { ...ticket, messages: [...ticket.messages, msg], updatedAt: new Date().toISOString() };
    onUpdate(updated);
    setNote("");
    setShowNote(false);
    toast({ title: "Internal note added." });
  };

  const selectClass = "w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="flex flex-col h-full">
      {/* Ticket header */}
      <div className="p-4 border-b border-border space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${sc.style}`}>{sc.label}</span>
          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${pc.style}`}>{pc.icon} {pc.label}</span>
        </div>
        <p className="font-semibold text-foreground">{ticket.subject}</p>
        <p className="text-xs text-muted-foreground">
          {ticket.userName} ({ticket.userEmail}) · {ticket.userRole} · {CATEGORY_LABELS[ticket.category]}
        </p>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wide">Status</label>
            <select
              value={status}
              onChange={e => {
                setStatus(e.target.value as TicketStatus);
                saveProperty({ status: e.target.value as TicketStatus });
              }}
              className={selectClass}
            >
              {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wide">Priority</label>
            <select
              value={priority}
              onChange={e => {
                setPriority(e.target.value as TicketPriority);
                saveProperty({ priority: e.target.value as TicketPriority });
              }}
              className={selectClass}
            >
              {(Object.keys(PRIORITY_CONFIG) as TicketPriority[]).map(p => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wide">Assigned</label>
            <select
              value={assignedTo}
              onChange={e => {
                setAssignedTo(e.target.value);
                saveProperty({ assignedTo: e.target.value === "Unassigned" ? undefined : e.target.value });
              }}
              className={selectClass}
            >
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Messages thread */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {ticket.messages.map(msg => {
          const isStaff = msg.authorRole === "support" || msg.authorRole === "admin";
          const isNote  = msg.isInternal;
          return (
            <div
              key={msg.id}
              className={`p-4 ${
                isNote    ? "bg-amber-50 dark:bg-amber-900/10 border-l-2 border-l-amber-400" :
                isStaff   ? "bg-primary/3" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isNote  ? "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200" :
                  isStaff ? "bg-primary text-white" :
                  "bg-secondary text-secondary-foreground"
                }`}>
                  {msg.authorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">{msg.authorName}</span>
                    {isNote && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Internal
                      </span>
                    )}
                    {isStaff && !isNote && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">Support</span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply / Note area */}
      {status !== "closed" && (
        <div className="p-4 border-t border-border space-y-3 bg-card">
          {/* Toggle */}
          <div className="flex gap-1 bg-secondary rounded-xl p-0.5 w-fit">
            <button
              onClick={() => setShowNote(false)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${!showNote ? "bg-primary text-white" : "text-secondary-foreground"}`}
            >
              Reply to User
            </button>
            <button
              onClick={() => setShowNote(true)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${showNote ? "bg-amber-500 text-white" : "text-secondary-foreground"}`}
            >
              <Lock className="w-3 h-3" /> Internal Note
            </button>
          </div>

          {!showNote ? (
            <>
              <Textarea
                placeholder="Write a reply to the user…"
                value={reply}
                onChange={e => setReply(e.target.value)}
                className="min-h-[72px] resize-none rounded-xl text-sm bg-background"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={!reply.trim()}
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
                <button
                  onClick={() => saveProperty({ status: "resolved" })}
                  className="px-4 py-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                </button>
              </div>
            </>
          ) : (
            <>
              <Textarea
                placeholder="Add an internal note (not visible to the user)…"
                value={internalNote}
                onChange={e => setNote(e.target.value)}
                className="min-h-[72px] resize-none rounded-xl text-sm bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
              />
              <button
                onClick={handleNote}
                disabled={!internalNote.trim()}
                className="w-full py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" /> Add Note
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Console ──
export default function AdminSupport() {
  const { t } = useTranslation();
  const [tickets,  setTickets]  = useState<Ticket[]>(mockTickets);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState<"all" | TicketStatus>("all");
  const [priorityF, setPriorityF] = useState<"all" | TicketPriority>("all");

  const onUpdate = (updated: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelected(updated);
  };

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusF   === "all" || t.status   === statusF;
    const matchPriority = priorityF === "all" || t.priority === priorityF;
    return matchSearch && matchStatus && matchPriority;
  });

  const total     = tickets.length;
  const openCount = tickets.filter(t => t.status === "open").length;
  const urgCount  = tickets.filter(t => t.priority === "urgent" || t.priority === "high").length;
  const unresolved = tickets.filter(t => t.messages[t.messages.length - 1]?.authorRole === "user").length;

  const pillBase = "px-3 py-1 rounded-lg text-xs font-medium transition-all";
  const pillActive = "bg-primary text-white";
  const pillInactive = "text-secondary-foreground hover:bg-secondary/60";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Headphones className="w-6 h-6 text-primary" /> Support Console
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all support tickets, respond to users, assign agents.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Tickets"    value={total}      icon={Inbox}        />
        <StatsCard title="Open"             value={openCount}  icon={AlertCircle}  change="Needs attention" trend={openCount > 3 ? "down" : "neutral"} />
        <StatsCard title="High / Urgent"    value={urgCount}   icon={TrendingUp}   change="Priority queue"  trend={urgCount > 2 ? "down" : "neutral"} />
        <StatsCard title="Awaiting Reply"   value={unresolved} icon={MessageSquare} />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: "600px" }}>
        {/* Left: ticket queue */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
          {/* Search & Filters */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Search tickets…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {(["all", "open", "in_progress", "waiting", "resolved"] as const).map(s => (
                <button key={s} onClick={() => setStatusF(s)} className={`${pillBase} ${statusF === s ? pillActive : pillInactive}`}>
                  {s === "all" ? "All" : STATUS_CONFIG[s]?.label ?? s}
                </button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              {(["all", "urgent", "high", "medium", "low"] as const).map(p => (
                <button key={p} onClick={() => setPriorityF(p)} className={`${pillBase} ${priorityF === p ? pillActive : pillInactive}`}>
                  {p === "all" ? "All Priority" : `${PRIORITY_CONFIG[p]?.icon} ${PRIORITY_CONFIG[p]?.label}`}
                </button>
              ))}
            </div>
          </div>

          {/* Queue */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-25" />
                <p className="text-sm">No tickets match filters.</p>
              </div>
            ) : (
              filtered.map(t => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onClick={() => setSelected(t)}
                  isSelected={selected?.id === t.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: detail */}
        <div className="lg:col-span-3 rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
          {selected ? (
            <TicketDetail ticket={selected} onUpdate={onUpdate} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-muted-foreground">
              <Headphones className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Select a ticket to view</p>
              <p className="text-xs mt-1 max-w-xs">
                Click any ticket in the queue to read the conversation and respond.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">Category Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                {[t("common.type","Category"), "Total", "Open", "Resolved", "Avg Response"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const cats = tickets.filter(t => t.category === key);
                if (!cats.length) return null;
                const open = cats.filter(t => t.status === "open" || t.status === "in_progress").length;
                const res  = cats.filter(t => t.status === "resolved" || t.status === "closed").length;
                return (
                  <tr key={key} className="border-b border-border last:border-0 hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium text-foreground">{label}</td>
                    <td className="px-4 py-3 text-foreground">{cats.length}</td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-medium">{open}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">{res}</td>
                    <td className="px-4 py-3 text-muted-foreground">~4h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
