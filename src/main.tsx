import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(<App />);

// ── Register Service Worker (PWA) ──
const hostname = window.location.hostname;
const isPreviewHost =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.endsWith(".lovable.app") ||
  hostname.endsWith(".lovableproject.com");

const unregisterServiceWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (isPreviewHost || !import.meta.env.PROD) {
      unregisterServiceWorkers().catch((err) =>
        console.warn("[TerraVista] SW unregister failed:", err),
      );
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[TerraVista] SW registered:", registration.scope);

        setInterval(() => registration.update(), 60_000);

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[TerraVista] New version available. Refresh to update.");
            }
          });
        });
      })
      .catch((err) => console.warn("[TerraVista] SW registration failed:", err));
  });
}

// ── Install prompt (Add to Home Screen) ──
let deferredInstallPrompt: any = null;
window.addEventListener("beforeinstallprompt", (e) => {
  if (isPreviewHost) return;

  e.preventDefault();
  deferredInstallPrompt = e;
  (window as any).__tvInstallPrompt = deferredInstallPrompt;
});
