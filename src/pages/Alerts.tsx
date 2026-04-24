import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bell, TrendingDown, Home, Star, Check, Trash2, Lock, Zap } from "lucide-react";
import PlanGate from "@/components/PlanGate";

interface Alert {
  id: string;
  type: "price_drop" | "new_match" | "offer_update" | "verification";
  priority: boolean;
  titleKey: string;
  descKey: string;
  propertyTitle?: string;
  propertyId?: string;
  time: string;
  read: boolean;
}

const mockAlerts: Alert[] = [
  { id: "A1", type: "price_drop", priority: false, titleKey: "alerts.mock.priceDrop", descKey: "alerts.mock.priceDropDesc", propertyTitle: "Luxury Villa with Pool", propertyId: "1", time: "2h", read: false },
  { id: "A2", type: "new_match", priority: false, titleKey: "alerts.mock.newMatch", descKey: "alerts.mock.newMatchDesc", propertyTitle: "Modern Apartment - City Center", propertyId: "2", time: "5h", read: false },
  { id: "A3", type: "offer_update", priority: true, titleKey: "alerts.mock.offerAccepted", descKey: "alerts.mock.offerAcceptedDesc", propertyTitle: "Penthouse - Panoramic Views", propertyId: "4", time: "1d", read: false },
  { id: "A4", type: "verification", priority: true, titleKey: "alerts.mock.agentVerified", descKey: "alerts.mock.agentVerifiedDesc", time: "2d", read: true },
  { id: "A5", type: "price_drop", priority: false, titleKey: "alerts.mock.priceDrop", descKey: "alerts.mock.priceDropDesc2", propertyTitle: "Commercial Tower Office", propertyId: "3", time: "3d", read: true },
  { id: "A6", type: "new_match", priority: true, titleKey: "alerts.mock.hotListing", descKey: "alerts.mock.hotListingDesc", time: "4d", read: true },
];

const typeIcons: Record<Alert["type"], typeof Bell> = {
  price_drop: TrendingDown, new_match: Home, offer_update: Star, verification: Check,
};
const typeColors: Record<Alert["type"], string> = {
  price_drop: "bg-destructive/10 text-destructive", new_match: "bg-primary/10 text-primary",
  offer_update: "bg-success/10 text-success", verification: "bg-warning/10 text-warning",
};

function AlertItem({ alert, onDismiss }: { alert: Alert; onDismiss: (id: string) => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = typeIcons[alert.type];
  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3 transition-all ${alert.read ? "bg-card border-border opacity-70" : "bg-card border-primary/20 shadow-sm"}`}>
      <div className={`p-2.5 rounded-xl shrink-0 ${typeColors[alert.type]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{t(alert.titleKey, alert.titleKey)}</p>
          {alert.priority && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> Pro
            </span>
          )}
          {!alert.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(alert.descKey, alert.descKey)}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {alert.propertyId && (
          <button onClick={() => navigate(`/property/${alert.propertyId}`)} className="text-xs text-primary hover:underline font-medium">{t("alerts.view")}</button>
        )}
        <button onClick={() => onDismiss(alert.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Alerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState(mockAlerts);
  const unread = alerts.filter((a) => !a.read).length;
  const basicAlerts = alerts.filter((a) => !a.priority);
  const priorityAlerts = alerts.filter((a) => a.priority);

  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));
  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> {t("alerts.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("alerts.unreadCount", { count: unread })} · {t("alerts.totalCount", { total: alerts.length })}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium">
            {t("common.markAllRead")}
          </button>
        )}
      </div>

      {basicAlerts.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("alerts.standard")}</p>
          {basicAlerts.map((a) => <AlertItem key={a.id} alert={a} onDismiss={dismiss} />)}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("alerts.priority")}</p>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" /> Pro
          </span>
        </div>
        <PlanGate requiredTier="pro" featureLabel={t("alerts.priority")}>
          <div className="space-y-3">
            {priorityAlerts.map((a) => <AlertItem key={a.id} alert={a} onDismiss={dismiss} />)}
          </div>
        </PlanGate>
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-card border border-border">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">{t("alerts.noAlerts")}</p>
          <p className="text-sm text-muted-foreground/60 mt-1">{t("alerts.noAlertsDesc")}</p>
        </div>
      )}
    </div>
  );
}
