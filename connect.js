// /connect — harness picker, OS detection, copy buttons, deep-link probe.
// Progressive enhancement only: with JS off, every panel stays visible.
(function () {
  var picker = document.getElementById("connect-picker");
  if (!picker) return;

  var chips = Array.prototype.slice.call(picker.querySelectorAll(".connect-chip"));
  var panels = Array.prototype.slice.call(picker.querySelectorAll(".connect-panel"));
  var chipsBox = picker.querySelector(".connect-chips");

  function detectOS() {
    var s = "";
    try { s = ((navigator.userAgentData && navigator.userAgentData.platform) || "") + " " + (navigator.userAgent || ""); } catch (e) {}
    s = s.toLowerCase();
    if (/win/.test(s)) return "win";
    if (/mac|iphone|ipad|ipod|darwin/.test(s)) return "mac";
    if (/android|linux|cros|x11/.test(s)) return "linux";
    return "";
  }

  // Generic always leads and is the default panel; the five named harnesses
  // reorder behind it by detected OS. Ordering is a heuristic, never a claim:
  // the page cannot see which apps are installed — the deep-link click is
  // the real install probe.
  var ORDER = {
    mac: ["claude-desktop", "claude-code", "cursor", "vscode", "codex"],
    win: ["cursor", "vscode", "claude-desktop", "claude-code", "codex"],
    linux: ["claude-code", "vscode", "codex", "cursor", "claude-desktop"]
  };

  function chipFor(name) {
    return chips.filter(function (c) { return c.getAttribute("data-harness") === name; })[0];
  }

  var os = detectOS();
  var order = ORDER[os] || [];
  if (order.length && chipsBox) {
    order.forEach(function (name) {
      var chip = chipFor(name);
      if (chip) chipsBox.appendChild(chip);
    });
  }
  var preferredChip = chipFor("generic") || chips[0];

  function activate(name) {
    chips.forEach(function (c) {
      var on = c.getAttribute("data-harness") === name;
      c.classList.toggle("active", on);
      if (on) c.setAttribute("aria-selected", "true");
      else c.removeAttribute("aria-selected");
    });
    panels.forEach(function (p) {
      p.classList.toggle("active", p.id === "panel-" + name);
    });
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activate(chip.getAttribute("data-harness"));
    });
  });
  if (preferredChip) activate(preferredChip.getAttribute("data-harness"));

  // Windows: swap POSIX-quoted commands for the double-quote-escaped form.
  if (os === "win") {
    Array.prototype.forEach.call(document.querySelectorAll("code[data-win]"), function (code) {
      code.textContent = code.getAttribute("data-win");
    });
  }

  // Copy buttons read the current text of their target <code>, so the
  // Windows swap above flows through automatically.
  Array.prototype.forEach.call(document.querySelectorAll(".connect-copy"), function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-copy-code"));
      if (!target) return;
      var text = target.textContent;
      var done = function () {
        btn.classList.add("copied");
        var original = btn.textContent;
        btn.textContent = "Copied \u2713";
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.textContent = original;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); });
      } else {
        legacyCopy(text);
        done();
      }
    });
  });

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  // Deep-link probe: if the click never blurs the page, the harness never
  // opened (or the OS doesn't know the scheme) — reveal the manual path.
  Array.prototype.forEach.call(document.querySelectorAll("a[data-deeplink]"), function (link) {
    link.addEventListener("click", function () {
      var panel = link.closest(".connect-panel");
      var fallback = panel && panel.querySelector(".connect-fallback");
      if (!fallback) return;
      fallback.classList.remove("show");
      var opened = false;
      var onOpen = function () { opened = true; cleanup(); };
      var timer = setTimeout(function () { cleanup(); if (!opened) fallback.classList.add("show"); }, 1800);
      function cleanup() {
        clearTimeout(timer);
        window.removeEventListener("blur", onOpen);
        document.removeEventListener("visibilitychange", onVisible);
      }
      function onVisible() { if (document.hidden) onOpen(); }
      window.addEventListener("blur", onOpen);
      document.addEventListener("visibilitychange", onVisible);
    });
  });

  // Phones and tablets: point the visitor at the machine their agent runs on.
  if (/android|iphone|ipad|ipod|mobile|silk/i.test(navigator.userAgent || "")) {
    var note = document.getElementById("connect-mobile");
    if (note) note.classList.add("show");
  }
})();
