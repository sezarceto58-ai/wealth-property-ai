import { Bell, MessageSquare, BadgeDollarSign, Shield, Info } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const typeIcon: Record<string, React.ElementType> = {
  offer: BadgeDollarSign,
  message: MessageSquare,
  verification: Shield,
  info: Info,
};

export default function NotificationBell() {
  const { data: notifications = [], unreadCount, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead.mutate(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1 animate-pulse-gold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-[420px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 20).map((n) => {
              const Icon = typeIcon[n.type] || Info;
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${!n.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{n.body}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
