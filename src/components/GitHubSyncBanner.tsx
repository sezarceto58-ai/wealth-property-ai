import { useEffect, useState } from "react";
import { Github, CheckCircle2, XCircle, X, RefreshCw } from "lucide-react";

const STORAGE_KEY_CONNECTED = "gh_sync_connected";
const STORAGE_KEY_LAST_SYNC = "gh_sync_last_synced_at";
const STORAGE_KEY_DISMISSED = "gh_sync_banner_dismissed";

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function GitHubSyncBanner() {
  const [connected, setConnected] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY_CONNECTED) === "true"
  );
  const [lastSynced, setLastSynced] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY_LAST_SYNC)
  );
  const [dismissed, setDismissed] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY_DISMISSED) === "true"
  );
  const [, setTick] = useState(0);

  // Mark a sync timestamp on every fresh app load (Lovable auto-syncs on load).
  useEffect(() => {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
    setLastSynced(now);
  }, []);

  // Re-render every 30s so "X minutes ago" stays fresh.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const toggleConnected = () => {
    const next = !connected;
    setConnected(next);
    localStorage.setItem(STORAGE_KEY_CONNECTED, String(next));
  };

  const refresh = () => {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
    setLastSynced(now);
  };

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY_DISMISSED, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/30 text-sm">
      <Github className="w-4 h-4 text-muted-foreground shrink-0" />
      {connected ? (
        <span className="flex items-center gap-1.5 text-foreground">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          GitHub connected
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <XCircle className="w-4 h-4" />
          GitHub not connected
        </span>
      )}
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">
        Last synced: <span className="text-foreground">{formatRelative(lastSynced)}</span>
      </span>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={refresh}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Mark as just synced"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
        <button
          onClick={toggleConnected}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {connected ? "Mark disconnected" : "Mark connected"}
        </button>
        <button
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
