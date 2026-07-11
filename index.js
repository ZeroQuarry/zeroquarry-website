// Illustrative adversarial review shown on the marketing homepage.
(function () {
  const body = document.getElementById("zq-debate-body");
  const verdict = document.getElementById("zq-debate-verdict");
  if (!body || !verdict) return;

  const entries = [
    { who: "sys", name: "SYSTEM", time: "14:02:01", text: "review opened · target: <span class=\"k\">billing-api/invoices</span>" },
    { who: "red", name: "RED", time: "14:02:04", text: "tracing tenant ownership into the invoice update path" },
    { who: "red", name: "RED", time: "14:02:07", text: "request body <span class=\"k\">invoice_id</span> reaches <span class=\"f\">invoices.update()</span>" },
    { who: "blue", name: "VENDOR", time: "14:02:10", text: "challenge: an earlier middleware check may enforce account ownership" },
    { who: "red", name: "RED", time: "14:02:14", text: "middleware verifies session role; controller query has <span class=\"f\">no account filter</span>" },
    { who: "red", name: "RED", time: "14:02:18", text: "cross-tenant invoice update returns <span class=\"g\">200 OK</span> in the authorized test environment" },
    { who: "blue", name: "VENDOR", time: "14:02:21", text: "reproduced. claim sustained with high confidence" },
    { who: "blue", name: "VENDOR", time: "14:02:23", text: "patch path: scope invoice lookup by <span class=\"k\">account_id</span> before update" },
    { who: "good", name: "VERDICT", time: "14:02:26", text: "<span class=\"g\">CONFIRMED</span> · owner assigned · patch proposal ready" },
  ];

  function line(entry, instant) {
    const row = document.createElement("div");
    row.className = `line ${entry.who}${instant ? "" : " console-enter"}`;
    row.innerHTML = `<div class="ts">${entry.time}</div><div class="agent">${entry.name}</div><div class="msg">${entry.text}</div>`;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    body.innerHTML = "";
    entries.forEach((entry) => line(entry, true));
    verdict.innerHTML = '<span class="verdict-good">VERDICT: CONFIRMED</span>';
    return;
  }

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  async function run() {
    while (document.body.contains(body)) {
      body.innerHTML = "";
      verdict.textContent = "review in progress";
      for (const entry of entries) {
        line(entry, false);
        if (entry.who === "good") {
          verdict.innerHTML = '<span class="verdict-good">VERDICT: CONFIRMED</span>';
        }
        await wait(entry.who === "good" ? 1200 : 720);
      }
      await wait(4200);
    }
  }

  run();
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
