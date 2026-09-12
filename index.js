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
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          root.classList.add("theme-fading");
          window.setTimeout(() => root.classList.remove("theme-fading"), 350);
        }
        apply();
        syncButtons();
      });
    });
    syncButtons();
  });
})();

// Homepage disclosure walkthrough: one finding plays end to end — found,
// contested, revised with a PoC, sustained, reported, patched by
// ZeroQuarryBot, approved by a person — then the case resets. Paced slowly
// so each step is readable; static without reduced motion.
(function () {
  const log = document.getElementById("zq-disclosure-log");
  const status = document.getElementById("zq-disclosure-status");
  if (!log || !status) return;
  const lines = Array.from(log.querySelectorAll(".fp-line"));
  if (!lines.length) return;
  const FINAL = "CONFIRMED · PR #482 OPEN";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    status.textContent = FINAL;
    return;
  }

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  async function run() {
    while (document.body.contains(log)) {
      lines.forEach((line) => line.classList.remove("fp-in"));
      status.textContent = "REVIEW IN PROGRESS";
      for (let i = 0; i < lines.length; i++) {
        await wait(i === 0 ? 900 : 1600);
        lines[i].classList.add("fp-in");
      }
      await wait(700);
      status.textContent = FINAL;
      await wait(6500);
    }
  }
  run();
})();

// Scroll-in reveal: mark known content blocks, stagger their children, and
// fade them up as they enter the viewport. Attributes are removed after the
// entrance so hover transitions behave normally afterwards.
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const plans = [
    [".buyer-hero-grid > div:first-child", ":scope > *", 90, 450],
    [".finding-panel, .product-frame, .hero-system, .motion-system", null, 0, 0],
    [".buyer-section-head, .section-head, .proof-copy", null, 0, 0],
    [".moment-grid, .capability-grid, .use-case-grid, .outcome-grid, .related-grid, .proof-receipt-grid", ":scope > *", 70, 420],
    [".operation-rail", ":scope > *", 60, 420],
    [".workflow-grid, .pricing-grid, .pricing-path-grid, .pricing-addon-grid, .run-metric-grid", ":scope > *", 70, 420],
    [".faq-list", ":scope > *", 70, 350],
    [".buyer-cta-panel", ":scope > *", 120, 240],
    [".trial-strip, .enterprise-strip", null, 0, 0],
    [".trust-strip .trust-inner", ":scope > *", 60, 300],
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el);
      el.classList.add("revealed");
      el.addEventListener("animationend", () => {
        el.classList.remove("revealed");
        el.removeAttribute("data-reveal");
      }, { once: true });
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

  plans.forEach(([containerSelector, childSelector, step, cap]) => {
    document.querySelectorAll(containerSelector).forEach((container) => {
      if (container.closest(".nav, .mobile-nav")) return;
      const targets = childSelector ? Array.from(container.querySelectorAll(childSelector)) : [container];
      targets.forEach((el, index) => {
        if (el.hasAttribute("data-reveal")) return;
        el.setAttribute("data-reveal", "");
        el.style.setProperty("--reveal-delay", Math.min(index * step, cap) + "ms");
        observer.observe(el);
      });
    });
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
