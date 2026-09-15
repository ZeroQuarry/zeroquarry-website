const platformLinks = [
  ["/platform/security-testing/", "Security testing", "Review your source code or your running app"],
  ["/platform/adversarial-validation/", "Adversarial validation", "Check a finding is real before it becomes work"],
  ["/platform/continuous-security/", "Continuous security", "Review every risky change as it lands"],
  ["/platform/security-operations/", "Security operations", "Track each finding from intake to audit"],
  ["/platform/remediation/", "Remediation", "Turn findings into reviewed fixes"],
  ["/platform/private-execution/", "Private execution", "Run scans inside your own network"],
  ["/platform/evidence-reporting/", "Evidence and reporting", "Give customers and auditors the evidence"],
];

const useCaseLinks = [
  ["/open-source/", "Open source maintainers", "Work out which reports are real, and answer them"],
  ["/use-cases/startup-security/", "Security for growing companies", "Get real coverage before you hire for it"],
  ["/use-cases/pr-security-review/", "Pull request security review", "Review risky code while the author still remembers it"],
  ["/use-cases/release-security-review/", "Release security review", "Check a release before you ship it"],
  ["/use-cases/inbound-vulnerability-reports/", "Inbound vulnerability reports", "Turn a researcher's email into real work"],
  ["/use-cases/customer-security-reviews/", "Customer and audit evidence", "Answer customer questions with current evidence"],
  ["/use-cases/vulnerability-disclosure/", "Vulnerability disclosure", "Handle findings that come from outside"],
];

// Keep shell behavior and styles on the same cache generation after deploys.
const assetVersion = "20260915-copy2";

function linkCurrent(active, value) {
  return active === value ? ' aria-current="page"' : "";
}

// Theme toggle lives in the shared shell so every page offers it. Icons are
// swapped by CSS based on the active theme (sun shows in dark mode).
const themeToggleButton = `<button class="theme-toggle" type="button" aria-label="Toggle color theme">
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 14.2A8.6 8.6 0 0 1 9.8 3.4a8.6 8.6 0 1 0 10.8 10.8Z"/></svg>
      </button>
`;

function siteNav(active = "") {
  return `<header class="nav site-nav">
  <div class="nav-inner">
    <a href="/" class="brand" aria-label="ZeroQuarry home">
      <img class="wordmark wm-dark" src="/assets/wordmark.png" alt="ZeroQuarry">
      <img class="wordmark wm-light" src="/assets/wordmark-light.png" alt="ZeroQuarry">
    </a>
    <nav class="nav-links buyer-nav" aria-label="Primary">
      <a href="/"${linkCurrent(active, "home")}>Why ZeroQuarry</a>
      <details class="nav-cluster" name="primary-nav">
        <summary${linkCurrent(active, "platform")}>Platform</summary>
        <div class="nav-mega nav-mega-platform">
          <div class="nav-mega-intro">
            <span class="nav-overline">Platform</span>
            <strong>What ZeroQuarry does</strong>
            <p>Finds security problems in your product and keeps the record of what happened to each one.</p>
            <a href="/platform">Platform overview <span aria-hidden="true">-&gt;</span></a>
          </div>
          <div class="nav-mega-links">
            ${platformLinks.map(([href, label, description]) => `<a href="${href}"><strong>${label}</strong><span>${description}</span></a>`).join("\n            ")}
          </div>
        </div>
      </details>
      <details class="nav-cluster" name="primary-nav">
        <summary${linkCurrent(active, "use-cases")}>Use cases</summary>
        <div class="nav-mega nav-mega-use-cases">
          <div class="nav-mega-intro">
            <span class="nav-overline">Use cases</span>
            <strong>Start from your situation</strong>
            <p>Pick the one that matches what you are dealing with now.</p>
            <a href="/use-cases/">Explore all use cases <span aria-hidden="true">-&gt;</span></a>
          </div>
          <div class="nav-mega-links">
            ${useCaseLinks.map(([href, label, description]) => `<a href="${href}"><strong>${label}</strong><span>${description}</span></a>`).join("\n            ")}
          </div>
        </div>
      </details>
      <a href="/research/"${linkCurrent(active, "research")}>Research</a>
      <a href="/pricing"${linkCurrent(active, "pricing")}>Pricing</a>
      <a href="https://docs.zeroquarry.com">Docs</a>
    </nav>
    <div class="nav-cta">
      ${themeToggleButton}<a class="btn btn-ghost" href="https://console.zeroquarry.com/login">Sign in</a>
      <a class="btn btn-primary" href="https://console.zeroquarry.com/register">Start free trial <span class="arr">-&gt;</span></a>
    </div>
    <details class="mobile-nav">
      <summary>Browse ZeroQuarry</summary>
      <nav class="mobile-nav-panel" aria-label="Mobile primary">
        <a href="/"${linkCurrent(active, "home")}>Why ZeroQuarry</a>
        <a href="/platform"${linkCurrent(active, "platform")}>Platform</a>
        <a href="/use-cases/"${linkCurrent(active, "use-cases")}>Use cases</a>
        <a href="/research/"${linkCurrent(active, "research")}>Research</a>
        <a href="/pricing"${linkCurrent(active, "pricing")}>Pricing</a>
        <a href="https://docs.zeroquarry.com">Docs</a>
      </nav>
    </details>
  </div>
</header>`;
}

function siteFooter() {
  return `<footer class="site-footer buyer-footer">
  <div class="container">
    <div class="foot-grid buyer-foot-grid">
      <div class="foot-col foot-brand">
        <a href="/" class="brand" aria-label="ZeroQuarry home">
          <img class="wordmark wm-dark" src="/assets/wordmark.png" alt="ZeroQuarry">
      <img class="wordmark wm-light" src="/assets/wordmark-light.png" alt="ZeroQuarry">
        </a>
        <p>Independent security testing and evidence for product teams.</p>
        <a class="foot-cta" href="https://console.zeroquarry.com/register">Start free trial <span aria-hidden="true">-&gt;</span></a>
      </div>
      <div class="foot-col legal">
        <h5>Platform</h5>
        <a href="/platform">Overview</a>
        ${platformLinks.map(([href, label]) => `<a href="${href}">${label}</a>`).join("\n        ")}
      </div>
      <div class="foot-col legal">
        <h5>Use cases</h5>
        ${useCaseLinks.map(([href, label]) => `<a href="${href}">${label}</a>`).join("\n        ")}
      </div>
      <div class="foot-col legal">
        <h5>Company</h5>
        <a href="/research/">Research</a>
        <a href="/partners/">Security partners</a>
        <a href="/pricing">Pricing</a>
        <a href="/about">About</a>
        <a href="https://docs.zeroquarry.com">Documentation</a>
        <a href="https://status.zeroquarry.com">Status</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </div>
    </div>
    <div class="foot-bottom">
      <div>&copy; 2026 ZeroQuarry. All rights reserved.</div>
      <div class="right">
        <a href="https://www.linkedin.com/company/zeroquarry/">LinkedIn</a>
        <a href="https://github.com/ZeroQuarry/">GitHub</a>
        <span class="ok">ALL SYSTEMS OPERATIONAL</span>
      </div>
    </div>
  </div>
</footer>`;
}

module.exports = {
  assetVersion,
  platformLinks,
  siteFooter,
  siteNav,
  useCaseLinks,
};
