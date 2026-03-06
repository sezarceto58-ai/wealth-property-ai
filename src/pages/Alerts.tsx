import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, TrendingDown, Home, Star, Check, Trash2 } from "lucide-react";

interface Alert {
  id: string;
  type: "price_drop" | "new_match" | "offer_update" | "verification";
  title: string;
  description: string;
  propertyTitle?: string;
  propertyId?: string;
  time: string;
  read: boolean;
}

const mockAlerts: Alert[] = [
  { id: "A1", type: "price_drop", title: "Price Drop Alert", description: "Luxury Villa with Pool dropped from $340K to $320K — 5.9% decrease.", propertyTitle: "Luxury Villa with Pool", propertyId: "1", time: "2 hours ago", read: false },
  { id: "A2", type: "new_match", title: "New Match Found", description: "A new 3BR apartment in Mansour matches your search criteria.", propertyTitle: "Modern Apartment - City Center", propertyId: "2", time: "5 hours ago", read: false },
  { id: "A3", type: "offer_update", title: "Offer Accepted!", description: "Your offer on Penthouse - Panoramic Views has been accepted by the seller.", propertyTitle: "Penthouse - Panoramic Views", propertyId: "4", time: "1 day ago", read: false },
  { id: "A4", type: "verification", title: "Agent Verified", description: "Ahmed Al-Kurdi has been verified as a licensed agent.", time: "2 days ago", read: true },
  { id: "A5", type: "price_drop", title: "Price Drop Alert", description: "Commercial Tower Office reduced by $25K. Now at $450K.", propertyTitle: "Commercial Tower Office", propertyId: "3", time: "3 days ago", read: true },
  { id: "A6", type: "new_match", title: "New Listing", description: "New villa in Dream City, Erbil — $295K. Matches your saved search.", time: "4 days ago", read: true },
];

const typeIcons: Record<Alert["type"], typeof Bell> = {
  price_drop: TrendingDown,
  new_match: Home,
  offer_update: Star,
  verification: Check,
};

const typeColors: Record<Alert["type"], string> = {
  price_drop: "bg-destructive/10 text-destructive",
  new_match: "bg-primary/10 text-primary",
  offer_update: "bg-success/10 text-success",
  verification: "bg-info/10 text-info",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const navigate = useNavigate();

  const filtered = filter === "unread" ? alerts.filter((a) => !a.read) : alerts;
  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => setAlerts(alerts.map((a) => ({ ...a, read: true })));

  const markRead = (id: string) =>
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));

  const deleteAlert = (id: string) =>
    setAlerts(alerts.filter((a) => a.id !== id));

  const handleAlertClick = (alert: Alert) => {
    markRead(alert.id);
    if (alert.propertyId) {
      navigate(`/property/${alert.propertyId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Alerts & Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Price drops, new matches, and offer updates — Pro+ feature.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-xl p-1 w-fit">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {f} {f === "unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts to show.</p>
          </div>
        ) : (
          filtered.map((alert) => {
            const Icon = typeIcons[alert.type];
            return (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className={`rounded-xl border p-4 flex items-start gap-4 animate-fade-in transition-colors cursor-pointer hover:border-primary/30 ${
                  alert.read
                    ? "bg-card border-border"
                    : "bg-primary/[0.03] border-primary/20"
                }`}
              >
                <div className={`p-2 rounded-lg ${typeColors[alert.type]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse-gold" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  {alert.propertyTitle && (
                    <p className="text-xs text-primary mt-1 font-medium">→ {alert.propertyTitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">{alert.time}</p>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {!alert.read && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
