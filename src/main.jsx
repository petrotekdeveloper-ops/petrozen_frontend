import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

const GA_MEASUREMENT_ID = "G-GT82SV8FYJ";

function initAnalyticsWhenIdle() {
  const run = () => {
    import("react-ga4")
      .then((mod) => {
        mod.default.initialize(GA_MEASUREMENT_ID);
        window.__petrozenGaReady = true;
      })
      .catch(() => {
        window.__petrozenGaReady = false;
      });
  };

  if (typeof window === "undefined") return;
  const onFirstInteraction = () => {
    run();
    window.removeEventListener("pointerdown", onFirstInteraction);
    window.removeEventListener("keydown", onFirstInteraction);
    window.removeEventListener("touchstart", onFirstInteraction);
    window.removeEventListener("scroll", onFirstInteraction);
  };

  window.addEventListener("pointerdown", onFirstInteraction, { passive: true, once: true });
  window.addEventListener("keydown", onFirstInteraction, { once: true });
  window.addEventListener("touchstart", onFirstInteraction, { passive: true, once: true });
  window.addEventListener("scroll", onFirstInteraction, { passive: true, once: true });

  window.setTimeout(run, 9000);
}

initAnalyticsWhenIdle();

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}
