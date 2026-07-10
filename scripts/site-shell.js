const platformLinks = [
  ["/platform/security-testing/", "Security testing", "Source, binary, and live-target assessments"],
  ["/platform/adversarial-validation/", "Adversarial validation", "Challenge findings before they become work"],
  ["/platform/continuous-security/", "Continuous security", "PR, scheduled, and API-triggered reviews"],
  ["/platform/security-operations/", "Security operations", "Intake, decisions, routing, and audit history"],
  ["/platform/remediation/", "Remediation", "Patches, pull requests, tickets, and retests"],
  ["/platform/evidence-reporting/", "Evidence and reporting", "Reports, controlled sharing, and assurance packs"],
];

const useCaseLinks = [
  ["/use-cases/startup-security/", "Security for growing companies", "Run a credible program before staffing every specialty"],
  ["/use-cases/pr-security-review/", "Pull request security review", "Review risky changes while context is fresh"],
  ["/use-cases/release-security-review/", "Release security review", "Test code, artifacts, and staging before promotion"],
  ["/use-cases/inbound-vulnerability-reports/", "Inbound vulnerability reports", "Turn researcher email into bounded assessment work"],
  ["/use-cases/customer-security-reviews/", "Customer and audit evidence", "Answer assurance requests with current evidence"],
  ["/use-cases/vulnerability-disclosure/", "Vulnerability disclosure", "Validate, share, and track external findings"],
];

function linkCurrent(active, value) {
  return active === value ? ' aria-current="page"' : "";
}

function siteNav(active = "") {
  return `<header class="nav site-nav">
  <div class="nav-inner">
    <a href="/" class="brand" aria-label="ZeroQuarry home">
      <img class="wordmark" src="/assets/wordmark.png" alt="ZeroQuarry">
    </a>
    <nav class="nav-links buyer-nav" aria-label="Primary">
      <a href="/"${linkCurrent(active, "home")}>Why ZeroQuarry</a>
      <details class="nav-cluster">
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
      <details class="nav-cluster">
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
      <a class="btn btn-ghost" href="/request-scan/">Talk to us</a>
      <a class="btn btn-primary" href="https://console.zeroquarry.com">Start free <span class="arr">-&gt;</span></a>
    </div>
  </div>
</header>`;
}

function siteFooter() {
  return `<footer class="site-footer buyer-footer">
  <div class="container">
    <div class="foot-grid buyer-foot-grid">
      <div class="foot-col foot-brand">
        <a href="/" class="brand" aria-label="ZeroQuarry home">
          <img class="wordmark" src="/assets/wordmark.png" alt="ZeroQuarry">
        </a>
        <p>AI security operations for teams that need more coverage than their headcount can provide.</p>
        <a class="foot-cta" href="https://console.zeroquarry.com">Start free <span aria-hidden="true">-&gt;</span></a>
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
  platformLinks,
  siteFooter,
  siteNav,
  useCaseLinks,
};
