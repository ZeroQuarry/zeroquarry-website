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
  const FINAL = "MERGED · RETESTED · EVIDENCE PACKED";
  // The first KEEP steps ship with .fp-in in the markup, so the panel shows
  // substance at first paint (and without JavaScript). The remaining steps play
  // in once, then the panel rests on the finished case instead of looping.
  const KEEP = 5;
  const CYCLES = 1;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    lines.forEach((line) => line.classList.add("fp-in"));
    status.textContent = FINAL;
    return;
  }

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  async function run() {
    for (let cycle = 0; cycle < CYCLES; cycle++) {
      if (cycle > 0) {
        lines.forEach((line, i) => { if (i >= KEEP) line.classList.remove("fp-in"); });
        log.scrollTop = 0;
        status.textContent = "REVIEW IN PROGRESS";
        await wait(1200);
      }
      for (let i = KEEP; i < lines.length; i++) {
        await wait(2200);
        const line = lines[i];
        line.classList.add("fp-in");
        // scroll only once the log actually overflows, and only far enough
        // to bring the newest step above the fade strip
        const lr = log.getBoundingClientRect();
        const rr = line.getBoundingClientRect();
        const overflow = rr.bottom - (lr.top + log.clientHeight - 34);
        if (overflow > 0) {
          log.scrollTo({ top: log.scrollTop + overflow, behavior: "smooth" });
        }
      }
      await wait(1400);
      status.textContent = FINAL;
      await wait(2000);
    }
    lines.forEach((line) => line.classList.add("fp-in"));
    status.textContent = FINAL;
  }
  run();
})();

// Scroll-in reveal: mark known content blocks, stagger their children, and
// fade them up as they enter the viewport. Attributes are removed after the
// entrance so hover transitions behave normally afterwards.
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Motion budget: entrance choreography lives in the hero only. Body content
  // renders visible and static so the page settles instead of fading forever.
  const plans = [
    [".buyer-hero-grid > div:first-child", ":scope > *", 90, 450],
    [".finding-panel", null, 0, 0],
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

  // Insurance: if the observer is slow or blocked, drop the hidden state
  // entirely after a few seconds so content can never stay invisible.
  window.setTimeout(() => {
    root.classList.add("reveal-timeout");
    observer.disconnect();
  }, 4000);

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

// Evidence page documents fan in once when scrolled into view, then rest.
// Without JS or with reduced motion the fanned stack is the default state.
(function () {
  const stack = document.querySelector(".mv-docs");
  if (!stack || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const play = () => {
    window.clearTimeout(fallback);
    observer.disconnect();
    stack.classList.add("play");
  };
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) play();
  }, { threshold: 0.35 });
  observer.observe(stack);
  // Never leave the reports hidden if the scroll observer is slow or blocked.
  const fallback = window.setTimeout(play, 4000);
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
