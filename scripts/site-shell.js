const platformLinks = [
  ["/platform/security-testing/", "Security testing", "Source, binary, and live-target assessments"],
  ["/platform/adversarial-validation/", "Adversarial validation", "Challenge findings before they become work"],
  ["/platform/continuous-security/", "Continuous security", "PR, scheduled, and API-triggered reviews"],
  ["/platform/security-operations/", "Security operations", "Intake, decisions, routing, and audit history"],
  ["/platform/remediation/", "Remediation", "Patches, pull requests, tickets, and retests"],
  ["/platform/private-execution/", "Private execution", "Customer-controlled runners for internal targets"],
  ["/platform/evidence-reporting/", "Evidence and reporting", "Reports, controlled sharing, and assurance packs"],
];

const useCaseLinks = [
  ["/open-source/", "Open source maintainers", "Validate noisy reports and keep the response work together"],
  ["/use-cases/startup-security/", "Security for growing companies", "Run a credible program before staffing every specialty"],
  ["/use-cases/pr-security-review/", "Pull request security review", "Review risky changes while context is fresh"],
  ["/use-cases/release-security-review/", "Release security review", "Test code, artifacts, and staging before promotion"],
  ["/use-cases/inbound-vulnerability-reports/", "Inbound vulnerability reports", "Turn researcher email into bounded assessment work"],
  ["/use-cases/customer-security-reviews/", "Customer and audit evidence", "Answer assurance requests with current evidence"],
  ["/use-cases/vulnerability-disclosure/", "Vulnerability disclosure", "Validate, share, and track external findings"],
];

// Keep shell behavior and styles on the same cache generation after deploys.
const assetVersion = "20260912-motion1";

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
            <strong>The security operating loop</strong>
            <p>Find, validate, route, fix, retest, and prove security work.</p>
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
            <strong>Start with the security moment</strong>
            <p>Choose the workflow that matches the decision in front of you.</p>
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
      <a class="btn btn-primary" href="https://console.zeroquarry.com/register">Start trial <span class="arr">-&gt;</span></a>
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
        <p>AI security operations for teams that need more coverage than their headcount can provide.</p>
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
