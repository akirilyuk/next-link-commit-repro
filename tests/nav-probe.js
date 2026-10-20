// Runs before any page script. Records history writes, the click, and when the
// destination page first appears in the DOM.
(() => {
  const t0 = performance.timeOrigin;
  const now = () => Math.round(performance.now());
  const probe = (window.__navProbe = { events: [] });
  const log = (type, extra) => probe.events.push({ t: now(), type, ...extra });

  for (const name of ["pushState", "replaceState"]) {
    const orig = history[name];
    history[name] = function (state, unused, url) {
      log(name, { url: url == null ? null : String(url) });
      return orig.apply(this, arguments);
    };
  }
  addEventListener("popstate", () => log("popstate"));
  addEventListener("error", (e) => log("error", { message: String(e.message) }));
  addEventListener("unhandledrejection", (e) => log("unhandledrejection", { reason: String(e.reason) }));
  document.addEventListener("click", (e) => log("click", { target: e.target?.getAttribute?.("data-testid") ?? null }), true);
  document.addEventListener("DOMContentLoaded", () => log("domcontentloaded"));
  addEventListener("load", () => log("load"));

  new MutationObserver(() => {
    if (!probe.committedAt && document.querySelector('[data-testid="item-page"]')) {
      probe.committedAt = now();
      log("destination-in-dom");
    }
  }).observe(document, { childList: true, subtree: true });

  // RSC request timings on the same clock as the events above.
  probe.rsc = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (!e.name.includes("_rsc=")) continue;
      const u = new URL(e.name);
      probe.rsc.push({ path: u.pathname, rsc: u.searchParams.get("_rsc"), start: Math.round(e.startTime), end: Math.round(e.responseEnd), bytes: e.encodedBodySize });
    }
  }).observe({ type: "resource", buffered: true });

  // React root lane state (App Router hydrates the document).
  probe.lanes = () => {
    const key = Object.keys(document).find((k) => k.startsWith("__reactContainer$"));
    const root = key && document[key] && document[key].stateNode;
    if (!root) return null;
    const pick = ["pendingLanes", "suspendedLanes", "pingedLanes", "warmLanes", "expiredLanes", "entangledLanes"];
    return Object.fromEntries(pick.filter((k) => k in root).map((k) => [k, root[k]]));
  };
  probe.t0 = t0;
})();
