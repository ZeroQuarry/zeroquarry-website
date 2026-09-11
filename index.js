// Light/dark theme: follow the OS setting until the visitor chooses, then
// remember the choice. The inline <head> script sets the initial attribute
// before first paint to avoid a flash; this module keeps it in sync.
(function () {
  const KEY = "zq-theme";
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: light)");

  const stored = () => {
    // ?theme=light|dark is a per-session QA override, same precedence as the head script.
    const q = new URLSearchParams(location.search).get("theme");
    if (q === "light" || q === "dark") return q;
    try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : null; }
    catch (err) { return null; }
  };
  const current = () => stored() || (media.matches ? "light" : "dark");

  const apply = () => { root.dataset.theme = current(); };

  const syncButtons = () => {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.dataset.mode = current();
      btn.setAttribute("aria-label", current() === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  };

  apply();
  media.addEventListener("change", () => { if (!stored()) apply(); syncButtons(); });
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = current() === "dark" ? "light" : "dark";
        try { localStorage.setItem(KEY, next); } catch (err) { /* private mode */ }
        apply();
        syncButtons();
      });
    });
    syncButtons();
  });
})();

// Desktop navigation flyouts open on hover and close when the pointer leaves.
// Touch and keyboard users keep the native <details> interaction.
(function () {
  const clusters = Array.from(document.querySelectorAll(".nav-cluster"));
  if (!clusters.length) return;

  const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const closeOthers = (active) => {
    clusters.forEach((cluster) => {
      if (cluster !== active) cluster.removeAttribute("open");
    });
  };

  clusters.forEach((cluster) => {
    const summary = cluster.querySelector(":scope > summary");
    let closeTimer = 0;
    const cancelClose = () => window.clearTimeout(closeTimer);
    const open = () => {
      if (!desktopPointer.matches) return;
      cancelClose();
      closeOthers(cluster);
      cluster.setAttribute("open", "");
    };
    const close = () => {
      if (!desktopPointer.matches) return;
      cancelClose();
      closeTimer = window.setTimeout(() => {
        if (!cluster.matches(":hover") && !cluster.contains(document.activeElement)) {
          cluster.removeAttribute("open");
        }
      }, 90);
    };

    cluster.addEventListener("mouseenter", open);
    cluster.addEventListener("mouseleave", close);
    cluster.addEventListener("focusin", open);
    cluster.addEventListener("focusout", close);
    cluster.addEventListener("toggle", () => {
      if (cluster.open) closeOthers(cluster);
    });
    summary.addEventListener("click", (event) => {
      if (!desktopPointer.matches) return;
      event.preventDefault();
      open();
      summary.blur();
    });
    summary.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      cluster.removeAttribute("open");
      summary.focus();
    });
  });

  const resetFlyouts = () => clusters.forEach((cluster) => cluster.removeAttribute("open"));
  if (desktopPointer.addEventListener) desktopPointer.addEventListener("change", resetFlyouts);
})();
