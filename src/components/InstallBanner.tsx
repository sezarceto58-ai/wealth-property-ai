/**
 * InstallBanner — shows an "Add to Home Screen" prompt when the browser
 * fires beforeinstallprompt. Dismissible and remembered in sessionStorage.
 */
import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [prompt, setPrompt] = useState<any>(null);

  useEffect(() => {
    // Already dismissed this session
    if (sessionStorage.getItem("tv_install_dismissed")) return;
    // Already running as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const check = () => {
      const p = (window as any).__tvInstallPrompt;
      if (p) { setPrompt(p); setShow(true); }
    };

    check();
    // Poll for the prompt (set in main.tsx)
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("tv_install_dismissed", "1");
  };

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-40 animate-slide-up">
      <div className="rounded-2xl bg-card border border-border shadow-elevated p-4 flex items-center gap-3 max-w-sm mx-auto">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Install AqarAI</p>
          <p className="text-xs text-muted-foreground">Add to home screen for the best experience.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Install
          </button>
          <button onClick={dismiss} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
