const fs = require("fs");
const path = require("path");
const { assetVersion, siteFooter, siteNav } = require("./site-shell");

const root = path.resolve(__dirname, "..");
const siteUrl = "https://zeroquarry.com";
const socialImage = `${siteUrl}/assets/og-zeroquarry.png`;
const consoleUrl = "https://console.zeroquarry.com";
const signupUrls = {
  general: `${consoleUrl}/register`,
  startup: `${consoleUrl}/register/startup-security`,
  prReview: `${consoleUrl}/register/pr-review`,
  reportTriage: `${consoleUrl}/register/report-triage`,
  openSource: `${consoleUrl}/register/open-source`,
  customerEvidence: `${consoleUrl}/register/customer-evidence`,
};
const foundingCohortPath = "/founding-security-cohort/";
const foundingCohortApplication = "#apply";
const securityPartnerPath = "/partners/";
const securityPartnerApplication = "#partner-apply";
const signupBySlug = {
  "continuous-security": signupUrls.prReview,
  "pr-security-review": signupUrls.prReview,
  "release-security-review": signupUrls.prReview,
  "security-operations": signupUrls.reportTriage,
  "inbound-vulnerability-reports": signupUrls.reportTriage,
  "vulnerability-disclosure": signupUrls.reportTriage,
  "startup-security": signupUrls.startup,
  "customer-security-reviews": signupUrls.customerEvidence,
  "evidence-reporting": signupUrls.customerEvidence,
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function structuredData(items) {
  return items
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`)
    .join("\n");
}

function breadcrumbData(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  };
}

function faqData(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

function layout({
  title,
  description,
  canonical,
  active,
  body,
  schemas = [],
  robots = "",
  socialImageUrl = socialImage,
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />${robots ? `\n<meta name="robots" content="${escapeHtml(robots)}" />` : ""}
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:image" content="${socialImageUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${socialImageUrl}" />
<link rel="icon" type="image/png" href="/assets/favicon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/index.css" />
<link rel="stylesheet" href="/marketing.css?v=${assetVersion}" />
<link rel="stylesheet" href="/cookie-consent.css" />
<script src="/cookie-consent.js" data-analytics-id="G-ZRT44MWJT1" defer></script>
<script src="/index.js?v=${assetVersion}" defer></script>
${structuredData(schemas)}
</head>
<body>
<div class="bg-flair" aria-hidden="true"><div class="bg-grid"></div><div class="bg-glow-red"></div></div>
${siteNav(active)}
${body}
${siteFooter()}
</body>
</html>`;
}

const platformPages = [
  {
    slug: "security-testing",
    title: "AI Security Testing for Source Code, Binaries, and Live Applications | ZeroQuarry",
    description: "Run AI penetration testing and application security reviews across source code, shipped binaries, and authorized live targets in one project history.",
    eyebrow: "AI security testing",
    h1: "Test source, artifacts, and live behavior as <em>one product.</em>",
    lede: "ZeroQuarry combines AI code security review, binary analysis, and authorized live application testing so teams can follow vulnerabilities across build, packaging, and runtime boundaries.",
    image: "/assets/product/report-overview.png",
    imageAlt: "ZeroQuarry security assessment report showing findings and review controls",
    proof: ["Source repositories", "Binary artifacts", "Authorized live targets"],
    sectionTitle: "Three assessment surfaces. One <em>evidence chain.</em>",
    sectionIntro: "A source finding can disappear during packaging. Another issue may only become exploitable at runtime. Keeping every surface in one project makes those differences visible.",
    capabilities: [
      ["Hybrid static and agent analysis", "Use a bounded deterministic SAST pre-pass to generate investigation candidates, then have agents test reachability, product context, control flow, and impact before recording findings."],
      ["Source code review", "Trace authorization, data flow, unsafe parsers, secrets, dependency use, and business-logic failures across repositories or uploaded archives."],
      ["Binary analysis", "Expand and decompile APKs, JARs, firmware, installers, and archives to review the artifact customers actually receive."],
      ["Live application testing", "Probe web applications and APIs inside explicit host, authentication, and authorization boundaries."],
      ["Focused assessment notes", "Give the coordinator product context, sensitive boundaries, and recent-change details without preventing broader investigation."],
      ["Multi-model orchestration", "Resolve separate models for investigation, adversarial review, and artifact generation while keeping one report."],
      ["Project and lineage history", "Group assessment versions by product or service and preserve targets, findings, retests, logs, and artifacts."],
    ],
    workflow: [
      ["Scope", "Choose the product project, target surface, credentials, authorization, and business context."],
      ["Investigate", "Coordinator and specialist agents map the target and follow high-value attack paths."],
      ["Validate", "Triage, proof generation, and optional vendor-style review pressure-test the claims."],
      ["Act", "Route accepted findings into fixes, tickets, retests, disclosures, or evidence packs."],
    ],
    outcomes: [
      ["Broader product coverage", "Review code, shipped artifacts, and live behavior without splitting history across unrelated tools."],
      ["More useful findings", "Prioritize evidence, reachability, impact, and product context over pattern matches."],
      ["A repeatable assessment record", "Keep every target, version, decision, and retest connected to the product it belongs to."],
    ],
    faqs: [
      ["Is ZeroQuarry a SAST or DAST scanner?", "ZeroQuarry combines a bounded deterministic SAST pre-pass with agent-led source investigation, binary analysis, and authorized live testing. Static matches are investigation candidates, not alerts presented as validated vulnerabilities."],
      ["Can it test private repositories?", "Yes. Accounts can configure scoped HTTPS or SSH Git credentials, and CI workflows can reference the saved credential without placing it in the scan payload."],
      ["Can ZeroQuarry test production?", "Remote testing requires explicit authorization and scope. Use a staging or production-like environment when active probes could create risk, and keep the allowed host boundary narrow."],
    ],
    related: [["/use-cases/release-security-review/", "Release security review"], ["/use-cases/pr-security-review/", "Pull request security review"], ["/platform/private-execution/", "Private execution"]],
  },
  {
    slug: "adversarial-validation",
    title: "Adversarial Vulnerability Validation and False-Positive Reduction | ZeroQuarry",
    description: "Challenge AI security findings with skeptical vendor-style review, rebuttal, confidence scoring, evidence, and accountable human decisions.",
    eyebrow: "Adversarial validation",
    h1: "Make every finding survive a <em>skeptical counterparty.</em>",
    lede: "A confident AI can still be wrong. ZeroQuarry separates discovery from validation: researcher agents build the claim, vendor-style reviewers try to reject it, and rebuttal must answer with evidence or concede.",
    image: "/assets/product/finding-detail.png",
    imageAlt: "ZeroQuarry finding detail with validation state and decision controls",
    proof: ["Evidence-first findings", "Vendor-style challenge", "Human decision history"],
    sectionTitle: "False positives need a <em>review process.</em>",
    sectionIntro: "Instead of hiding uncertain alerts at an arbitrary score, ZeroQuarry records why a claim survived, changed, or was disputed.",
    capabilities: [
      ["Adversarial vendor review", "A separate review pass checks reachability, context mitigations, intended behavior, evidence quality, and practical exploitability."],
      ["Researcher rebuttal", "The original side responds to the challenge with more evidence, revises the claim, or retracts it."],
      ["Confidence separate from severity", "See how likely a finding is to survive review without confusing that judgment with potential impact."],
      ["Proofs and reproducible context", "Attach PoCs, source locations, HTTP sequences, or deployable test packages when the assessment supports them."],
      ["Finding discussion", "Ask follow-up questions, request different reproduction steps, or challenge assumptions over several rounds."],
      ["Lifecycle decisions", "Record candidate, validated, disputed, mitigated, retested, regression, accepted-risk, and archived states with reasons."],
    ],
    workflow: [
      ["Claim", "The assessment records technical impact, severity, affected surface, evidence, and reproduction context."],
      ["Challenge", "A skeptical reviewer attempts to disprove the issue in the product's actual context."],
      ["Rebut", "The researcher sustains, revises, or retracts instead of merely repeating the conclusion."],
      ["Decide", "A human records the operating state and routes accepted work to the correct owner."],
    ],
    outcomes: [
      ["Less alert fatigue", "Engineering sees reviewed claims with a visible evidence trail. Unsupported suggestions are filtered out earlier."],
      ["Defensible decisions", "Disputes and accepted risks carry reasons that can be understood later."],
      ["Safer external sharing", "Challenge high-impact findings before they reach customers, vendors, or bounty programs."],
    ],
    faqs: [
      ["Does adversarial review guarantee a finding is correct?", "No automated review can remove the need for product context and human judgment. It makes the validation process explicit and creates stronger evidence for that decision."],
      ["What happens to rejected findings?", "They are not silently deleted. Review verdicts, rebuttals, confidence, and human lifecycle decisions remain visible so the outcome can be audited or revisited."],
      ["Can we ask the system to explain a finding differently?", "Yes. Finding and report discussions can request a shorter engineer handoff, safer reproduction path, alternative PoC, or challenge to a specific assumption."],
    ],
    related: [["/use-cases/pr-security-review/", "Pull request security review"], ["/use-cases/vulnerability-disclosure/", "Vulnerability disclosure"], ["/platform/remediation/", "Remediation"]],
  },
  {
    slug: "continuous-security",
    title: "Continuous Application Security Testing for CI/CD and Pull Requests | ZeroQuarry",
    description: "Run continuous application security with PR scans, GitHub Actions, scheduled rescans, changed-code analysis, APIs, Slack, and scan lineage.",
    eyebrow: "Continuous application security",
    h1: "Review risk while the change is still <em>small enough to understand.</em>",
    lede: "Trigger AI code security reviews from GitHub Actions, the API, or a native schedule. Delta scans focus on changed files and nearby data flow while lineages preserve the wider product history.",
    image: "/assets/product/scheduled-rescan.png",
    imageAlt: "ZeroQuarry scheduled rescan controls for changed-code and full reviews",
    proof: ["PR and push triggers", "Scheduled rescans", "Changed-code focus"],
    sectionTitle: "Continuous testing without turning CI into an <em>alert machine.</em>",
    sectionIntro: "A full pentest on every commit would be wasteful. Teams need a reliable signal around high-risk changes, plus a path to deeper review when the signal warrants it.",
    capabilities: [
      ["GitHub Actions workflow", "Install a maintained workflow that dispatches repository scans on pull requests, pushes, schedules, or manual runs."],
      ["Delta scans", "Use Git history to focus the next assessment on changed files and adjacent data flow after the first baseline."],
      ["Native schedules", "Attach daily, weekly, or monthly coverage to a Git lineage, skip unchanged commits, and optionally recheck unresolved findings."],
      ["Public API", "Create, monitor, cancel, rescan, search, share, and export through the same account and tier boundaries as the console."],
      ["Practical gating", "Start non-blocking, then gate on reviewed critical or high findings when the team understands the signal profile."],
      ["Notifications and handoff", "Send completion summaries to email or Slack and move accepted findings into tickets or pull requests."],
    ],
    workflow: [
      ["Baseline", "Create the project and complete one broad source assessment for the repository."],
      ["Trigger", "Dispatch on high-risk pull requests, main-branch changes, or an independent schedule."],
      ["Review", "Validate important results and avoid treating an unreviewed model output as a release decision."],
      ["Escalate", "Move consequential changes into a broader source, binary, or live-target release review."],
    ],
    outcomes: [
      ["Shorter feedback loops", "Catch authorization, webhook, parser, billing, and tenant-boundary regressions before context disappears."],
      ["Controlled scan spend", "Use change focus, no-change skips, deduplication, and stage-specific models to match depth to risk."],
      ["Evidence-backed remediation checks", "Record each selected previous finding as fixed, still present, or inconclusive instead of treating absence from a new scan as proof of a fix."],
      ["Security history by product", "Keep repeated assessments and retests in one project instead of burying evidence in CI logs."],
    ],
    faqs: [
      ["Should every pull request block on ZeroQuarry?", "Usually not at first. Start with report-only visibility, learn the finding profile, then introduce a reviewed threshold for the branches and changes that justify it."],
      ["What is the difference between CI and scheduled scans?", "CI associates security review with an engineering event. Schedules provide independent baseline coverage and only run a new scan when the repository commit changes."],
      ["Does a delta scan inspect only the edited lines?", "No. Changed files define the focus, but agents can follow nearby calls and data flow when the security impact crosses the diff boundary."],
    ],
    related: [["/use-cases/pr-security-review/", "Pull request security review"], ["/use-cases/release-security-review/", "Release security review"], ["/platform/security-testing/", "Security testing"]],
  },
  {
    slug: "security-operations",
    title: "AI Security Operations: Intake, Triage, Tickets, and Audit History | ZeroQuarry",
    description: "Automate lean security operations with vulnerability-report intake, finding lifecycle, Jira, ServiceNow, GitHub, Slack, search, and audit history.",
    eyebrow: "AI security operations",
    h1: "Give every vulnerability a path from <em>intake to resolution.</em>",
    lede: "ZeroQuarry receives work, investigates it, records accountable decisions, routes accepted findings into the systems teams already use, and preserves the evidence needed later.",
    image: "/assets/product/integrations-overview.png",
    imageAlt: "ZeroQuarry integrations for notifications, ticketing, automation, and email intake",
    proof: ["Bounded report intake", "Finding lifecycle", "Ticket and chat integrations"],
    sectionTitle: "The missing layer between a finding and a <em>security program.</em>",
    sectionIntro: "Security operations fail when intake, technical validation, ownership, and evidence live in separate systems with no durable connection.",
    capabilities: [
      ["Incoming email triage", "Forward researcher or customer security reports into project-specific inboxes with sender allowlists and approved target boundaries."],
      ["Finding lifecycle", "Move work through candidate, validation, mitigation, retest, regression, accepted risk, dispute, and archive states."],
      ["Jira and ServiceNow", "Create or prefill engineering and IT work directly from validated finding context."],
      ["GitHub Issues and Slack", "Route developer work and completion signals without requiring teams to monitor another dashboard all day."],
      ["Audit history", "Retain actors, models, stages, outcomes, errors, lifecycle changes, and reasons at report and finding level."],
      ["Account-wide search", "Find projects, scans, findings, repositories, and disclosures across the operating record."],
    ],
    workflow: [
      ["Receive", "Start from a code change, schedule, manual assessment, API request, or forwarded report."],
      ["Assess", "Map the work to the owning product and the appropriate source, binary, or live target."],
      ["Decide", "Validate or dispute the claim and record the reason rather than silently dropping it."],
      ["Route", "Create remediation work, monitor the lifecycle, retest, and preserve evidence."],
    ],
    outcomes: [
      ["More security capacity", "Automate repeatable investigation and coordination while keeping authorization and business judgment human."],
      ["Clear accountability", "Give each important finding a current decision, a reason, and an owner in the existing system of work."],
      ["Less reconstruction", "Answer later questions from one connected record instead of tickets, inboxes, exports, and chat fragments."],
    ],
    faqs: [
      ["Is ZeroQuarry a SIEM or incident-response platform?", "No. ZeroQuarry focuses on product-security assessment and the operating workflow around vulnerabilities, not production threat telemetry or incident containment."],
      ["Can external email trigger arbitrary scans?", "No. Email processing requires an assigned project address, an allowed sender, approved repositories, and an explicit setting for remote targets. Only reports that pass those checks can start assessment work."],
      ["Does ZeroQuarry sync ticket status back automatically?", "Current integrations create or prefill work and preserve the creation record. The finding lifecycle remains the explicit source of truth for the security decision."],
    ],
    related: [["/use-cases/startup-security/", "Security for growing companies"], ["/use-cases/inbound-vulnerability-reports/", "Inbound vulnerability reports"], ["/platform/evidence-reporting/", "Evidence and reporting"]],
  },
  {
    slug: "remediation",
    title: "AI Vulnerability Remediation, Auto-Fix Pull Requests, and Retesting | ZeroQuarry",
    description: "Move validated vulnerabilities into patches, GitHub auto-fix pull requests, Jira, ServiceNow, GitHub Issues, and focused security retests.",
    eyebrow: "Vulnerability remediation",
    h1: "Close the distance between <em>evidence and a reviewed fix.</em>",
    lede: "Generate focused diffs, stage audited auto-fix proposals, open pull requests through ZeroQuarryBot, or hand findings into the team’s ticketing system. Retest the result in the same lineage.",
    image: "/assets/product/github-autofix.png",
    imageAlt: "ZeroQuarryBot installation and kill-switch controls for auto-fix pull requests",
    proof: ["Generated patch revisions", "Approval-gated GitHub PRs", "Focused retesting"],
    sectionTitle: "A patch is a proposal. The workflow makes that <em>explicit.</em>",
    sectionIntro: "Security automation should reduce translation work without silently approving production changes. ZeroQuarry separates generation, repository permission, operator approval, CI, and merge.",
    capabilities: [
      ["Generated patch revisions", "Create a unified diff, review it, give feedback, and generate a new revision without granting repository write access."],
      ["ZeroQuarryBot pull requests", "Install a GitHub App on selected repositories and open audited PRs from approved proposals."],
      ["Layered safety controls", "Use account and repository kill switches, explicit enrollment, base-branch settings, file deny-lists, size limits, and push caps."],
      ["Optional auto-push", "After a successful manual workflow, selected repositories can send qualifying proposals straight to PR review without auto-merging."],
      ["Ticket handoff", "Create Jira or ServiceNow work, or open a prefilled GitHub Issue when code changes are not the right first step."],
      ["Explicit finding rechecks", "Ask an update scan to retest unresolved lineage findings and record each one as fixed, still present, or inconclusive with current evidence."],
    ],
    workflow: [
      ["Validate", "Confirm the vulnerability applies to the product before generating or filing remediation work."],
      ["Propose", "Generate a patch, auto-fix proposal, or ticket with source, impact, proof, and expected outcome."],
      ["Review", "Use normal engineering ownership, CI, branch protection, and code-review controls."],
      ["Retest", "Verify the risk after merge; do not infer a fix merely because a previous finding is absent from a new scan."],
    ],
    outcomes: [
      ["Engineer-ready work", "Reduce the manual translation from vulnerability narrative to code path, reproduction, and candidate change."],
      ["Controlled automation", "Get the speed of generated fixes while preserving explicit repository gates and human merge authority."],
      ["Verified closure", "Differentiate “a fix was merged” from “the security risk was actually retested.”"],
    ],
    faqs: [
      ["Does ZeroQuarry auto-merge security fixes?", "No. ZeroQuarryBot opens pull requests; your repository’s reviewers, CI, branch protection, and merge policy remain in control."],
      ["Do we have to install the GitHub App to get a patch?", "No. Patch generation can produce a downloadable or revisable diff without repository write access. The GitHub App is only needed for the pull-request workflow."],
      ["How do we stop the bot quickly?", "An account-wide kill switch stops all pushes, and each repository has its own kill switch. Repository enrollment and GitHub App access add separate permission gates."],
    ],
    related: [["/use-cases/pr-security-review/", "Pull request security review"], ["/platform/adversarial-validation/", "Adversarial validation"], ["/platform/continuous-security/", "Continuous security"]],
  },
  {
    slug: "private-execution",
    title: "Private Security Scanning Runners for Internal Networks | ZeroQuarry",
    description: "Run AI security scans from customer-controlled Docker runners for private Git repositories and authorized internal applications, with outbound-only connectivity and minimized result return.",
    eyebrow: "Private execution",
    h1: "Run security assessments where your code and internal targets <em>already live.</em>",
    lede: "Private runners execute eligible source and live-target scans from Docker hosts inside networks you control. Evaluate the full workflow during the 30-day commercial trial, keep cloud and private execution explicit per project, and choose how much result detail returns to ZeroQuarry.",
    image: "/assets/product/account-private-runners.png",
    imageAlt: "ZeroQuarry private runner pool controls for internal-network security assessments",
    proof: ["Customer-controlled Docker hosts", "Outbound HTTPS only", "Minimized or standard results"],
    sectionTitle: "Private reachability without pretending the control plane is <em>air-gapped.</em>",
    sectionIntro: "The runner stays connected to the ZeroQuarry SaaS control plane and the customer-selected LLM provider. The design gives buyers a precise execution and result boundary instead of a vague on-premise claim.",
    capabilities: [
      ["Internal application testing", "Reach authorized RFC1918, loopback, link-local, and internal-DNS targets from inside the customer network while cloud workers retain SSRF protections."],
      ["Private Git source execution", "Clone Git repositories directly on the runner with scoped credentials. Browser source uploads and binary uploads do not use private execution."],
      ["Outbound-only enrollment", "Enroll a runner with a one-use, 24-hour token and make outbound HTTPS connections without opening an inbound firewall rule."],
      ["Per-project execution policy", "Allow specific pools on a project, choose a default, and let scan creators select only compatible environments."],
      ["Result minimization", "Return allowlisted finding metadata and safe locations while evidence, remediation text, logs, errors, and artifacts remain on the runner."],
      ["Operational controls", "Separate trust zones into pools, monitor health and leases, drain for maintenance, revoke immediately, and retain an account audit trail."],
    ],
    workflow: [
      ["Design", "Choose the network boundary, eligible source or remote modes, returned-result policy, and account-managed models."],
      ["Enroll", "Run the generated Docker command on a host that can reach the targets, Git host, LLM providers, and ZeroQuarry control plane."],
      ["Authorize", "Allow the pool on selected projects and choose whether ZeroQuarry Cloud remains an approved alternative."],
      ["Operate", "Assign scans explicitly, monitor runner health, and review result and audit behavior without automatic cloud fallback."],
    ],
    outcomes: [
      ["Coverage of internal attack surface", "Assess private applications and APIs that a managed SaaS worker cannot safely reach."],
      ["A narrower result boundary", "Keep detailed evidence local when minimized metadata is enough for centralized triage and reporting."],
      ["Explicit deployment control", "Give security and infrastructure teams a reviewable model for network reachability, provider access, retries, and revocation."],
    ],
    faqs: [
      ["Is a private runner fully on-premise or air-gapped?", "No. It executes scans on a customer-controlled Docker host but makes outbound HTTPS calls to the ZeroQuarry control plane and directly to the selected LLM provider."],
      ["Which scans can use private runners?", "Private pools support Git-backed source scans and authorized remote targets. Source file uploads, archives uploaded through the browser, and binary uploads are not private-runner inputs."],
      ["Can a failed private job fall back to ZeroQuarry Cloud?", "No. A failed or expired attempt is retried in the same private pool. Cloud execution occurs only when a scan creator explicitly selects an allowed cloud environment."],
      ["Do private runners require bring-your-own model keys?", "Yes. Every selected scan, review, and artifact model needs an account-managed provider key so the runner can call that provider directly."],
      ["Can we evaluate private runners before buying Enterprise?", "Yes. The 30-day commercial trial includes self-serve private runner pools. Create a pool, run the generated Docker command, and evaluate a Git-backed source scan or authorized internal target before discussing Enterprise rollout terms."],
    ],
    related: [["/platform/security-testing/", "AI security testing"], ["/use-cases/release-security-review/", "Release security review"], ["/platform/evidence-reporting/", "Evidence and reporting"]],
    ctaHref: `${signupUrls.general}?utm_source=zeroquarry.com&utm_medium=owned-site&utm_campaign=private-execution-trial&utm_content=hero`,
    ctaLabel: "Start 30-day private-execution trial",
    finalCtaTitle: "Prove the execution boundary on your infrastructure.",
    finalCtaText: "Create a private runner pool, run the generated Docker command, and evaluate one Git-backed source scan or authorized internal target during the 30-day trial.",
    docsHref: "https://docs.zeroquarry.com/workflows/private-runners",
  },
  {
    slug: "evidence-reporting",
    title: "Security Evidence, Pentest Reports, and Customer Assurance | ZeroQuarry",
    description: "Create penetration test PDF reports, asset evidence packs, controlled finding shares, disclosure records, and audit trails for customers and auditors.",
    eyebrow: "Security evidence and reporting",
    h1: "Make security work <em>provable</em> when someone asks.",
    lede: "Package current evidence by asset, export reviewed reports, share only the findings a recipient needs, and retain the decision history behind remediation, retest, and accepted risk.",
    image: "/assets/product/evidence-room.png",
    imageAlt: "ZeroQuarry Evidence Room with target-level security reports and PDF export",
    proof: ["Asset-level Evidence Room", "Pentest-style PDF exports", "Expiring finding shares"],
    sectionTitle: "Evidence should be a by-product of the <em>operating process.</em>",
    sectionIntro: "Reconstructing security history from tickets and chat during a customer review is expensive. The resulting story is usually incomplete.",
    capabilities: [
      ["Evidence Room", "See completed work by actual Git repository, URL, upload, or path and export the latest report for selected assets."],
      ["Report and finding exports", "Create Markdown, single-file HTML, or PDF outputs. Customer-facing PDFs default to aggregate severity context; include detailed finding evidence only for authorized recipients."],
      ["Controlled secure shares", "Give a named recipient read-only access to selected findings through a password-protected, expiring, revocable link."],
      ["Disclosure tracking", "Preserve reported, acknowledged, fixed, advisory, bounty, credit, and closure milestones for external issues."],
      ["Audit history", "Show investigation stages, model resolution, human actors, outcomes, lifecycle changes, and reasons."],
      ["Branding and disclaimers", "Apply account and tier settings to customer-facing reports without rewriting historical evidence."],
    ],
    workflow: [
      ["Build", "Create evidence continuously through projects, scan versions, finding states, tickets, and retests."],
      ["Select", "Choose the exact assets, reports, sections, findings, and confidence boundary relevant to the request."],
      ["Review", "Remove irrelevant or sensitive context and confirm important findings have current decisions."],
      ["Deliver", "Export a static pack or use a time-bounded share, then revoke access when the review ends."],
    ],
    outcomes: [
      ["Faster assurance responses", "Answer customer, audit, investor, insurance, and internal governance requests from current product history."],
      ["Smaller disclosure surface", "Share selected findings instead of granting access to the workspace or sending the full internal report."],
      ["Defensible risk narratives", "Connect the technical issue to validation, ownership, mitigation, and retest rather than presenting a static scan snapshot."],
    ],
    faqs: [
      ["Does the Evidence Room prove compliance?", "No. It packages assessment evidence and history. Your organization still determines control scope, test frequency, reviewer requirements, and framework assertions."],
      ["Can a recipient see the rest of our scan?", "A secure share exposes only the selected findings. It does not grant the recipient access to the rest of the report, project, or account."],
      ["What is included in a PDF report?", "The default customer-facing PDF contains report context and aggregate severity counts without finding names or exploit details. An authorized operator can explicitly include detailed findings, evidence, branding, and disclaimers."],
    ],
    related: [["/use-cases/customer-security-reviews/", "Customer and audit evidence"], ["/use-cases/vulnerability-disclosure/", "Vulnerability disclosure"], ["/platform/security-operations/", "Security operations"]],
  },
];

const useCasePages = [
  {
    slug: "startup-security",
    title: "Security Operations for Startups and Growing Software Companies | ZeroQuarry",
    description: "Build a credible startup security program with AI security testing, vulnerability triage, remediation, retesting, and customer evidence before hiring a large team.",
    eyebrow: "Security for growing companies",
    h1: "Run product security before you can staff <em>every specialty.</em>",
    lede: "ZeroQuarry gives founders, engineering leaders, and lean security teams a repeatable way to assess releases, absorb external reports, drive fixes, and answer customer security questions.",
    image: "/assets/product/report-overview.png",
    imageAlt: "ZeroQuarry security report for a growing software company",
    proof: ["One product to a portfolio", "One operating record", "Human control points"],
    sectionTitle: "Security maturity should grow with the <em>company’s actual risk.</em>",
    sectionIntro: "A team establishing its first baseline needs visibility. A team managing recurring delivery, inbound reports, and multiple product owners needs consistent execution and traceable evidence. The loop is the same; depth and governance increase with the work.",
    capabilities: [
      ["Establish the baseline", "Map the core product, assess the main repository, validate important findings, and retain one reviewed evidence record."],
      ["Put security into delivery", "Add PR or scheduled coverage, route accepted findings into engineering, and operationalize external report intake."],
      ["Standardize decisions and evidence", "Apply consistent lifecycle states, adversarial review, repository controls, retests, and asset-level assurance evidence."],
      ["Human authorization", "Keep live-target authorization, accepted risk, external sharing, and production merge approval with accountable people."],
      ["Flexible model and data boundaries", "Use account defaults, bring-your-own provider keys, private Git credentials, and enterprise deployment controls as requirements mature."],
      ["Evidence from the work", "Let projects, audit history, finding decisions, and retests produce the record customers and auditors ask for later."],
    ],
    workflow: [
      ["Week 1", "Create the product map and complete a source baseline on the highest-value service."],
      ["Week 2", "Validate important findings, connect engineering handoff, and retest one fix."],
      ["Week 3", "Add CI or a schedule to one repository and tune a practical gating policy."],
      ["Week 4", "Assess a release artifact or staging target and prepare a reviewed evidence pack."],
    ],
    outcomes: [
      ["Coverage without immediate headcount", "Automate repeatable assessment and coordination while reserving human time for authorization, context, and risk decisions."],
      ["A buyer-ready security story", "Show how software is tested, how findings are handled, and how fixes are verified. A scanner inventory cannot answer those questions."],
      ["A program that can mature", "Start with one product loop and add controls, ownership, and evidence as the organization grows."],
    ],
    faqs: [
      ["Does ZeroQuarry replace a security leader?", "It automates substantial assessment and operations work, but it does not replace business accountability, live-testing authorization, risk ownership, or production change approval."],
      ["Where should a startup begin?", "Begin with the repository containing the most important customer data or trust boundary. Complete the full loop from assessment to validated decision to one verified fix before expanding coverage."],
      ["Can this support customer security reviews?", "Yes. Projects, reports, finding states, audit history, retests, and the Evidence Room make it easier to provide current, scoped assessment evidence."],
    ],
    related: [["/platform/security-operations/", "AI security operations"], ["/use-cases/customer-security-reviews/", "Customer and audit evidence"], ["/use-cases/release-security-review/", "Release security review"]],
  },
  {
    slug: "pr-security-review",
    title: "AI Pull Request Security Review and CI/CD Security Testing | ZeroQuarry",
    description: "Run AI pull request security reviews in GitHub Actions, focus on changed code, validate findings, open remediation work, and retest merged fixes.",
    eyebrow: "Pull request security review",
    h1: "Catch security regressions while the author still remembers <em>why the code changed.</em>",
    lede: "Trigger a ZeroQuarry source review from GitHub Actions, focus the investigation on the diff and adjacent data flow, then route validated results into tickets or reviewable fix pull requests.",
    image: "/assets/product/scheduled-rescan.png",
    imageAlt: "ZeroQuarry continuous security settings for changed-code reviews",
    proof: ["GitHub Actions", "Delta-aware review", "Non-blocking to gated rollout"],
    sectionTitle: "Make CI raise a <em>useful security signal.</em>",
    sectionIntro: "The best PR security process flags consequential changes early, preserves the report outside ephemeral CI logs, and escalates only when the risk justifies deeper work.",
    capabilities: [
      ["Risk-aware triggers", "Run on authentication, authorization, billing, tenant, upload, webhook, parser, networking, and release-branch changes."],
      ["Changed-code context", "Use Git history to focus agents on the diff while allowing investigation into callers, sinks, and business boundaries around it."],
      ["Explicit scan notes", "Tell ZeroQuarry what the change is meant to do, which boundary matters, and what failure would be consequential."],
      ["Adversarial review", "Challenge critical or expensive claims before asking engineering to stop the line."],
      ["Progressive gating", "Begin with visibility, then gate on the severity and confidence threshold your team has learned to operate."],
      ["Fix and retest", "Open tickets or bot-created PRs, preserve CI controls, and verify the finding after merge."],
    ],
    workflow: [
      ["Trigger", "Dispatch a source scan with the repository URL, project identity, notes, and auto-delta enabled."],
      ["Investigate", "Review changed files and follow nearby data flow into the product’s sensitive boundaries."],
      ["Validate", "Confirm evidence and product context before the result becomes a merge or release decision."],
      ["Close", "Route the fix, merge through normal controls, rescan, and record a verified retest."],
    ],
    outcomes: [
      ["Faster security feedback", "Review a risky change before context is spread across later releases and unrelated refactors."],
      ["Fewer disruptive gates", "Tune policy around validated findings instead of blocking on every model suggestion."],
      ["Persistent change history", "Keep scans, findings, discussions, fixes, and retests with the product project instead of losing them in an individual CI run."],
    ],
    faqs: [
      ["Can ZeroQuarry scan private GitHub repositories?", "Yes. Store a scoped Git credential in the account and reference its ID from the workflow. The generated workflow explains the setup."],
      ["What happens if the same scan is triggered twice?", "Identical in-progress Git dispatches can be deduplicated, returning the existing scan so CI can follow it instead of starting duplicate work."],
      ["Should auto-fix branches trigger another scan?", "Exclude the ZeroQuarryBot branch namespace from the scan trigger to avoid a feedback loop. The product and docs provide the branch filter."],
    ],
    related: [["/platform/continuous-security/", "Continuous application security"], ["/platform/remediation/", "AI vulnerability remediation"], ["/use-cases/release-security-review/", "Release security review"]],
  },
  {
    slug: "release-security-review",
    title: "Automated Release Security Review for SaaS, APIs, and Software | ZeroQuarry",
    description: "Review release source, shipped artifacts, and authorized staging behavior with AI penetration testing, adversarial validation, remediation, and evidence.",
    eyebrow: "Release security review",
    h1: "Make the release decision from the <em>product that will ship.</em>",
    lede: "Combine source review, binary analysis, and authorized staging tests in one project so release owners can see what changed, what survived validation, and what still requires action.",
    image: "/assets/product/report-overview.png",
    imageAlt: "ZeroQuarry release security report with validated findings",
    proof: ["Source baseline", "Shipped artifact", "Staging behavior"],
    sectionTitle: "One release can have <em>three different security truths.</em>",
    sectionIntro: "The repository shows intended behavior. The artifact shows packaging and embedded content. Staging shows how identity, routing, configuration, and network controls behave together.",
    capabilities: [
      ["Source review", "Assess the release branch or commit with notes about the changed trust boundaries and customer impact."],
      ["Artifact review", "Inspect the APK, JAR, installer, firmware, archive, or packaged output that will be delivered."],
      ["Authorized staging test", "Probe runtime behavior when exploitability depends on roles, tenants, gateway behavior, or deployment configuration."],
      ["Adversarial validation", "Pressure-test consequential findings before making a release, remediation, or disclosure decision."],
      ["Release handoff", "File accepted work, generate a candidate fix, or create an explicit accepted-risk decision with reason."],
      ["Evidence preservation", "Tag the release, retain the assessment versions, and export a reviewed record for the decision."],
    ],
    workflow: [
      ["Baseline", "Review source at the release candidate and identify important changes and inherited risk."],
      ["Verify artifact", "Assess the build output for packaging, manifest, secret, update, or decompilation-visible failures."],
      ["Exercise staging", "Test only the live behaviors that require deployment context and explicit authorization."],
      ["Decide", "Resolve critical and high findings, record exceptions, and preserve the evidence supporting promotion."],
    ],
    outcomes: [
      ["A clearer go/no-go decision", "Separate validated release risk from low-confidence claims and unrelated historical noise."],
      ["Coverage across the delivery chain", "Catch failures introduced by code, build, packaging, and runtime configuration."],
      ["A durable release record", "Keep the report, findings, exceptions, remediation, and retest aligned to the version that shipped."],
    ],
    faqs: [
      ["Do we need all three scan surfaces for every release?", "No. Use the surfaces that can change the decision. Source is the normal baseline; add binary or live testing when packaging or runtime behavior materially affects risk."],
      ["Can a release review use changed-code scanning?", "Yes, but a major release or significant architecture change may justify a broader source review. The right depth depends on change size, exposure, and prior baseline quality."],
      ["Can ZeroQuarry make the release decision automatically?", "ZeroQuarry provides assessment evidence, review signals, and traceable decisions. Your organization remains responsible for business context and final release authority."],
    ],
    related: [["/platform/security-testing/", "AI security testing"], ["/platform/adversarial-validation/", "Adversarial validation"], ["/use-cases/customer-security-reviews/", "Customer and audit evidence"]],
  },
  {
    slug: "inbound-vulnerability-reports",
    title: "Automated Vulnerability Report Intake and Security Email Triage | ZeroQuarry",
    description: "Forward researcher and customer vulnerability reports into bounded AI triage that maps targets, starts assessments, preserves evidence, and routes remediation.",
    eyebrow: "Inbound vulnerability reports",
    h1: "Turn a researcher email into <em>bounded assessment work.</em>",
    lede: "Project-specific inboxes, sender allowlists, approved repositories, remote-scan controls, and manual or automatic kickoff convert incoming reports into structured investigation without expanding scope silently.",
    image: "/assets/product/email-triage.png",
    imageAlt: "ZeroQuarry email triage settings with allowlists and project routing",
    proof: ["Project-specific inboxes", "Allowed senders and targets", "Manual or automatic kickoff"],
    sectionTitle: "A report can be missed. Its <em>context can disappear</em> too.",
    sectionIntro: "A report often arrives in one system, becomes a ticket in another, and turns into ad hoc testing somewhere else. ZeroQuarry keeps the original claim and the resulting assessment inside the owning product history.",
    capabilities: [
      ["Project routing", "Give each product project its own incoming address so reports land with the correct asset history."],
      ["Sender allowlists", "Process exact researchers, partner addresses, or trusted domains instead of creating an open public trigger."],
      ["Repository boundaries", "List the GitHub repositories the triage model may select for each project."],
      ["Remote-scan control", "Keep live-target testing disabled unless that project has an explicit and stable authorization boundary."],
      ["Review before kickoff", "Start with automatic dispatch off so operators can inspect proposed target, scan type, and notes."],
      ["Connected remediation", "Validate resulting findings, record the decision, route ownership, and create a controlled share or disclosure when appropriate."],
    ],
    workflow: [
      ["Receive", "Forward the report to the assigned project inbox from an allowed sender."],
      ["Resolve", "The triage model identifies target, scan type, and useful notes inside the configured boundary."],
      ["Assess", "An operator approves the work or the project starts it automatically after the rules are trusted."],
      ["Respond", "Validate findings, route remediation, and track the external communication when needed."],
    ],
    outcomes: [
      ["Faster time to technical assessment", "Reduce the manual translation between an external claim and a scoped reproduction plan."],
      ["Safer automation boundary", "Constrain what an untrusted email can cause the platform to investigate."],
      ["One connected record", "Keep intake, findings, decisions, remediation, and disclosure with the product that owns the risk."],
    ],
    faqs: [
      ["Can anyone email the inbox?", "Only messages routed to an active project address and matching an exact sender or allowed domain are processed."],
      ["Can the email tell ZeroQuarry to scan another repository?", "The model can only resolve repositories listed for that project. Reports that cannot map safely are surfaced for review instead of expanding the boundary."],
      ["How should we tune report intake?", "Begin with exact sender addresses and one approved repository. Matching reports start after those checks, so keep the boundary narrow and expand it only after target matching behaves as expected."],
    ],
    related: [["/platform/security-operations/", "AI security operations"], ["/use-cases/vulnerability-disclosure/", "Vulnerability disclosure"], ["/platform/adversarial-validation/", "Adversarial validation"]],
  },
  {
    slug: "customer-security-reviews",
    title: "Customer Security Review and Audit Evidence Automation | ZeroQuarry",
    description: "Answer customer security reviews and audit evidence requests with current asset reports, pentest PDFs, controlled finding shares, audit history, and retests.",
    eyebrow: "Customer and audit evidence",
    h1: "Answer “when was this tested?” with <em>current evidence.</em>",
    lede: "ZeroQuarry turns routine security work into asset-level assurance material: latest reports, validated findings, decision history, remediation evidence, retests, and controlled external delivery.",
    image: "/assets/product/evidence-room.png",
    imageAlt: "ZeroQuarry Evidence Room for customer security and audit reviews",
    proof: ["Latest evidence by asset", "Combined PDF packs", "Expiring recipient shares"],
    sectionTitle: "Customer trust is easier when evidence is <em>continuously produced.</em>",
    sectionIntro: "The strongest assurance response comes from an operating process that already knows what was assessed, what was found, who decided, what changed, and whether the fix was retested.",
    capabilities: [
      ["Asset inventory view", "Start from the actual repository, URL, upload, or path and see the latest report and finding counts."],
      ["Evidence packs", "Select the assets in scope and combine the latest reports into a branded penetration test PDF."],
      ["Narrow secure sharing", "Give a named recipient selected findings without exposing the rest of the workspace."],
      ["Finding decisions", "Distinguish candidate, validated, disputed, mitigated, retested, accepted-risk, and archived outcomes."],
      ["Audit history", "Show the actors, analysis stages, models, results, and reasons behind the assessment and decisions."],
      ["Disclosure timelines", "Provide the coordinated history for issues reported externally when that is part of the request."],
    ],
    workflow: [
      ["Scope", "Identify the products and assets the customer, auditor, investor, or insurer actually needs."],
      ["Check freshness", "Review completion dates, scan depth, important finding states, and whether the evidence meets the request."],
      ["Prepare", "Select the narrowest report, evidence pack, or finding share and remove irrelevant sensitive context."],
      ["Deliver", "Send a reviewed static artifact or expiring share and revoke access when the review ends."],
    ],
    outcomes: [
      ["Shorter sales-security cycles", "Respond with organized product evidence instead of assembling screenshots and tickets from several systems."],
      ["A smaller disclosure surface", "Give external reviewers exactly the findings and assets they are entitled to see."],
      ["More credible answers", "Connect assessment activity to ownership, remediation, accepted risk, and retest rather than presenting a scanner badge."],
    ],
    faqs: [
      ["Can ZeroQuarry answer security questionnaires automatically?", "ZeroQuarry provides assessment evidence and operating history that support questionnaire answers. It does not invent control assertions or decide what your organization should claim."],
      ["How current is an Evidence Room export?", "It selects the latest available report for each chosen target. Review dates and assessment depth before treating the pack as current for a specific control."],
      ["Can we revoke customer access?", "Yes. Secure finding shares have expiry, password protection, access history, and immediate revocation."],
    ],
    related: [["/platform/evidence-reporting/", "Security evidence and reporting"], ["/use-cases/startup-security/", "Security for growing companies"], ["/use-cases/release-security-review/", "Release security review"]],
  },
  {
    slug: "vulnerability-disclosure",
    title: "AI-Assisted Vulnerability Disclosure and Researcher Report Management | ZeroQuarry",
    description: "Validate vulnerability disclosures, generate proof and draft reports, share findings securely, track vendor timelines, and preserve remediation evidence.",
    eyebrow: "Vulnerability disclosure",
    h1: "Move from an external claim to a <em>defensible disclosure.</em>",
    lede: "Validate exploitability, challenge weak claims, prepare reviewed proof and disclosure language, share only what the recipient needs, and retain the complete coordination timeline.",
    image: "/assets/product/share-create.png",
    imageAlt: "ZeroQuarry secure vulnerability finding share controls",
    proof: ["HackerOne context", "Proof and disclosure drafts", "Disclosure timeline"],
    sectionTitle: "External reporting needs a higher evidence bar than <em>internal suspicion.</em>",
    sectionIntro: "A vendor, researcher, or bounty program needs a reproducible claim, clear affected scope, and a controlled communication trail. Raw model output is not enough.",
    capabilities: [
      ["Disclosure-quality evidence", "Review source, impact, reproduction, affected versions, and PoC before sending the claim outside the workspace."],
      ["Adversarial review", "Use a vendor-style challenge and researcher rebuttal to expose weak assumptions before the real counterparty does."],
      ["HackerOne eligibility context", "Label findings against common core-ineligible categories without silently deleting or downgrading them."],
      ["Draft disclosure language", "Generate a starting email or report, then review the technical claims and recipient context manually."],
      ["Controlled shares", "Deliver selected findings through password-protected, expiring, revocable read-only links."],
      ["Timeline tracking", "Record report, acknowledgement, fix, advisory, bounty, credit, notes, and closure events."],
    ],
    workflow: [
      ["Validate scope", "Confirm authorization, program rules, affected asset, and whether the issue is real in context."],
      ["Strengthen evidence", "Reproduce safely, challenge the finding, and resolve contradictory review signals."],
      ["Prepare disclosure", "Review PoC, impact, affected versions, mitigation, and the draft communication."],
      ["Coordinate", "Share narrowly, track milestones, verify the fix, and close the record when appropriate."],
    ],
    outcomes: [
      ["Fewer weak external reports", "Challenge non-exploitability, environment mismatch, scope, and evidence gaps before disclosure."],
      ["Safer coordination", "Control what leaves the account and how long the recipient can access it."],
      ["A complete disclosure record", "Keep technical evidence, communication milestones, remediation, retest, bounty, and credit together."],
    ],
    faqs: [
      ["Does ZeroQuarry send disclosure emails automatically?", "It can generate draft language and send controlled share invitations, but disclosure claims and recipient details should be reviewed by a human before delivery."],
      ["Does HackerOne review decide whether we should disclose?", "No. It adds context about common eligibility categories. Program rules, authorization, impact, and the evidence still determine the decision."],
      ["Can vendors respond inside a share?", "Shares are read-only. Use your normal coordination channel for responses and record important milestones in the disclosure timeline."],
    ],
    related: [["/platform/adversarial-validation/", "Adversarial validation"], ["/platform/evidence-reporting/", "Evidence and reporting"], ["/use-cases/inbound-vulnerability-reports/", "Inbound vulnerability reports"]],
  },
];

function renderCards(items, className = "capability-grid") {
  return `<div class="${className}">${items.map((item, index) => `<article class="capability-card">
    <div class="card-code">${String(index + 1).padStart(2, "0")}</div>
    <h3>${escapeHtml(item[0])}</h3>
    <p>${escapeHtml(item[1])}</p>
  </article>`).join("\n")}</div>`;
}

function renderWorkflow(items) {
  return `<div class="workflow-grid">${items.map((item, index) => `<article class="workflow-card">
    <span>STEP ${String(index + 1).padStart(2, "0")}</span>
    <h3>${escapeHtml(item[0])}</h3>
    <p>${escapeHtml(item[1])}</p>
  </article>`).join("\n")}</div>`;
}

function renderFaqs(faqs) {
  return `<div class="faq-list">${faqs.map((faq) => `<details>
    <summary>${escapeHtml(faq[0])}</summary>
    <p>${escapeHtml(faq[1])}</p>
  </details>`).join("\n")}</div>`;
}

function renderRelated(related) {
  return `<div class="related-grid">${related.map(([href, label]) => `<a class="related-card" href="${href}">
    <div class="card-code">Continue</div>
    <h3>${escapeHtml(label)}</h3>
    <span class="card-link">Explore <span aria-hidden="true">-&gt;</span></span>
  </a>`).join("\n")}</div>`;
}

const motionVisuals = {
  "platform-overview": {
    label: "security-ops://product-loop",
    title: "Product security coordinator",
    detail: "One record from intake through evidence",
    inputs: [["RECEIVE", "PR, schedule, report"], ["ASSESS", "source, binary, live"], ["VALIDATE", "proof and challenge"]],
    outputs: [["REMEDIATE", "patch, PR, ticket"], ["RETEST", "verified or regressed"], ["PROVE", "report and evidence"]],
    foot: "risk decisions and production authority stay with your team",
    aria: "Animated flow from security intake and assessment through remediation, retesting, and evidence",
  },
  "use-case-router": {
    label: "workflow://decision-router",
    title: "Start with the decision",
    detail: "ZeroQuarry assembles the right security workflow",
    inputs: [["MERGE", "risky pull request"], ["SHIP", "release candidate"], ["RESPOND", "researcher or customer"]],
    outputs: [["DECISION", "evidence reviewed"], ["ACTION", "owner and fix path"], ["PROOF", "retest and report"]],
    foot: "the workflow changes with the decision, the operating record does not",
    aria: "Animated router mapping product-security triggers to decisions, action, and evidence",
  },
  "security-testing": {
    label: "assessment://surface-map",
    title: "Multi-surface assessment",
    detail: "Follow risk across build and runtime boundaries",
    inputs: [["SOURCE", "auth/middleware.ts"], ["BINARY", "release/app.apk"], ["LIVE", "api.product.com"]],
    outputs: [["FINDING", "cross-tenant read"], ["PROOF", "request replay"], ["SCOPE", "product / release 42"]],
    foot: "the target surface changes, the evidence standard stays the same",
    aria: "Animated assessment of source code, a release binary, and a live application producing a finding and proof",
  },
  "adversarial-validation": {
    label: "review://claim-challenge",
    title: "Skeptical finding review",
    detail: "A separate reviewer tries to break the claim",
    inputs: [["CLAIM", "tenant boundary bypass"], ["CONTEXT", "role and deployment state"], ["PROOF", "reproduction request"]],
    outputs: [["VERDICT", "sustained"], ["CONFIDENCE", "0.91"], ["DECISION", "ready for owner"]],
    foot: "severity says how bad; confidence says how likely the claim is to hold",
    aria: "Animated adversarial validation of a vulnerability claim using context and proof",
  },
  "continuous-security": {
    label: "automation://change-review",
    title: "Continuous review coordinator",
    detail: "Use the smallest useful scope for each trigger",
    inputs: [["PULL REQUEST", "PR 248 / 7 files"], ["SCHEDULE", "nightly baseline"], ["RELEASE", "candidate 1.14.0"]],
    outputs: [["CHECK", "focused review"], ["HISTORY", "lineage v12"], ["SIGNAL", "actionable change"]],
    foot: "delta review keeps routine coverage fast without losing the baseline",
    aria: "Animated pull-request, scheduled, and release security reviews producing checks and product history",
  },
  "security-operations": {
    label: "operations://intake-route",
    title: "Finding operations",
    detail: "Resolve the target, validate the claim, assign the work",
    inputs: [["INBOX", "researcher report"], ["API", "scan finding"], ["HUMAN", "manual escalation"]],
    outputs: [["STATE", "validated"], ["OWNER", "platform team"], ["TICKET", "SEC-194"]],
    foot: "every handoff keeps the original evidence and decision history",
    aria: "Animated security report intake flowing to validation, ownership, and an engineering ticket",
  },
  remediation: {
    label: "remediation://controlled-change",
    title: "Patch staging and retest",
    detail: "Generate the change without taking merge authority",
    inputs: [["FINDING", "ZQ-2042"], ["POLICY", "deny-list and diff cap"], ["REPO", "enrolled branch"]],
    outputs: [["PATCH", "+12 / -3 lines"], ["REVIEW", "human approval"], ["RETEST", "verified"]],
    foot: "repository access, approval, CI, and merge controls remain yours",
    aria: "Animated remediation flow from a validated finding through a controlled patch, review, and retest",
  },
  "private-execution": {
    label: "execution://private-pool",
    title: "Customer-controlled runner",
    detail: "Source and internal-target assessment",
    inputs: [["GIT", "private repository"], ["INTERNAL", "service.private"], ["POLICY", "minimized results"]],
    outputs: [["FINDING", "metadata returned"], ["EVIDENCE", "retained locally"], ["AUDIT", "attempt recorded"]],
    foot: "outbound HTTPS only · no automatic cloud fallback",
    aria: "Animated private runner processing a private Git repository and internal target while retaining detailed evidence locally",
  },
  "evidence-reporting": {
    label: "evidence://current-state",
    title: "Evidence room assembly",
    detail: "Build the answer from the live product history",
    inputs: [["ASSESSMENT", "release 1.14"], ["DECISION", "accepted and owned"], ["RETEST", "fix verified"]],
    outputs: [["REPORT", "customer-ready PDF"], ["SHARE", "password + expiry"], ["ANSWER", "current control story"]],
    foot: "the evidence comes from operating work, not a last-minute document hunt",
    aria: "Animated evidence assembly from an assessment, decision, and retest into a report and controlled share",
  },
  "startup-security": {
    label: "startup://security-baseline",
    title: "Lean security baseline",
    detail: "Cover the product before staffing every specialty",
    inputs: [["REPOSITORY", "main product"], ["RELEASE", "current build"], ["PRESSURE", "first enterprise buyer"]],
    outputs: [["PRIORITY", "top product risk"], ["FIX", "owner and patch"], ["EVIDENCE", "buyer-ready history"]],
    foot: "begin with one product boundary and expand as the company grows",
    aria: "Animated startup security baseline producing prioritized risk, a fix, and customer evidence",
  },
  "pr-security-review": {
    label: "pull-request://focused-review",
    title: "Change-scoped security review",
    detail: "Investigate the code that moved while context is fresh",
    inputs: [["DIFF", "7 changed files"], ["CONTEXT", "tenant billing path"], ["BASELINE", "last completed scan"]],
    outputs: [["CHECK", "review complete"], ["FINDING", "1 validated issue"], ["PATCH", "proposal ready"]],
    foot: "one focused review consumes one security run",
    aria: "Animated pull-request review using a code diff, product context, and the last baseline",
  },
  "release-security-review": {
    label: "release://promotion-gate",
    title: "Release security review",
    detail: "Compare what was written, packaged, and deployed",
    inputs: [["SOURCE", "release branch"], ["ARTIFACT", "signed package"], ["STAGING", "authorized target"]],
    outputs: [["RISK", "release decision"], ["ACTION", "fix before promote"], ["REPORT", "release evidence"]],
    foot: "surface differences stay attached to the same release decision",
    aria: "Animated release review across source, a packaged artifact, and a staging environment",
  },
  "inbound-vulnerability-reports": {
    label: "incoming://report-triage",
    title: "Bounded report intake",
    detail: "Turn an email into scoped, reviewable security work",
    inputs: [["SENDER", "approved researcher"], ["REPORT", "forwarded email"], ["ATTACHMENT", "proof and logs"]],
    outputs: [["TARGET", "project resolved"], ["VERDICT", "claim validated"], ["RESPONSE", "coordinated reply"]],
    foot: "sender, project, target, and authorization boundaries are checked first",
    aria: "Animated inbound vulnerability report triage from an approved sender to validation and response",
  },
  "customer-security-reviews": {
    label: "assurance://customer-answer",
    title: "Current assurance evidence",
    detail: "Answer from product history instead of rebuilding it",
    inputs: [["PROJECT", "covered assets"], ["DECISIONS", "risk and ownership"], ["RETESTS", "verified fixes"]],
    outputs: [["SUMMARY", "current posture"], ["REPORT", "evidence package"], ["SHARE", "controlled access"]],
    foot: "the answer stays current because it is built during normal security work",
    aria: "Animated customer assurance workflow assembling project coverage, decisions, and retests",
  },
  "vulnerability-disclosure": {
    label: "disclosure://coordinated-case",
    title: "Coordinated disclosure case",
    detail: "Keep proof, communication, remediation, and timing together",
    inputs: [["CLAIM", "reproducible issue"], ["CONTACT", "vendor channel"], ["TIMELINE", "embargo agreed"]],
    outputs: [["FIX", "maintainer patch"], ["VERIFY", "retest passed"], ["PUBLISH", "coordinated writeup"]],
    foot: "publication follows verification and the agreed coordination window",
    aria: "Animated vulnerability disclosure workflow from a claim and timeline through fix, retest, and publication",
  },
  "open-source": {
    label: "maintainer://report-queue",
    title: "Maintainer triage loop",
    detail: "Check the claim before it becomes project work",
    inputs: [["REPORT", "scanner-generated claim"], ["REPOSITORY", "public source"], ["CONTEXT", "maintainer boundaries"]],
    outputs: [["VERDICT", "validated or disputed"], ["RETEST", "resolution checked"], ["RECORD", "evidence retained"]],
    foot: "one bounded workflow from incoming claim to maintainer decision",
    aria: "Animated open-source maintainer workflow validating a scanner report against public source and retaining the decision",
  },
};

function renderMotionVisual(key) {
  const visual = motionVisuals[key] || motionVisuals["platform-overview"];
  const renderNodes = (nodes, className) => `<div class="motion-column ${className}">${nodes.map(([label, value], index) => `<div class="motion-node" style="--node-delay:${index * 1.15}s"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`;
  return `<div class="motion-system motion-${key}" role="img" aria-label="${escapeHtml(visual.aria)}">
    <div class="motion-head"><span>${escapeHtml(visual.label)}</span><span class="motion-live">processing</span></div>
    <div class="motion-canvas">
      <div class="motion-grid" aria-hidden="true"></div><div class="motion-scanline" aria-hidden="true"></div>
      ${renderNodes(visual.inputs, "motion-inputs")}
      <div class="motion-rail rail-in" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="motion-core"><small>ZEROQUARRY</small><strong>${escapeHtml(visual.title)}</strong><span>${escapeHtml(visual.detail)}</span><b>active</b></div>
      <div class="motion-rail rail-out" aria-hidden="true"><i></i><i></i><i></i></div>
      ${renderNodes(visual.outputs, "motion-outputs")}
    </div>
    <div class="motion-foot"><span class="pulse-dot"></span><span>${escapeHtml(visual.foot)}</span></div>
  </div>`;
}

function renderDetail(page, type) {
  const isPlatform = type === "platform";
  const baseLabel = isPlatform ? "Platform" : "Use cases";
  const baseHref = isPlatform ? "/platform" : "/use-cases/";
  const canonicalPath = isPlatform ? `/platform/${page.slug}/` : `/use-cases/${page.slug}/`;
  const signupUrl = page.ctaHref || signupBySlug[page.slug] || signupUrls.general;
  const signupLabel = page.ctaLabel || "Start free trial";
  const faqs = page.faqs.map(([q, a]) => ({ q, a }));
  const schemas = [
    breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: baseLabel, href: baseHref }, { name: page.eyebrow, href: canonicalPath }]),
    faqData(faqs),
  ];

  const body = `<main class="marketing-main">
  <section class="buyer-hero detail-hero">
    <div class="container">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">ZeroQuarry</a><span>/</span><a href="${baseHref}">${baseLabel}</a><span>/</span><span>${escapeHtml(page.eyebrow)}</span></nav>
      <div class="buyer-hero-grid">
        <div>
          <div class="buyer-kicker">${escapeHtml(page.eyebrow)}</div>
          <h1 class="buyer-title detail-title">${page.h1}</h1>
          <p class="buyer-lede">${escapeHtml(page.lede)}</p>
          <div class="buyer-actions">
            <a class="btn btn-primary" href="${signupUrl}">${escapeHtml(signupLabel)} <span class="arr">-&gt;</span></a>
            <a class="btn btn-ghost" href="${escapeHtml(page.docsHref || "https://docs.zeroquarry.com")}">Read the documentation</a>
          </div>
          <div class="buyer-proofline">${page.proof.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        </div>
        ${renderMotionVisual(page.slug)}
      </div>
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Capabilities</div><h2>${page.sectionTitle}</h2></div><p class="section-intro">${escapeHtml(page.sectionIntro)}</p></div>
      ${renderCards(page.capabilities)}
    </div>
  </section>

  <section class="buyer-section">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">How it runs</div><h2>A concrete path through the work.</h2></div><p class="section-intro">ZeroQuarry automates investigation and coordination. Your team keeps control of authorization, risk ownership, and production changes.</p></div>
      ${renderWorkflow(page.workflow)}
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Operational result</div><h2>What the team gets back.</h2></div><p class="section-intro">Useful coverage should lead to faster decisions, cleaner remediation, and evidence that holds up when someone asks for it later.</p></div>
      <div class="outcome-grid">${page.outcomes.map(([title, text]) => `<article class="outcome-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("\n")}</div>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Details</div><h2>Questions that come up in evaluation.</h2></div><p class="section-intro">These are the product boundaries, controls, and operating details teams usually want to understand first.</p></div>
      ${renderFaqs(page.faqs)}
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Related workflows</div><h2>Continue through the <em>operating loop.</em></h2></div></div>
      ${renderRelated(page.related)}
    </div>
  </section>

  ${renderCta(
    page.finalCtaTitle || "Start with one real security boundary.",
    page.finalCtaText || "Use the free trial on your own product, then decide whether the resulting security work is useful enough to keep.",
    page.slug === "private-execution"
      ? signupUrl.replace("utm_content=hero", "utm_content=final-cta")
      : signupUrl
  )}
  </main>`;

  return layout({ title: page.title, description: page.description, canonical: `${siteUrl}${canonicalPath}`, active: type === "platform" ? "platform" : "use-cases", body, schemas });
}

function renderCta(title, text, signupUrl = signupUrls.general, label = "Start free trial") {
  return `<section class="buyer-cta"><div class="container"><div class="buyer-cta-panel"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></div><div class="buyer-actions"><a class="btn btn-primary" href="${signupUrl}">${escapeHtml(label)} <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/request-scan/">Talk to us</a></div></div></div></section>`;
}

function homePage() {
  const schemas = [{
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ZeroQuarry",
    url: `${siteUrl}/`,
  }, {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ZeroQuarry",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    description: "AI security operations for application security testing, vulnerability validation, remediation, retesting, and evidence reporting.",
    url: `${siteUrl}/platform`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", category: "free trial" },
  }, {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZeroQuarry",
    url: `${siteUrl}/`,
    logo: `${siteUrl}/assets/wordmark.png`,
    sameAs: ["https://www.linkedin.com/company/zeroquarry/", "https://github.com/ZeroQuarry/"],
  }];

  const body = `<main class="marketing-main">
  <section class="buyer-hero">
    <div class="container buyer-hero-grid">
      <div>
        <div class="buyer-kicker">Design Partner Pentest Offer · 10 teams · through August 31</div>
        <h1 class="buyer-title">Find a novel security issue or get the <em>$2,000 platform fee back.</em></h1>
        <p class="buyer-lede">Scope one authorized product boundary. ZeroQuarry runs the security assessment, challenges the findings, and produces a penetration test report. If your technical reviewer finds no previously unknown, valid security result worth recording, ZeroQuarry reimburses the entire platform fee; model-token costs remain yours.</p>
        <div class="buyer-actions"><a class="btn btn-primary" href="${foundingCohortPath}?utm_source=homepage&utm_medium=owned-site&utm_campaign=design-partner-pentest-2026&utm_content=hero">Apply for one of 10 evaluations <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="${signupUrls.general}?utm_source=zeroquarry.com&utm_medium=owned-site&utm_campaign=self-serve-trial&utm_content=homepage-hero">Start self-serve trial</a></div>
        <div class="buyer-proofline"><span>$2,000 platform fee</span><span>Token cost separate</span><span>Full fee-back outcome guarantee</span></div>
      </div>
      <div class="console buyer-live-console" aria-label="Illustrative adversarial vulnerability review">
        <div class="console-head"><span class="traffic"><span class="r"></span><span class="y"></span><span class="g"></span></span><span class="console-title"><span class="tbl">example://</span>red-vs-vendor · target=<span class="amber">billing-api</span></span><span class="console-meta"><span class="live">illustrative</span></span></div>
        <div class="console-body" id="zq-debate-body"><div class="line sys"><div class="ts">14:02:01</div><div class="agent">SYSTEM</div><div class="msg">review opened for billing-api</div></div><div class="line red"><div class="ts">14:02:05</div><div class="agent">RED</div><div class="msg">tracing tenant ownership into invoice update</div></div><div class="line blue"><div class="ts">14:02:11</div><div class="agent">VENDOR</div><div class="msg">challenge: prove the route lacks an earlier ownership check</div></div></div>
        <div class="console-foot"><span class="chip">RED TEAM</span><span class="chip blue">VENDOR REVIEW</span><span class="sp"></span><span id="zq-debate-verdict">review in progress</span></div>
      </div>
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">The buying moments</div><h2>Security becomes urgent in <em>recognizable moments.</em></h2></div><p class="section-intro">ZeroQuarry starts with the decisions buyers actually face. Scanner categories come later.</p></div>
      <div class="moment-grid">
        ${[["Open-source report queue", "AI scanners create more low-context claims than maintainers have time to validate.", "/open-source/"], ["Enterprise deal", "A buyer asks for current test evidence and how findings are remediated.", "/use-cases/customer-security-reviews/"], ["Risky release", "A change crosses identity, tenant, billing, upload, webhook, or runtime boundaries.", "/use-cases/release-security-review/"], ["Researcher report", "An external claim arrives and someone must resolve the target, reproduce it, and respond.", "/use-cases/inbound-vulnerability-reports/"], ["Fast-moving codebase", "Security review must happen in PR and scheduled workflows without becoming a noisy gate.", "/use-cases/pr-security-review/"], ["Lean security team", "The company needs real coverage before it can hire every AppSec and security-operations specialty.", "/use-cases/startup-security/"]].map(([title, text, href], index) => `<a class="moment-card" href="${href}"><div class="card-code">0${index + 1}</div><h3>${title}</h3><p>${text}</p><span class="card-link">See the workflow <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}
      </div>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">One operating loop</div><h2>From trigger to <em>verified outcome.</em></h2></div><p class="section-intro">Point tools find alerts. ZeroQuarry connects the security work that begins before the alert and continues after the report.</p></div>
      <div class="operation-rail">
        ${[["Receive", "Change, schedule, API, or report"], ["Assess", "Source, binary, or live target"], ["Validate", "Proof, challenge, rebuttal"], ["Decide", "State, reason, accountable owner"], ["Remediate", "Patch, PR, Jira, ServiceNow"], ["Retest", "Mitigated, verified, or regression"], ["Prove", "Reports, shares, Evidence Room"]].map(([title, text], index) => `<div class="operation-step"><small>0${index + 1}</small><h3>${title}</h3><p>${text}</p></div>`).join("\n")}
      </div>
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Platform</div><h2>Six capabilities. One <em>security record.</em></h2></div><p class="section-intro">Use the whole loop or begin with the security motion creating the most operational drag today.</p></div>
      <div class="capability-grid">
        ${platformPages.map((page, index) => `<a class="capability-card" href="/platform/${page.slug}/"><div class="card-code">0${index + 1} / Platform</div><h3>${escapeHtml(page.eyebrow)}</h3><p>${escapeHtml(page.description)}</p><span class="card-link">Explore capability <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}
      </div>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container split-proof">
      <div class="proof-copy"><div class="section-label">Why the workflow matters</div><h2>AI speed needs an <em>evidence bar.</em></h2><p>Autonomous pentesting is becoming a crowded claim. ZeroQuarry’s differentiation is what happens around the model: separate investigator and reviewer roles, human lifecycle decisions, controlled remediation, retesting, and evidence that remains useful after the scan finishes.</p><div class="proof-list"><div><span>01</span><p>Severity describes impact. Confidence describes whether the claim is likely to survive review.</p></div><div><span>02</span><p>Disputed and accepted-risk decisions retain reasons instead of disappearing from the record.</p></div><div><span>03</span><p>Generated fixes remain proposals under repository access, approval, CI, and merge controls.</p></div></div><a class="card-link" href="/platform/adversarial-validation/">How adversarial validation works <span aria-hidden="true">-&gt;</span></a></div>
      <figure class="product-frame"><img src="/assets/product/finding-detail.png" alt="ZeroQuarry finding with evidence, review state, and decision controls" width="1440" height="1000" loading="lazy"></figure>
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Use cases</div><h2>Start from the decision <em>in front of you.</em></h2></div><p class="section-intro">Each playbook combines the relevant assessment, review, remediation, and evidence capabilities into an operating outcome.</p></div>
      <div class="use-case-grid"><a class="use-case-card" href="/open-source/"><div class="card-code">OSS / Use case</div><h3>Open source maintainers</h3><p>Validate noisy vulnerability reports against public source and keep the maintainer decision attached to the evidence.</p><span class="card-link">See the program <span aria-hidden="true">-&gt;</span></span></a>${useCasePages.map((page, index) => `<a class="use-case-card" href="/use-cases/${page.slug}/"><div class="card-code">0${index + 1} / Use case</div><h3>${escapeHtml(page.eyebrow)}</h3><p>${escapeHtml(page.description)}</p><span class="card-link">See the playbook <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}</div>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container split-proof">
      <div class="proof-copy"><div class="section-label">Research-backed</div><h2>Built where real vulnerability reports <em>land.</em></h2><p>ZeroQuarry’s workflows come from finding, validating, coordinating, and fixing real product vulnerabilities. That work shapes the product more than generic scanner patterns do.</p><div class="proof-list"><div><span>RCE</span><p>Published coordinated research on exploitable plugin and extension ecosystems.</p></div><div><span>15Y</span><p>Security leadership and vulnerability-triage experience across Elastic, Kong, and Vectara.</p></div><div><span>LOOP</span><p>Validated research patterns feed future prompts, coverage, report language, and evidence structure.</p></div></div><a class="card-link" href="/research/">Read ZeroQuarry research <span aria-hidden="true">-&gt;</span></a></div>
      <div class="hero-system"><div class="system-head"><span>research://evidence</span><span class="system-status">coordinated</span></div><div class="loop-map"><div class="loop-node wide"><span>CLAIM</span><strong>Opening untrusted Markdown reaches executable behavior</strong><p>Trace the plugin path, prove reachability, and identify the affected configuration.</p></div><div class="loop-node"><span>CHALLENGE</span><strong>Is execution actually reachable?</strong><p>Test default state, permissions, versions, and realistic user action.</p></div><div class="loop-node"><span>OUTCOME</span><strong>Fix, disclose, publish</strong><p>Coordinate the maintainer response before turning the finding into public research.</p></div></div><div class="system-foot"><span class="pulse-dot"></span><span>public writeups follow responsible disclosure</span></div></div>
    </div>
  </section>
  ${renderCta("Ten design-partner evaluations. One falsifiable promise.", "Pay $2,000 plus model-token cost for one scoped assessment and report. If your reviewer identifies no previously unknown, valid security result worth recording, ZeroQuarry reimburses the entire platform fee.", `${foundingCohortPath}?utm_source=homepage&utm_medium=owned-site&utm_campaign=design-partner-pentest-2026&utm_content=final-cta`, "See the guaranteed offer")}
  </main>`;

  return layout({ title: "AI Security Operations for Product Teams | ZeroQuarry", description: "ZeroQuarry is an AI security operations platform for continuous application security testing, vulnerability validation, remediation, retesting, and customer evidence.", canonical: `${siteUrl}/`, active: "home", body, schemas });
}

function foundingSecurityCohortPage() {
  const guaranteeFaqs = [
    ["What earns the $2,000 reimbursement?", "At the final review, if the designated technical reviewer cannot identify at least one previously unknown, valid security issue or materially new security-relevant insight worth recording, ZeroQuarry reimburses the entire $2,000 platform fee. Findings disclosed as known at kickoff do not satisfy the guarantee."],
    ["What does not get reimbursed?", "Model-token costs are paid directly through your provider key or under a written hosted-usage cap and are not reimbursed. Testing that cannot complete because access, authorization, or required review participation was withdrawn is handled under the written scope rather than the outcome guarantee."],
    ["Can the report support SOC 2, ISO 27001, and customer reviews?", "Yes. The report records the tested scope, methodology, findings, evidence, decisions, remediation, and retest status needed for security and compliance review. Any organization-specific report requirements are captured during scoping."],
    ["What is in scope?", "One written, authorized product boundary agreed before payment: a repository or coherent codebase, a release artifact, or an application/API target. Scope, access, model choice, token budget, success test, and report audience are recorded before testing starts."],
  ];
  const body = `<main class="marketing-main">
  <section class="buyer-hero">
    <div class="container buyer-hero-grid">
      <div>
        <div class="buyer-kicker">Design Partner Pentest Offer · through August 31</div>
        <h1 class="buyer-title">Find a novel security issue or get the <em>$2,000 platform fee back.</em></h1>
        <p class="buyer-lede">For software teams whose audit, customer, or security program calls for a penetration test. Scope one authorized product boundary, run a ZeroQuarry assessment, validate the results with your technical reviewer, and receive the penetration test report.</p>
        <div class="buyer-actions"><a class="btn btn-primary" href="${foundingCohortApplication}">Apply for one of 10 evaluations <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="#guarantee">Read the guarantee</a></div>
        <div class="buyer-proofline"><span>$2,000 platform fee</span><span>Model tokens separate</span><span>Full fee-back outcome guarantee</span></div>
      </div>
      <div class="hero-system" aria-label="Design partner security assessment operating plan">
        <div class="system-head"><span>design-partner://guaranteed-outcome</span><span class="system-status">10 places</span></div>
        <div class="loop-map">
          <div class="loop-node wide"><span>SCOPE</span><strong>One product boundary</strong><p>Choose an authorized repository, release, binary, or application and define what a useful result must change.</p></div>
          <div class="loop-node"><span>TEST</span><strong>Investigate and challenge</strong><p>Run the assessment, pressure-test claims, and keep weak results out of the report.</p></div>
          <div class="loop-node"><span>PROVE</span><strong>Review and report</strong><p>Record what is valid, novel, actionable, or rejected and generate the final evidence package.</p></div>
        </div>
        <div class="system-foot"><span class="pulse-dot"></span><span>10 accepted scopes or applications through August 31, 2026</span></div>
      </div>
    </div>
  </section>

  <section class="buyer-section soft" id="cohort-scope">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">The outcome</div><h2>Not another scanner trial that ends with <em>an alert queue.</em></h2></div><p class="section-intro">The cohort is designed around completed security work. The scan is the beginning, not the deliverable.</p></div>
      ${renderCards([
        ["Scope one real boundary", "Select one product and agree the code, artifact, live target, authorization, and business context that make the evaluation credible."],
        ["Run the assessment", "Investigate the product with deterministic candidates and AI agents, then preserve the source, reasoning, evidence, and project history."],
        ["Challenge the claims", "Use separate adversarial review, proof, and human disposition so weak results do not quietly become engineering work."],
        ["Review what is novel", "Have your designated technical reviewer distinguish newly discovered, valid results from known issues, rejected claims, and low-value observations."],
        ["Retest the result", "Verify whether remediation changed the original risk and keep regressions or unresolved decisions visible."],
        ["Receive the report", "Leave with a penetration test report and a durable record of findings, decisions, remediation, and retest status."],
      ])}
    </div>
  </section>

  <section class="buyer-section">
    <div class="container split-proof">
      <div class="proof-copy">
        <div class="section-label">Good fit</div>
        <h2>You have security pressure before you have <em>AppSec headcount.</em></h2>
        <div class="proof-list">
          <div><span>01</span><p>An audit, customer review, launch, or security program calls for testing and current application-security evidence.</p></div>
          <div><span>02</span><p>An engineering leader can authorize one real product boundary and serve as the designated technical reviewer.</p></div>
          <div><span>03</span><p>The team wants a validated result and report, not the largest possible alert count.</p></div>
        </div>
      </div>
      <div class="proof-copy">
        <div class="section-label">What you bring</div>
        <h2>A real product, a reviewer, and <em>a reason to act now.</em></h2>
        <div class="proof-list">
          <div><span>01</span><p>One authorized repository, release, application, or API boundary that matters to the business.</p></div>
          <div><span>02</span><p>One technical reviewer who can evaluate the findings and record the outcome.</p></div>
          <div><span>03</span><p>One current deadline or security trigger that gives the assessment a clear purpose.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="buyer-section soft" id="build-vs-buy">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Why not Cursor, Codex, or an internal build?</div><h2>Use coding agents for code. Use ZeroQuarry to operate the <em>security decision.</em></h2></div><p class="section-intro">A coding agent can find and fix real bugs. The commercial question is whether your team also wants to build the authorization, skeptical review, human decision trail, remediation workflow, retesting, and reporting around every result.</p></div>
      <div class="stage-table-wrap">
        <table class="stage-table">
          <thead><tr><th>What the team needs</th><th>Coding agent or one-off prompt</th><th>ZeroQuarry</th><th>Build it internally</th></tr></thead>
          <tbody>
            <tr><td>Primary job</td><td>Explore, explain, or change code in a developer session.</td><td>Run an authorized finding-to-fix security lifecycle.</td><td>Own and maintain a custom security platform.</td></tr>
            <tr><td>Skeptical review</td><td>Depends on the prompt and context the operator assembles.</td><td>Separate investigator and adversarial-review roles, followed by human disposition.</td><td>Design, evaluate, and maintain the agent chain and quality bar.</td></tr>
            <tr><td>Decision record</td><td>Usually a chat, patch, or ad hoc artifact.</td><td>Traceable evidence, confidence, status, rationale, remediation, and retest history.</td><td>Build the data model, controls, integrations, and reporting.</td></tr>
            <tr><td>Engineering handoff</td><td>Suggest or implement a code change.</td><td>Route accepted work into issues or controlled patch proposals, then retest the original risk.</td><td>Connect every repository, approval path, ticketing system, and CI policy.</td></tr>
            <tr><td>Customer or audit use</td><td>A useful input, but not a durable security operating record by itself.</td><td>A current report plus the evidence and human decisions behind it.</td><td>Create and govern your own evidence package and review process.</td></tr>
            <tr><td>Best fit</td><td>A developer investigating or fixing a specific concern.</td><td>A software team under security pressure before dedicated AppSec-platform headcount.</td><td>A well-funded security team that wants platform engineering to be a core capability.</td></tr>
          </tbody>
        </table>
      </div>
      <p class="pricing-footnote">The offer makes this a falsifiable purchase decision: the written success test is whether the assessment produces at least one previously unknown, valid security result worth recording.</p>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">The evaluation path</div><h2>One boundary. One reviewer. One <em>explicit outcome.</em></h2></div><p class="section-intro">Each company starts from its own product and security trigger. The operating sequence stays written, bounded, and reviewable.</p></div>
      ${renderWorkflow([
        ["Scope and requirements", "Agree the target, authorization, known findings, report audience, evidence requirements, technical reviewer, model funding, and token cap."],
        ["Assessment and challenge", "Run the assessment, inspect the attack-surface plan, and pressure-test findings through separate adversarial review."],
        ["Reviewer decisions", "Record which results are previously unknown and valid, invalid, accepted risk, mitigated, or worth further investigation."],
        ["Report and guarantee decision", "Assemble the penetration test report, record the reviewer outcome, apply the guarantee if earned, and decide whether to continue."],
      ])}
    </div>
  </section>

  <section class="buyer-section">
    <div class="container split-proof">
      <div class="proof-copy">
        <div class="section-label">What ZeroQuarry commits</div>
        <h2>Founder attention, a final report, and <em>a measurable outcome.</em></h2>
        <p>ZeroQuarry will help scope the product, operate the assessment, investigate failures, pressure-test claims, and finish with a penetration test report and guarantee review.</p>
      </div>
      <div class="proof-copy">
        <div class="section-label">What participating teams commit</div>
        <h2>One real product and <em>candid review.</em></h2>
        <p>Participating teams provide an authorized target, disclose known findings at kickoff, name an accountable technical reviewer, fund model tokens, and record direct decisions about what was useful, wrong, novel, or commercially valuable. Public attribution or a testimonial is never required.</p>
      </div>
    </div>
  </section>

  <section class="buyer-section soft" id="guarantee">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">The guarantee</div><h2>A promise your technical reviewer can <em>actually test.</em></h2></div><p class="section-intro">The scope and success test are agreed in writing before payment, so the guarantee does not depend on an undefined idea of “interesting.”</p></div>
      <div class="faq-list">${guaranteeFaqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Commercial terms</div><h2>A paid evaluation with the <em>platform fee at risk.</em></h2></div><p class="section-intro">ZeroQuarry only keeps the platform fee when the designated technical reviewer records a previously unknown, valid result under the written success test.</p></div>
      <div class="pricing-addon-grid">
        <article><span>Platform and report</span><h3>$2,000 once</h3><p>Written scope, founder-assisted assessment, adversarial review, technical-reviewer session, and penetration test report.</p></article>
        <article><span>Outcome guarantee</span><h3>Full fee back</h3><p>If the written success test produces no previously unknown, valid result worth recording, ZeroQuarry reimburses the $2,000 platform fee.</p></article>
        <article><span>Model execution</span><h3>Separate cost</h3><p>Bring provider keys or agree a hosted-usage cap. Model-token costs remain yours and are not part of the reimbursement.</p></article>
      </div>
      <p class="pricing-footnote">No subscription is required. Continuation after the evaluation is priced separately. Payment begins only after both sides agree the authorized boundary, model budget, known-finding baseline, technical reviewer, report audience, and guarantee test.</p>
    </div>
  </section>

  <section class="pricing-section compact" id="apply">
    <div class="container">
      <div class="contact-panel">
        <div>
          <div class="tag">Design-partner application</div>
          <h2>Start with the requirement and the boundary.</h2>
          <p>Applying does not create an account or charge anything. ZeroQuarry will confirm fit, authorization, report requirements, technical review, the $2,000 platform fee, and separate model-token budget before testing begins.</p>
          <ul class="contact-points"><li>One written, authorized product boundary</li><li>One accountable technical reviewer</li><li>One current audit, customer, launch, or security trigger</li><li>One written guarantee test and report audience</li></ul>
        </div>
        <form class="enterprise-form" name="founding-security-cohort" method="POST" action="/founding-security-cohort/thanks/" data-netlify="true" netlify-honeypot="bot-field">
          <input type="hidden" name="form-name" value="founding-security-cohort">
          <input type="hidden" name="offer" value="design-partner-pentest">
          <input type="hidden" name="utm_source" value="zeroquarry.com">
          <input type="hidden" name="utm_medium" value="owned-site">
          <input type="hidden" name="utm_campaign" value="design-partner-pentest-2026">
          <input type="hidden" name="utm_content" value="design-partner-application">
          <input type="hidden" name="utm_term" value="">
          <input type="hidden" name="gclid" value="">
          <p class="hidden-field"><label>Do not fill this out: <input name="bot-field"></label></p>
          <label>Work email<input type="email" name="email" autocomplete="email" required></label>
          <label>Company<input type="text" name="company" autocomplete="organization" required></label>
          <label>Product, repo, or company URL<input type="url" name="target" autocomplete="url" required></label>
          <label>Current security trigger<select name="security-trigger" required><option value="">Choose one</option><option value="customer-review">Customer security review</option><option value="soc2-iso">SOC 2 or ISO 27001</option><option value="pentest">Pentest or retest requirement</option><option value="launch-release">Product launch or release</option><option value="security-backlog">Known security backlog</option><option value="other">Another current trigger</option></select></label>
          <label>Target type<select name="target-type" required><option value="">Choose one</option><option value="source">Source repository or coherent codebase</option><option value="release">Release artifact or binary</option><option value="application">Authorized application or API</option><option value="mixed">A written combination of targets</option></select></label>
          <label>Approximate scope size<select name="scope-size" required><option value="">Choose one</option><option value="small">Under 25k lines or one narrow service</option><option value="medium">25k–250k lines or one application</option><option value="large">Over 250k lines or multiple components</option><option value="unknown">Not sure yet</option></select></label>
          <label>Report needed by<input type="date" name="required-by" required></label>
          <label>Report audience<select name="report-audience" required><option value="">Choose one</option><option value="auditor">SOC 2, ISO, or other auditor/assessor</option><option value="customer">Customer security review</option><option value="internal">Internal engineering or security</option><option value="other">Another audience</option></select></label>
          <label>Technical reviewer<input type="text" name="technical-reviewer" placeholder="Name or role" required></label>
          <label>Model funding<select name="model-funding" required><option value="">Choose one</option><option value="byok">We can provide model-provider keys</option><option value="hosted-cap">We need a written hosted-usage cap</option><option value="decide">We need help choosing</option></select></label>
          <label>Commercial readiness<select name="commercial-readiness" required><option value="">Choose one</option><option value="ready">Ready to approve $2,000 plus model tokens</option><option value="budget-owner">Need to include our budget owner</option><option value="scope-first">Need to validate scope first</option></select></label>
          <label class="full">What must the assessment find, change, or make provable?<textarea name="success-outcome" rows="4" required></textarea></label>
          <label class="full">What security issues are already known in this boundary?<textarea name="known-findings" rows="3" placeholder="List known findings or write “none known.”" required></textarea></label>
          <label class="checkbox-row"><input type="checkbox" name="authorized-testing" value="confirmed" required><span>I confirm my organization owns this target or has explicit authorization to test it.</span></label>
          <label class="checkbox-row"><input type="checkbox" name="guarantee-terms" value="confirmed" required><span>I understand the guarantee covers the $2,000 platform fee only. Model-token costs are separate and not reimbursed.</span></label>
          <button class="btn btn-primary" type="submit">Apply for design-partner evaluation <span class="arr">-&gt;</span></button>
        </form>
      </div>
    </div>
  </section>

  <section class="buyer-cta"><div class="container"><div class="buyer-cta-panel"><div><h2>Ten accepted scopes, available through August 31.</h2><p>Pay $2,000 plus model-token costs for one scoped assessment and penetration test report. If the written outcome test finds no previously unknown, valid security result worth recording, the platform fee comes back.</p></div><div class="buyer-actions"><a class="btn btn-primary" href="${foundingCohortApplication}">Apply for an evaluation <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/pricing">Review platform pricing</a></div></div></div></section>
  <script>
  (() => {
    const form = document.forms["founding-security-cohort"];
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid"]) {
      const value = params.get(key);
      if (value && form.elements[key]) form.elements[key].value = value.slice(0, 160);
    }
  })();
  </script>
  </main>`;
  const schemas = [
    breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Design Partner Pentest Offer", href: foundingCohortPath }]),
    faqData(guaranteeFaqs.map(([q, a]) => ({ q, a }))),
    {
      "@context": "https://schema.org",
      "@type": "Offer",
      name: "ZeroQuarry Design Partner Security Assessment",
      price: "2000",
      priceCurrency: "USD",
      url: `${siteUrl}${foundingCohortPath}`,
      description: "One scoped application-security assessment, adversarial review, technical-reviewer session, and penetration test report. Model-token costs are separate.",
    },
  ];
  return layout({
    title: "Outcome-Guaranteed AI Security Assessment | ZeroQuarry",
    description: "Apply for a $2,000 founder-assisted ZeroQuarry security assessment and penetration test report. If it produces no previously unknown, valid result worth recording, the platform fee is reimbursed. Model-token costs are separate.",
    canonical: `${siteUrl}${foundingCohortPath}`,
    active: "",
    body,
    schemas,
    socialImageUrl: `${siteUrl}/assets/og-design-partner-pentest.png`,
  });
}

function foundingSecurityCohortThanksPage() {
  const body = `<main class="marketing-main">
  <section class="buyer-hero">
    <div class="container buyer-hero-grid">
      <div>
        <div class="buyer-kicker">Design-partner application received</div>
        <h1 class="buyer-title">Next we make the scope and guarantee <em>unambiguous.</em></h1>
        <p class="buyer-lede">ZeroQuarry will review the product boundary, authorization, evidence requirement, technical reviewer, model funding, and commercial readiness you submitted. If the evaluation is a fit, the next step is a short scoping call instead of an unstructured demo.</p>
        <div class="buyer-actions"><a class="btn btn-primary" href="/platform">Review the operating loop <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="${signupUrls.startup}?utm_source=design-partner-application&utm_medium=owned-site&utm_campaign=design-partner-pentest-2026&utm_content=thank-you-self-serve">Start self-serve instead</a></div>
        <div class="buyer-proofline"><span>Authorized boundary</span><span>Known findings</span><span>Token cap</span><span>Guarantee test</span></div>
      </div>
      <div class="hero-system" aria-label="Design-partner application next steps">
        <div class="system-head"><span>application://received</span><span class="system-status">review</span></div>
        <div class="loop-map">
          <div class="loop-node wide"><span>01</span><strong>Fit and authority</strong><p>Confirm the product is in scope, authorized, and reviewable by an accountable engineer.</p></div>
          <div class="loop-node"><span>02</span><strong>Outcome and terms</strong><p>Agree the success test, the $2,000 platform fee, model-token budget, report audience, and review date.</p></div>
          <div class="loop-node"><span>03</span><strong>Begin or decline</strong><p>Start the bounded assessment only when both sides agree. Otherwise, stop without creating another abandoned trial.</p></div>
        </div>
      </div>
    </div>
  </section>
  </main>`;
  return layout({
    title: "Design Partner Security Assessment Application Received | ZeroQuarry",
    description: "ZeroQuarry has received your design-partner security assessment application.",
    canonical: `${siteUrl}/founding-security-cohort/thanks/`,
    active: "",
    body,
    robots: "noindex,follow",
  });
}

function securityPartnerPage() {
  const body = `<main class="marketing-main">
  <section class="buyer-hero">
    <div class="container buyer-hero-grid">
      <div>
        <div class="buyer-kicker">Security partner pilot · two founding firms</div>
        <h1 class="buyer-title">Your client does not need another PDF. They need the <em>finding-to-fix work finished.</em></h1>
        <p class="buyer-lede">A one-client delivery pilot for vCISO, compliance, penetration-testing, and software-advisory firms. You keep the customer relationship. ZeroQuarry helps carry application findings through skeptical validation, engineering decisions, remediation, retesting, and current evidence.</p>
        <div class="buyer-actions"><a class="btn btn-primary" href="${securityPartnerApplication}">Propose one client situation <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="#partner-model">See the delivery model</a></div>
        <div class="buyer-proofline"><span>One client</span><span>One product boundary</span><span>30 days</span><span>No reseller commitment</span></div>
      </div>
      <div class="hero-system" aria-label="Joint security partner delivery loop">
        <div class="system-head"><span>partner://one-client-pilot</span><span class="system-status">2 firms</span></div>
        <div class="loop-map">
          <div class="loop-node wide"><span>PARTNER</span><strong>Own the client context</strong><p>Bring the security trigger, assurance requirement, and relationship that make the work matter now.</p></div>
          <div class="loop-node"><span>ZEROQUARRY</span><strong>Carry the application work</strong><p>Investigate, challenge, route, retest, and preserve the evidence around one product.</p></div>
          <div class="loop-node"><span>JOINT</span><strong>Decide whether to repeat</strong><p>Complete one paid engagement before discussing a broad channel program.</p></div>
        </div>
        <div class="system-foot"><span class="pulse-dot"></span><span>client authorization required before testing</span></div>
      </div>
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">The handoff gap</div><h2>The assessment ends. The security work <em>does not.</em></h2></div><p class="section-intro">Advisers often identify the requirement and pentesters identify the issue. Engineering still needs a credible way to decide, fix, verify, and answer the next customer.</p></div>
      ${renderCards([
        ["Pentest follow-through", "A report lands with engineering, but validation context, remediation ownership, and retest evidence split across tools and inboxes."],
        ["Compliance pressure", "The client needs to demonstrate a current application-security practice, not merely upload last year’s assessment PDF."],
        ["Fractional security capacity", "The vCISO owns the risk conversation but cannot economically operate every finding across every engineering team."],
        ["Customer assurance", "A security review asks whether findings were fixed, accepted, or retested, and the answer must be reconstructed from stale records."],
        ["Development consulting", "The partner can implement fixes but needs independent evidence about what matters and whether the change addressed the original risk."],
        ["Overflow and specialist coverage", "A security firm can keep strategic and human-testing work while ZeroQuarry handles bounded, repeatable follow-through."],
      ])}
    </div>
  </section>

  <section class="buyer-section" id="partner-model">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">One-client delivery model</div><h2>Prove the joint outcome before building <em>a partnership deck.</em></h2></div><p class="section-intro">The first engagement is deliberately bounded. No quotas, exclusivity, certification, or reseller infrastructure is required.</p></div>
      ${renderWorkflow([
        ["Nominate the situation", "Identify one consenting client with a current pentest, compliance, customer-review, launch, or application-security trigger."],
        ["Agree the boundary", "Define the authorized product, responsibilities, success criteria, commercial model, attribution, model funding, and decision date."],
        ["Run the operating loop", "Assess the product, challenge findings, record human decisions, and move accepted work into the client’s engineering workflow."],
        ["Retest and package evidence", "Verify selected remediation and preserve the current finding, decision, fix, and retest record for the client and adviser."],
        ["Make a repeat decision", "Review delivery effort, client value, economics, and fit; then continue, revise the offer, or stop without channel debt."],
      ])}
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container split-proof">
      <div class="proof-copy">
        <div class="section-label">The partner owns</div>
        <h2>Trust, context, and the <em>customer relationship.</em></h2>
        <div class="proof-list">
          <div><span>01</span><p>The client’s current security or assurance trigger and the requirements the outcome must satisfy.</p></div>
          <div><span>02</span><p>Client sponsorship, authorization, stakeholder context, and the advisory or testing work already in motion.</p></div>
          <div><span>03</span><p>The decision about how ZeroQuarry appears: direct, bundled, subcontracted, or jointly delivered.</p></div>
        </div>
      </div>
      <div class="proof-copy">
        <div class="section-label">ZeroQuarry owns</div>
        <h2>The application-security <em>operating loop.</em></h2>
        <div class="proof-list">
          <div><span>01</span><p>Product scoping, platform onboarding, assessment workflow, and transparent execution boundaries.</p></div>
          <div><span>02</span><p>Adversarial validation, decision records, remediation support, selected retesting, and current evidence.</p></div>
          <div><span>03</span><p>Founder involvement during the pilot and an honest final review of value, failure, economics, and next fit.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">First-engagement commercial shape</div><h2>Small enough to start. Specific enough to <em>make a buying decision.</em></h2></div><p class="section-intro">The client or partner chooses the billing path before any source, target, or customer identity is shared.</p></div>
      <div class="pricing-addon-grid">
        <article><span>Design-partner assessment</span><h3>$2,000 once</h3><p>One written product boundary, assessment, adversarial review, technical-reviewer session, and penetration test report.</p></article>
        <article><span>Model execution</span><h3>Keys or hard cap</h3><p>Bring account-managed model keys, or agree a maximum hosted-usage budget before the engagement begins.</p></article>
        <article><span>Outcome guarantee</span><h3>Full fee back</h3><p>If the client reviewer records no previously unknown, valid result worth recording, ZeroQuarry reimburses the platform fee. Model-token costs remain separate.</p></article>
      </div>
      <p class="pricing-footnote">Direct, bundled, referral, and subcontracted delivery are all possible. Commercial handling, attribution, confidentiality, responsibilities, scope, and the written guarantee test are agreed before the client introduction. Continuation is priced separately; no exclusivity or ongoing partner commitment is required.</p>
    </div>
  </section>

  <section class="pricing-section compact" id="partner-apply">
    <div class="container">
      <div class="contact-panel">
        <div>
          <div class="tag">Partner pilot</div>
          <h2>Start with the client situation, not a channel forecast.</h2>
          <p>Do not disclose a client’s identity or confidential details in this form. Describe the security trigger, product shape, and handoff problem well enough to test whether a joint engagement is worth a working session.</p>
          <ul class="contact-points"><li>A real client pattern or current engagement</li><li>A product or application boundary the client can authorize</li><li>A finding-to-fix or evidence gap your current service does not economically close</li><li>A path to a paid 30-day decision</li></ul>
        </div>
        <form class="enterprise-form" name="security-partner-pilot" method="POST" action="/partners/thanks/" data-netlify="true" netlify-honeypot="bot-field">
          <input type="hidden" name="form-name" value="security-partner-pilot">
          <input type="hidden" name="offer" value="security-partner-pilot">
          <input type="hidden" name="utm_source" value="zeroquarry.com">
          <input type="hidden" name="utm_medium" value="owned-site">
          <input type="hidden" name="utm_campaign" value="security-partner-pilot-2026">
          <input type="hidden" name="utm_content" value="partner-application">
          <input type="hidden" name="utm_term" value="">
          <p class="hidden-field"><label>Do not fill this out: <input name="bot-field"></label></p>
          <label>Work email<input type="email" name="email" autocomplete="email" required></label>
          <label>Firm or company<input type="text" name="company" autocomplete="organization" required></label>
          <label>Website<input type="url" name="website" autocomplete="url" required></label>
          <label>Primary service<select name="service" required><option value="">Choose one</option><option value="vciso">vCISO or fractional security</option><option value="compliance">Compliance readiness or audit support</option><option value="pentest">Penetration testing or AppSec consulting</option><option value="development">Software engineering or development consulting</option><option value="mssp">Managed security services</option><option value="other">Another advisory service</option></select></label>
          <label>Earliest client timing<select name="client-timing" required><option value="">Choose one</option><option value="current">A current client situation</option><option value="30-days">Likely within 30 days</option><option value="60-days">Likely within 60 days</option><option value="no-client">No specific client pattern yet</option></select></label>
          <label>Preferred delivery shape<select name="delivery-shape" required><option value="">Choose one</option><option value="joint">Jointly delivered</option><option value="bundled">Bundled into our service</option><option value="direct">Direct client introduction</option><option value="subcontract">Subcontracted or white-label</option><option value="explore">Decide after scoping</option></select></label>
          <label class="full">What application-security handoff is getting stuck?<textarea name="handoff-gap" rows="5" required></textarea></label>
          <label class="full">What would a successful first engagement prove?<textarea name="success-outcome" rows="4" required></textarea></label>
          <button class="btn btn-primary" type="submit">Propose a partner pilot <span class="arr">-&gt;</span></button>
        </form>
      </div>
    </div>
  </section>

  <section class="buyer-cta"><div class="container"><div class="buyer-cta-panel"><div><h2>One client. One product. One decision.</h2><p>Use a paid engagement to learn whether ZeroQuarry closes the gap between your security advice and the client’s engineering outcome.</p></div><div class="buyer-actions"><a class="btn btn-primary" href="${securityPartnerApplication}">Propose the situation <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/founding-security-cohort/">See the client cohort</a></div></div></div></section>
  <script>
  (() => {
    const form = document.forms["security-partner-pilot"];
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const value = params.get(key);
      if (value && form.elements[key]) form.elements[key].value = value.slice(0, 160);
    }
  })();
  </script>
  </main>`;
  const schemas = [
    breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Security partner pilot", href: securityPartnerPath }]),
    faqData([
      { q: "Is this a reseller program?", a: "No. The first step is one bounded, paid client engagement. ZeroQuarry and the partner decide whether a repeatable commercial relationship is justified only after reviewing the delivery outcome and economics." },
      { q: "Who owns the client relationship?", a: "The partner keeps its client relationship. Before an introduction, both sides agree whether ZeroQuarry is direct, bundled, subcontracted, white-labeled, or jointly presented." },
      { q: "Can the work run inside the client environment?", a: "ZeroQuarry supports customer-controlled private runners for eligible internal source and targets. The deployment and result-return policy is agreed during scoping." },
    ]),
  ];
  return layout({
    title: "Security Partner Pilot for vCISO, Compliance, and Pentest Firms | ZeroQuarry",
    description: "Run one joint client engagement that carries application-security findings through validation, remediation, retesting, and customer-ready evidence.",
    canonical: `${siteUrl}${securityPartnerPath}`,
    active: "",
    body,
    schemas,
  });
}

function securityPartnerThanksPage() {
  const body = `<main class="marketing-main">
  <section class="buyer-hero">
    <div class="container buyer-hero-grid">
      <div>
        <div class="buyer-kicker">Partner pilot proposal received</div>
        <h1 class="buyer-title">Now we test the <em>client situation.</em></h1>
        <p class="buyer-lede">ZeroQuarry will review the service fit, security trigger, delivery shape, and path to one authorized paid engagement. Expect a direct response from Shane rather than an automated partner sequence.</p>
        <div class="buyer-actions"><a class="btn btn-primary" href="/platform">Review the operating loop <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/founding-security-cohort/">Review the client cohort</a></div>
        <div class="buyer-proofline"><span>Client fit</span><span>Delivery ownership</span><span>Commercial shape</span><span>Decision date</span></div>
      </div>
      <div class="hero-system" aria-label="Partner pilot proposal review">
        <div class="system-head"><span>partner://proposal</span><span class="system-status">received</span></div>
        <div class="loop-map">
          <div class="loop-node wide"><span>REVIEW</span><strong>Does the client situation fit?</strong><p>Confirm a current application-security trigger, authorized boundary, and accountable technical reviewer.</p></div>
          <div class="loop-node"><span>DESIGN</span><strong>Who owns which work?</strong><p>Agree client relationship, delivery roles, confidentiality, model funding, and commercial handling.</p></div>
          <div class="loop-node"><span>DECIDE</span><strong>Book or stop</strong><p>Start only when the first engagement has a product boundary, success criteria, and paid decision path.</p></div>
        </div>
        <div class="system-foot"><span class="pulse-dot"></span><span>reply routes to shane@zeroquarry.com</span></div>
      </div>
    </div>
  </section>
  </main>`;
  const schemas = [breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Security partner pilot", href: securityPartnerPath }, { name: "Proposal received", href: "/partners/thanks/" }])];
  return layout({
    title: "Security Partner Pilot Proposal Received | ZeroQuarry",
    description: "ZeroQuarry received your security partner pilot proposal and will review the client situation, delivery model, and paid engagement path.",
    canonical: `${siteUrl}/partners/thanks/`,
    active: "",
    body,
    schemas,
    robots: "noindex,nofollow",
  });
}

function platformHub() {
  const body = `<main class="marketing-main">
  <section class="buyer-hero"><div class="container buyer-hero-grid"><div><div class="buyer-kicker">ZeroQuarry platform</div><h1 class="buyer-title">The security work <em>between pentests.</em></h1><p class="buyer-lede">One AI security-operations platform to receive work, test the product, challenge findings, route remediation, verify fixes, and package evidence.</p><div class="buyer-actions"><a class="btn btn-primary" href="${signupUrls.general}">Start free trial <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/use-cases/">Explore use cases</a></div><div class="buyer-proofline"><span>Application security</span><span>Vulnerability operations</span><span>Customer assurance</span></div></div>${renderMotionVisual("platform-overview")}</div></section>
  <section class="buyer-section soft"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Capability map</div><h2>Choose an entry point. Keep one <em>operating record.</em></h2></div><p class="section-intro">Each capability is useful independently; together they replace the fragmented handoffs between scanners, inboxes, tickets, patch tools, retests, and audit folders.</p></div><div class="capability-grid">${platformPages.map((page, index) => `<a class="capability-card" href="/platform/${page.slug}/"><div class="card-code">0${index + 1}</div><h3>${escapeHtml(page.eyebrow)}</h3><p>${escapeHtml(page.description)}</p><span class="card-link">Explore capability <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}</div></div></section>
  <section class="buyer-section"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Operating model</div><h2>The scan is only the beginning.</h2></div><p class="section-intro">ZeroQuarry treats intake, validation, ownership, remediation, retesting, and assurance as first-class security work.</p></div><div class="operation-rail">${[["Receive", "PR, schedule, API, report"], ["Assess", "Source, binary, live"], ["Validate", "Proof and skeptical review"], ["Decide", "State, reason, owner"], ["Remediate", "Patch, PR, ticket"], ["Retest", "Verify or regress"], ["Prove", "Evidence and sharing"]].map(([title, text], i) => `<div class="operation-step"><small>0${i + 1}</small><h3>${title}</h3><p>${text}</p></div>`).join("")}</div></div></section>
  <section class="buyer-section soft"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Designed for control</div><h2>Automation where it scales. Humans where <em>authority matters.</em></h2></div><p class="section-intro">ZeroQuarry can automate investigation and routine coordination without silently authorizing a live test, accepting business risk, exposing evidence, or merging production code.</p></div><div class="outcome-grid"><article class="outcome-card"><h3>Authorization stays explicit</h3><p>Remote targets, sender and repository boundaries, shares, and GitHub access are individually controlled.</p></article><article class="outcome-card"><h3>Decisions retain reasons</h3><p>Validation, dispute, regression, accepted risk, and archive history remain visible and attributable.</p></article><article class="outcome-card"><h3>Production controls remain yours</h3><p>Generated changes flow through installation, enrollment, approval, branch protection, CI, review, and merge.</p></article></div></div></section>
  ${renderCta("See the complete loop on your product.", "A useful evaluation starts with a real security boundary and follows the result all the way through validation, remediation, and evidence.")}
  </main>`;
  const schemas = [breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Platform", href: "/platform" }]), { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "ZeroQuarry", applicationCategory: "SecurityApplication", operatingSystem: "Web", description: "AI security operations platform for application security testing, validation, remediation, and reporting.", url: `${siteUrl}/platform` }];
  return layout({ title: "AI Security Operations Platform | ZeroQuarry", description: "Explore ZeroQuarry's AI security testing, adversarial validation, continuous security, vulnerability operations, remediation, and evidence capabilities.", canonical: `${siteUrl}/platform`, active: "platform", body, schemas });
}

function useCasesHub() {
  const body = `<main class="marketing-main">
  <section class="buyer-hero"><div class="container buyer-hero-grid"><div><div class="buyer-kicker">ZeroQuarry use cases</div><h1 class="buyer-title">Start with the moment security becomes <em>urgent.</em></h1><p class="buyer-lede">The right workflow depends on the decision: merge a risky PR, ship a release, answer a researcher, satisfy a customer, or build a credible program with a lean team.</p><div class="buyer-actions"><a class="btn btn-primary" href="${signupUrls.general}">Start free trial <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/platform">Explore the platform</a></div></div>${renderMotionVisual("use-case-router")}</div></section>
  <section class="buyer-section soft"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Use-case library</div><h2>Start with a workflow your team already recognizes.</h2></div><p class="section-intro">Each one combines the appropriate assessment surface, validation depth, human decision, remediation path, and evidence output.</p></div><div class="use-case-grid"><a class="use-case-card" href="/open-source/"><div class="card-code">OSS</div><h3>Open source maintainers</h3><p>Validate noisy vulnerability reports against public source and keep the response work together.</p><span class="card-link">See the free program <span aria-hidden="true">-&gt;</span></span></a>${useCasePages.map((page, index) => `<a class="use-case-card" href="/use-cases/${page.slug}/"><div class="card-code">0${index + 1}</div><h3>${escapeHtml(page.eyebrow)}</h3><p>${escapeHtml(page.description)}</p><span class="card-link">See the playbook <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}</div></div></section>
  <section class="buyer-section"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Security need</div><h2>The same loop, applied where security is <em>breaking down.</em></h2></div><p class="section-intro">Choose the pattern that matches product exposure, customer pressure, change rate, and the cost of a miss.</p></div><div class="stage-table-wrap"><table class="stage-table"><thead><tr><th>Starting point</th><th>Primary concern</th><th>Starting workflow</th><th>What good looks like</th></tr></thead><tbody><tr><td>Establish coverage</td><td>Do we know our critical product risk?</td><td>Source baseline and release review</td><td>Important findings have a decision and one fix has been retested.</td></tr><tr><td>Operate continuously</td><td>Can security keep up with delivery?</td><td>PR review, schedules, issue routing</td><td>Security work moves through engineering without a separate manual program.</td></tr><tr><td>Standardize and prove</td><td>Can we execute consistently and prove it?</td><td>Lifecycle, adversarial review, evidence packs</td><td>Assets, decisions, remediation, exceptions, and retests are traceable.</td></tr></tbody></table></div></div></section>
  ${renderCta("Which security moment is consuming the most time?", "Start there. ZeroQuarry can expand into the rest of the operating loop once one workflow is producing clear decisions and verified outcomes.")}
  </main>`;
  const schemas = [breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Use cases", href: "/use-cases/" }])];
  return layout({ title: "Application Security and AI Pentesting Use Cases | ZeroQuarry", description: "Explore ZeroQuarry workflows for startup security, pull request review, release testing, inbound reports, customer assurance, and vulnerability disclosure.", canonical: `${siteUrl}/use-cases/`, active: "use-cases", body, schemas });
}

function openSourcePage() {
  const faqs = [
    ["What is included in the free trial?", "The 30-day trial covers one private product, 25 security runs, three collaborators, source and pull-request review, release artifacts, authorized live testing, report intake, validation, patch proposals, retests, and controlled evidence. No card is required to begin."],
    ["How does free for open source work?", "Eligible maintainers receive an ongoing account for one public GitHub project with five monthly security runs, one maintainer, bounded report intake, validation, tracking, and three controlled evidence shares. The project must remain public and use an OSI-approved license."],
    ["How do we move from the trial to a paid plan?", "Choose the package and billing period that fit your expected capacity, then contact ZeroQuarry to activate it. Paid-plan activation is currently assisted while self-service subscription checkout is being completed."],
    ["Which projects qualify?", "The program is for public GitHub projects under an OSI-approved license. You must be a current maintainer or otherwise authorized to manage security work for the project."],
    ["Is the account really free?", "Yes. There is no card and no fixed expiration while the project remains public, licensed, and eligible. The account stays within the published project, user, and monthly run limits."],
    ["Can anyone scan a public repository?", "The program is intended for maintainers, not third parties creating unofficial security workspaces. Eligibility is self-attested during registration and ZeroQuarry may review the project and maintainer relationship."],
    ["Can ZeroQuarry receive reports sent to our existing security address?", "Yes. A maintainer can forward reports from an approved sender into the project's bounded intake address. The project controls which senders and public repositories may start assessment work."],
    ["What happens if we need private forks or more capacity?", "Private source, multiple products, live testing, more collaborators, and higher monthly capacity are available on commercial plans. The public project can remain on the open-source program while private company work moves to a paid account."],
  ];
  const body = `<main class="marketing-main">
  <section class="buyer-hero detail-hero"><div class="container"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">ZeroQuarry</a><span>/</span><span>Open source maintainers</span></nav><div class="buyer-hero-grid"><div><div class="buyer-kicker">Free for open source</div><h1 class="buyer-title detail-title">Your project is open. Your security inbox should not be a <em>full-time job.</em></h1><p class="buyer-lede">Forward a vulnerability report from your maintainer inbox. ZeroQuarry checks the claim against the public repository, challenges weak evidence, and keeps the decision and follow-up in one place.</p><div class="buyer-actions"><a class="btn btn-primary" href="${signupUrls.openSource}">Protect an open-source project free <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="#eligibility">Check eligibility</a></div><div class="buyer-proofline"><span>No card</span><span>No fixed expiration</span><span>One public project</span></div></div>${renderMotionVisual("open-source")}</div></div></section>

  <section class="buyer-section soft"><div class="container"><div class="buyer-section-head"><div><div class="section-label">The maintainer problem</div><h2>AI made reports cheaper to send, not <em>cheaper to resolve.</em></h2></div><p class="section-intro">A scanner output can look urgent without showing reachability, product context, or a reproduction path. The maintainer still has to work out whether anything is real.</p></div><div class="outcome-grid"><article class="outcome-card"><h3>More low-context reports</h3><p>People can submit polished scanner output without knowing the repository or validating the claim.</p></article><article class="outcome-card"><h3>Repeated investigation</h3><p>Maintainers reconstruct the same code path, affected versions, and prior decision across issues and inbox threads.</p></article><article class="outcome-card"><h3>No shared operating record</h3><p>The report, technical verdict, retest, and disclosure timeline often live in different places.</p></article></div></div></section>

  <section class="buyer-section"><div class="container"><div class="buyer-section-head"><div><div class="section-label">How it works</div><h2>Turn an incoming claim into a <em>maintainer decision.</em></h2></div><p class="section-intro">ZeroQuarry handles repeatable investigation and record keeping. Maintainers still control authorization, disclosure, and changes to the project.</p></div>${renderWorkflow([
    ["Forward", "Send a report from your maintainer inbox into the project's ZeroQuarry intake address."],
    ["Bound", "Match the sender and repository against the project's approved intake rules before assessment begins."],
    ["Validate", "Investigate the public source, test reachability, and challenge evidence that does not hold up."],
    ["Decide", "Record whether the claim is validated, disputed, accepted, mitigated, or ready for retest."],
    ["Track", "Keep the report, decision history, retest, disclosure timeline, and controlled evidence connected."],
  ])}</div></section>

  <section class="buyer-section soft"><div class="container"><div class="buyer-section-head"><div><div class="section-label">The open-source account</div><h2>Everything you need to resolve the <em>next report.</em></h2></div><p class="section-intro">Investigate the claim, capture the decision, and keep the follow-up attached to one public project.</p></div><div class="capability-grid"><article class="capability-card"><div class="card-code">01</div><h3>One public project</h3><p>Connect a public GitHub repository and keep its security work in one place.</p></article><article class="capability-card"><div class="card-code">02</div><h3>Five runs each month</h3><p>Use five focused reviews or one full public-source assessment each month.</p></article><article class="capability-card"><div class="card-code">03</div><h3>One maintainer</h3><p>Give one account owner a clear record of reports, decisions, and follow-up.</p></article><article class="capability-card"><div class="card-code">04</div><h3>Secure report intake</h3><p>Forward reports through approved sender and repository rules.</p></article><article class="capability-card"><div class="card-code">05</div><h3>Validation and tracking</h3><p>Use adversarial review, finding lifecycle, retests, and disclosure history on the public project.</p></article><article class="capability-card"><div class="card-code">06</div><h3>Controlled evidence</h3><p>Keep up to three active shares with expiration, revocation, and access history.</p></article></div></div></section>

  <section class="buyer-section" id="eligibility"><div class="container split-proof"><div class="proof-copy"><div class="section-label">Eligibility</div><h2>Built for active <em>open-source maintainers.</em></h2><p>Qualifying is straightforward. Connect a public GitHub repository with an OSI-approved license and confirm that you are authorized to manage security work for the project.</p><div class="proof-list"><div><span>01</span><p>The repository is public on GitHub and carries an OSI-approved open-source license.</p></div><div><span>02</span><p>You maintain the project or have clear authorization to coordinate its security work.</p></div><div><span>03</span><p>The reports and security decisions relate to that public project.</p></div></div></div><div class="hero-system"><div class="system-head"><span>program://eligibility</span><span class="system-status">eligible</span></div><div class="loop-map"><div class="loop-node wide"><span>PUBLIC</span><strong>GitHub repository</strong><p>Connect the source maintainers already use to investigate reports.</p></div><div class="loop-node"><span>LICENSE</span><strong>OSI approved</strong><p>A recognized open-source license makes qualification clear.</p></div><div class="loop-node"><span>WORKFLOW</span><strong>One project record</strong><p>Keep reports, decisions, and retests connected.</p></div></div><div class="system-foot"><span class="pulse-dot"></span><span>no card and no trial countdown</span></div></div></div></section>

  <section class="buyer-section soft"><div class="container split-proof"><div class="proof-copy"><div class="section-label">Built with maintainer context</div><h2>Designed by someone who has lived on the <em>receiving end.</em></h2><p>ZeroQuarry's founder led product work on Elasticsearch and Kong. The program comes from seeing how much maintainer time a security report can consume before anyone knows whether the claim is real.</p><p>That is also why the product keeps skeptical validation, a visible decision trail, and controlled disclosure work around the scan itself.</p><a class="card-link" href="/research/obsidian-tasks-rce/">Read a coordinated vulnerability investigation <span aria-hidden="true">-&gt;</span></a></div><div class="hero-system"><div class="system-head"><span>maintainer://decision</span><span class="system-status">reviewed</span></div><div class="loop-map"><div class="loop-node wide"><span>CLAIM</span><strong>Is the reported path actually reachable?</strong><p>Follow the repository and affected configuration before assigning severity.</p></div><div class="loop-node"><span>CHALLENGE</span><strong>What would disprove it?</strong><p>Check versions, defaults, permissions, and realistic user action.</p></div><div class="loop-node"><span>RECORD</span><strong>Why did we decide?</strong><p>Keep the evidence available for the next report and the eventual retest.</p></div></div><div class="system-foot"><span class="pulse-dot"></span><span>scanner output is the start of review, not the conclusion</span></div></div></div></section>

  <section class="buyer-section"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Open-source FAQ</div><h2>Questions maintainers usually ask.</h2></div></div>${renderFaqs(faqs)}</div></section>
  ${renderCta("Give maintainers a better way to resolve the next report.", "Connect one public project, forward the next report, and see what holds up.", signupUrls.openSource, "Protect an open-source project free")}
  </main>`;
  const schemas = [
    breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Open source maintainers", href: "/open-source/" }]),
    faqData(faqs.map(([q, a]) => ({ q, a }))),
  ];
  return layout({
    title: "Free AI Security Review for Open Source Maintainers | ZeroQuarry",
    description: "Free open source security review and vulnerability report triage for eligible maintainers. Validate scanner claims, track decisions, retest fixes, and share evidence.",
    canonical: `${siteUrl}/open-source/`,
    active: "use-cases",
    body,
    schemas,
  });
}

function pricingPage() {
  const rates = [
    ["GPT-5 nano", "$0.40", "$1.60"],
    ["Claude Haiku 4", "$1.00", "$5.00"],
    ["GPT-5 mini", "$3.00", "$12.00"],
    ["Claude Sonnet 4.5 / 4.6", "$4.00", "$20.00"],
    ["GPT-4o", "$5.00", "$15.00"],
    ["GPT-5", "$15.00", "$60.00"],
  ];
  const comparisonGroups = [
    { name: "Capacity", rows: [
      ["Protected products", "1 public", "1", "1", "5", "15", "Custom"],
      ["Security runs / month", "5", "10", "50", "200", "600", "Custom"],
      ["Concurrent assessments", "1", "1", "3", "8", "20", "Custom"],
      ["Collaborators", "1", "3", "15", "50", "150", "Custom"],
    ] },
    { name: "Assessment coverage", rows: [
      ["Public and private source review", "Public only", "Included", "Included", "Included", "Included", "Included"],
      ["Scheduled and pull-request review", "Not included", "Included", "Included", "Included", "Included", "Included"],
      ["Release artifact and binary review", "Not included", "Not included", "Included", "Included", "Included", "Included"],
      ["Authorized live-application testing", "Not included", "Not included", "Included", "Included", "Included", "Included"],
      ["Customer-controlled private runners", "Not included", "Not included", "Not included", "Not included", "Not included", "Included"],
      ["Adversarial validation", "Included", "Included", "Included", "Included", "Included", "Included"],
      ["Vulnerability PoCs", "Not included", "Included", "Included", "Included", "Included", "Included"],
    ] },
    { name: "Security operations", rows: [
      ["Finding retests", "Included", "Included", "Included", "Included", "Included", "Included"],
      ["Patch proposals", "Not included", "Included", "Included", "Included", "Included", "Included"],
      ["Jira issue creation", "Not included", "Not included", "Included", "Included", "Included", "Included"],
      ["ServiceNow issue creation", "Not included", "Not included", "Not included", "Included", "Included", "Included"],
      ["Inbound researcher-report email triage", "Not included", "Not included", "Not included", "Included", "Included", "Included"],
      ["GitHub autofix with human approval", "Not included", "Not included", "Not included", "Included", "Included", "Included"],
    ] },
    { name: "Evidence and rollout", rows: [
      ["Controlled evidence shares", "3", "5", "25", "100", "500", "Custom"],
      ["Maximum share expiry", "30 days", "30 days", "60 days", "180 days", "365 days", "Custom"],
      ["Report watermark", "Required", "Not required", "Not required", "Not required", "Not required", "Custom"],
      ["Custom report branding", "Not included", "Not included", "Not included", "Included", "Included", "Included"],
      ["Workspace appearance controls", "Not included", "Not included", "Not included", "Not included", "Included", "Included"],
      ["Rollout and procurement support", "Self-serve", "Self-serve", "Standard", "Guided", "Priority", "Custom"],
    ] },
  ];
  const faqs = [
    ["What counts as a protected product?", "One customer-facing product or service with a coherent codebase, release boundary, and evidence history. A monorepo can still be one product; unrelated products with separate owners and risk decisions count separately."],
    ["What consumes a security run?", "A focused pull-request or changed-file review consumes 1 security run. A full source, binary, or authorized live assessment consumes 5. Reports, lifecycle decisions, evidence sharing, and rerunning a pipeline stage inside the same assessment do not consume more. Any newly started scan is metered by its scope."],
    ["Is this priced per seat?", "No. Each listed price covers the whole account and includes multiple collaborators. Developer includes 3 people and Coverage includes 15, so inviting engineering, product, or leadership does not multiply the subscription bill."],
    ["Why does this cost more than one coding-agent seat?", "A coding agent helps one developer produce code. ZeroQuarry independently tests the product, challenges vulnerability claims, retains risk decisions, moves remediation, verifies fixes, and produces evidence for customers and auditors. The entry price stays in developer-tool territory; the product outcome is a continuous security operation."],
    ["Is model usage included?", "Hosted model input and output are metered separately at the posted rates below. With an account-managed key, the LLM provider bills you directly and ZeroQuarry does not add those calls to its model-usage invoice; your ZeroQuarry subscription and security-run limits remain unchanged. Private runners require your keys for every selected stage."],
    ["Can we add capacity without changing plans?", "Yes. Add protected products or bundles of 25 monthly security runs. If that becomes a recurring pattern, moving to the next plan will usually provide better economics and more operating controls."],
    ["Can ZeroQuarry support penetration test and compliance evidence?", "Yes. ZeroQuarry assesses the authorized product boundary, challenges the findings, records the methodology and evidence, tracks remediation and retests, and produces the report. Any buyer-specific evidence requirements are captured during scoping."],
    ["What is the $2,000 design-partner offer?", "For ten accepted scopes or applications through August 31, 2026, ZeroQuarry will run one founder-assisted assessment with adversarial review and a penetration test report. If the designated technical reviewer records no previously unknown, valid security result worth recording, ZeroQuarry reimburses the $2,000 platform fee. Model-token costs are separate and not reimbursed."],
  ];
  const body = `<main>
  <section class="pricing-hero">
    <div class="container pricing-hero-grid">
      <div>
        <span class="eyebrow"><span class="tag">PRICING</span><span>Account pricing. Not per-seat pricing.</span></span>
        <h1 class="headline pricing-headline"><span class="block">Security leverage</span><span class="block thin">at developer-tool</span><span class="block thin"><em>prices.</em></span></h1>
        <p class="lede">Try ZeroQuarry for 30 days, cover a private product from $40 per month on annual billing, and invite the people who need the outcome. ZeroQuarry costs like a developer tool while doing the continuous testing, validation, remediation, and evidence work a coding assistant does not.</p>
        <div class="hero-ctas"><a class="btn btn-primary" href="${signupUrls.general}?source=pricing">Start free trial <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="#plans">Compare plans</a></div>
      </div>
      <div class="pricing-terminal" aria-label="ZeroQuarry pricing model">
        <div class="console-head"><span class="traffic"><span class="r"></span><span class="y"></span><span class="g"></span></span><span class="console-title"><span class="tbl">compare://</span>developer-tool</span><span class="console-meta"><span class="live">DIFFERENT</span></span></div>
        <div class="pricing-terminal-body"><div><span class="muted">$</span> plan select developer --annual</div><div><span class="ok">$40/mo</span> one account · three collaborators</div><div><span class="muted">$</span> run security-review --scope pr</div><div><span class="ok">validated</span> finding · proof · patch · retest</div><div><span class="muted">$</span> export evidence --audience customer</div><div><span class="ok">ready</span> this is security operations, not autocomplete</div></div>
      </div>
    </div>
  </section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">The value metric</div><h2>One unit buyers can <em>forecast.</em></h2></div><div class="aside">A security run represents reserved investigation capacity. It makes a five-minute PR check economically different from a full product assessment without turning every finding, report, or teammate into a surcharge.</div></div>
    <div class="run-metric-grid"><article><div class="run-number">1</div><div><h3>Focused review</h3><p>A pull request or changed-file assessment scoped to the code that moved.</p></div></article><article><div class="run-number">5</div><div><h3>Full assessment</h3><p>A complete source, release artifact, binary, or authorized live target review.</p></div></article><article><div class="run-number included">0</div><div><h3>Operational follow-through</h3><p>Review stages, decisions, reports, evidence sharing, and in-assessment reruns.</p></div></article></div>
  </div></section>

  <section class="pricing-section" id="plans"><div class="container">
    <div class="section-head"><div><div class="tag">Public plans</div><h2>Land small. Expand when the security work expands.</h2></div><div class="aside">Annual billing is exactly 20% less than monthly. Each price covers the account. Model usage remains visible and separate.</div></div>
    <input class="billing-choice" type="radio" name="billing-period" id="billing-annual" checked>
    <input class="billing-choice" type="radio" name="billing-period" id="billing-monthly">
    <div class="billing-toggle" role="group" aria-label="Billing period"><label for="billing-annual">Annual <strong>save 20%</strong></label><label for="billing-monthly">Monthly</label></div>
    <div class="pricing-grid pricing-grid-five">
      <article class="price-card"><div class="plan-kicker">Free for open source</div><h2>OSS</h2><p class="plan-audience">For maintainers validating incoming security reports against one qualifying public project.</p><div class="price-row"><span class="price">$0</span><span class="cadence">/ month</span></div><div class="price-note">No card · no fixed expiration</div><a class="btn btn-ghost plan-btn" href="${signupUrls.openSource}?source=pricing&amp;plan=oss">Protect an OSS project</a><ul class="plan-list"><li><span></span>1 qualifying public project</li><li><span></span>5 security runs each month</li><li><span></span>1 maintainer</li><li><span></span>Secure researcher-report intake</li><li><span></span>Adversarial validation and retests</li><li><span></span>3 controlled evidence shares</li></ul></article>
      <article class="price-card"><div class="plan-kicker">Build securely</div><h2>Developer</h2><p class="plan-audience">For a founder or security-minded engineer adding independent review to one private product.</p><div class="price-row"><span class="price annual-price">$40</span><span class="price monthly-price">$50</span><span class="cadence">/ month</span></div><div class="price-note annual-billing-note">$480 billed yearly · save $120</div><div class="price-note monthly-billing-note">Billed monthly · switch anytime</div><a class="btn btn-ghost plan-btn" href="${signupUrls.general}?source=pricing&amp;plan=developer">Start free trial</a><ul class="plan-list"><li><span></span>1 private product</li><li><span></span>10 security runs each month</li><li><span></span>3 collaborators</li><li><span></span>Source, scheduled, and PR review</li><li><span></span>Adversarial validation and patch proposals</li><li><span></span>5 controlled evidence shares</li></ul></article>
      <article class="price-card featured"><div class="plan-ribbon">Most popular</div><div class="plan-kicker">Establish coverage</div><h2>Coverage</h2><p class="plan-audience">For a team establishing repeatable testing, remediation, and evidence around one product.</p><div class="price-row"><span class="price annual-price">$160</span><span class="price monthly-price">$200</span><span class="cadence">/ month</span></div><div class="price-note annual-billing-note">$1,920 billed yearly · save $480</div><div class="price-note monthly-billing-note">Billed monthly · switch anytime</div><a class="btn btn-primary plan-btn" href="${signupUrls.startup}?source=pricing&amp;plan=startup">Start free trial <span class="arr">-&gt;</span></a><ul class="plan-list"><li><span></span>1 protected product</li><li><span></span>50 security runs each month</li><li><span></span>15 collaborators, 3 concurrent assessments</li><li><span></span>Source, binary, and authorized live testing</li><li><span></span>Jira routing, patches, and retests</li><li><span></span>25 controlled evidence shares</li></ul></article>
      <article class="price-card"><div class="plan-kicker">Operate continuously</div><h2>Operations</h2><p class="plan-audience">For teams running recurring review, inbound report triage, and remediation across several products.</p><div class="price-row"><span class="price annual-price">$400</span><span class="price monthly-price">$500</span><span class="cadence">/ month</span></div><div class="price-note annual-billing-note">$4,800 billed yearly · save $1,200</div><div class="price-note monthly-billing-note">Billed monthly · switch anytime</div><a class="btn btn-ghost plan-btn" href="${signupUrls.reportTriage}?source=pricing&amp;plan=growth">Start free trial</a><ul class="plan-list"><li><span></span>5 protected products</li><li><span></span>200 security runs each month</li><li><span></span>50 collaborators, 8 concurrent assessments</li><li><span></span>Inbound report triage and GitHub autofix</li><li><span></span>Jira, ServiceNow, and custom reports</li><li><span></span>100 controlled evidence shares</li></ul></article>
      <article class="price-card"><div class="plan-kicker">Standardize</div><h2>Portfolio</h2><p class="plan-audience">For security teams standardizing decisions, automation, and assurance across a product portfolio.</p><div class="price-row"><span class="price annual-price">$800</span><span class="price monthly-price">$1,000</span><span class="cadence">/ month</span></div><div class="price-note annual-billing-note">$9,600 billed yearly · save $2,400</div><div class="price-note monthly-billing-note">Billed monthly · switch anytime</div><a class="btn btn-ghost plan-btn" href="${signupUrls.general}?source=pricing&amp;plan=scale">Start free trial</a><ul class="plan-list"><li><span></span>15 protected products</li><li><span></span>600 security runs each month</li><li><span></span>150 collaborators, 20 concurrent assessments</li><li><span></span>Portfolio-wide triage, autofix, and reporting</li><li><span></span>Workspace appearance and priority rollout</li><li><span></span>500 controlled shares, up to 365 days</li></ul></article>
    </div>
    <div class="enterprise-strip"><div><span class="plan-kicker">Enterprise</span><h3>Need private-network execution or a custom operating boundary?</h3><p>Enterprise includes customer-controlled runner pools for private Git and authorized internal targets, with custom capacity, storage, procurement, assurance, and rollout terms.</p></div><a class="btn btn-ghost" href="/request-scan/">Design Enterprise</a></div>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">The difference</div><h2>A coding agent produces code. ZeroQuarry <em>holds security accountable.</em></h2></div><div class="aside">The pricing is intentionally comparable to developer AI. The job is not. ZeroQuarry maintains an independent product-security record from first test through external evidence.</div></div>
    <div class="included-grid"><div class="included-item"><div class="included-code">TEST</div><h3>Find what ships</h3><p>Review source, release artifacts, binaries, and authorized live behavior across the product boundary.</p></div><div class="included-item"><div class="included-code">CHALLENGE</div><h3>Pressure-test claims</h3><p>Separate discovery from skeptical review, proof, confidence, and explicit human risk decisions.</p></div><div class="included-item"><div class="included-code">REMEDIATE</div><h3>Carry the outcome</h3><p>Generate controlled patches, route ownership, preserve approvals, and verify the actual fix.</p></div><div class="included-item"><div class="included-code">PROVE</div><h3>Answer outsiders</h3><p>Turn the same operating history into reports and controlled evidence for customers, auditors, and leadership.</p></div></div>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">Compare plans</div><h2>The whole package, line by line.</h2></div><div class="aside">Every paid plan includes the core analysis loop. Higher plans add operating scale, automation, and coordination capacity.</div></div>
    <div class="compare-wrap"><table class="compare-table plan-comparison"><thead><tr><th>Capability</th><th>OSS</th><th>Developer</th><th>Coverage</th><th>Operations</th><th>Portfolio</th><th>Enterprise</th></tr></thead><tbody>${comparisonGroups.map(group => `<tr class="compare-group"><th colspan="7">${group.name}</th></tr>${group.rows.map(([feature, oss, developer, coverage, operations, portfolio, enterprise]) => `<tr><th scope="row">${feature}</th><td>${oss}</td><td>${developer}</td><td>${coverage}</td><td>${operations}</td><td>${portfolio}</td><td>${enterprise}</td></tr>`).join("")}`).join("")}</tbody></table></div>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">Add capacity</div><h2>Expand the constraint you actually hit.</h2></div><div class="aside">Add-ons support temporary launch, diligence, or portfolio pressure without forcing an immediate repackage. Persistent overage is a signal that the next plan will be more economical.</div></div>
    <div class="pricing-addon-grid"><article><span>Product coverage</span><h3>+$80 / month</h3><p>One additional protected product on annual billing; $100 when billed monthly.</p></article><article><span>Assessment capacity</span><h3>+$40 / month</h3><p>Twenty-five additional security runs on annual billing; $50 when billed monthly.</p></article><article><span>Design-partner assessment</span><h3>$2,000 once</h3><p>One written product boundary, founder-assisted assessment, adversarial review, technical-reviewer session, and penetration test report. <a href="${foundingCohortPath}">See the outcome guarantee.</a></p></article></div>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">Model usage</div><h2>Choose who funds the <em>model calls.</em></h2></div><div class="aside">Hosted model input and output are billed separately from the subscription. Bring your own provider key and the provider bills those calls directly; ZeroQuarry charges only the platform subscription.</div></div>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">Pricing FAQ</div><h2>Questions that come up before purchase.</h2></div><div class="aside">The commercial model should stay predictable, including the limits and usage charges that affect a production rollout.</div></div>
    <div class="faq-list">${faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div>
  </div></section>
  ${renderCta("Start with the product you are shipping now.", "Try one private product for 30 days without a card. Choose a paid plan only after the workflow has earned a place in your security operation.", signupUrls.general, "Start 30-day trial")}
  </main>`;
  const schemas = [breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Pricing", href: "/pricing" }]), { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "ZeroQuarry", applicationCategory: "SecurityApplication", operatingSystem: "Web", url: `${siteUrl}/pricing`, offers: [{ "@type": "Offer", name: "OSS", price: "0", priceCurrency: "USD" }, { "@type": "Offer", name: "Developer", price: "480", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "480", priceCurrency: "USD", unitText: "YEAR" } }, { "@type": "Offer", name: "Coverage", price: "1920", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "1920", priceCurrency: "USD", unitText: "YEAR" } }, { "@type": "Offer", name: "Operations", price: "4800", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "4800", priceCurrency: "USD", unitText: "YEAR" } }, { "@type": "Offer", name: "Portfolio", price: "9600", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "9600", priceCurrency: "USD", unitText: "YEAR" } }] }];
  return layout({ title: "AI Security Review Pricing from $40 per Month | ZeroQuarry", description: "Try ZeroQuarry free for 30 days or protect a private product from $40 per month annually. Free accounts are also available for eligible open-source maintainers.", canonical: `${siteUrl}/pricing`, active: "pricing", body, schemas });
}

function requestScanPage() {
  const body = `<main>
  <section class="pricing-hero"><div class="container pricing-hero-grid"><div><span class="eyebrow"><span class="tag">WORKING SESSION</span><span>Start with one real security decision</span></span><h1 class="headline pricing-headline"><span class="block">Show us where</span><span class="block thin">security work is</span><span class="block thin"><em>getting stuck.</em></span></h1><p class="lede">Bring a repository, release, authorized application, researcher report, or customer evidence request. We will map the workflow and show where ZeroQuarry can assess, validate, route, fix, retest, and prove the outcome.</p></div><div class="pricing-terminal" aria-label="ZeroQuarry working session"><div class="console-head"><span class="traffic"><span class="r"></span><span class="y"></span><span class="g"></span></span><span class="console-title"><span class="tbl">evaluate://</span>one-real-workflow</span><span class="console-meta"><span class="live">SCOPED</span></span></div><div class="pricing-terminal-body"><div><span class="muted">$</span> choose --moment merge,release,report,customer</div><div><span class="ok">ok</span> anchor the evaluation to a real decision</div><div><span class="muted">$</span> scope --target explicit --authority explicit</div><div><span class="ok">ok</span> boundaries stay controlled</div><div><span class="muted">$</span> follow --through validation,fix,retest,evidence</div><div><span class="ok">ok</span> evaluate the operating outcome, not a demo alert</div></div></div></div></section>
  <section class="pricing-section compact"><div class="container"><div class="contact-panel"><div><div class="tag">Your workflow</div><h2>What should ZeroQuarry help you decide?</h2><p>Enough context to choose a useful starting point is better than a long requirements document. We will follow up to confirm authorization and scope before any testing.</p><ul class="contact-points"><li>What decision or handoff is slow, risky, or manual today?</li><li>Which code, artifact, application, or report is safe to use for evaluation?</li><li>Who needs the outcome: engineering, security, leadership, a customer, or an auditor?</li><li>What would make the evaluation credible enough to expand?</li></ul></div>
    <form class="enterprise-form" name="request-scan" method="POST" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="request-scan"><p class="hidden-field"><label>Do not fill this out: <input name="bot-field"></label></p><label>Work email<input type="email" name="email" autocomplete="email" required></label><label>Company<input type="text" name="company" autocomplete="organization" required></label><label>Product, repo, or company URL<input type="text" name="target" autocomplete="url" required></label><label>Security moment<select name="security-moment" required><option value="baseline">Establish a product-security baseline</option><option value="pr-review">Review risky pull requests</option><option value="release">Review a release</option><option value="inbound-report">Handle an inbound vulnerability report</option><option value="customer-evidence">Answer a customer or auditor</option><option value="disclosure">Coordinate vulnerability disclosure</option><option value="other">Something else</option></select></label><label class="full">What is happening today, and what outcome do you need?<textarea name="message" rows="6" required></textarea></label><button class="btn btn-primary" type="submit">Request a working session <span class="arr">-&gt;</span></button></form>
  </div></div></section></main>`;
  const schemas = [breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Working session", href: "/request-scan/" }])];
  return layout({ title: "Evaluate ZeroQuarry on Your Product-Security Workflow", description: "Evaluate ZeroQuarry on a real repository, release, application, vulnerability report, or customer security workflow.", canonical: `${siteUrl}/request-scan/`, active: "", body, schemas });
}

function redirectPage(destination) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><link rel="canonical" href="${siteUrl}${destination}"><meta http-equiv="refresh" content="0; url=${destination}"><title>Moved | ZeroQuarry</title></head><body><p>This page moved to <a href="${destination}">${destination}</a>.</p></body></html>`;
}

function write(relativePath, content) {
  const output = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, content);
  console.log(`Wrote ${relativePath}`);
}

write("index.html", homePage());
write("platform.html", platformHub());
write("pricing.html", pricingPage());
write("request-scan/index.html", requestScanPage());
write("founding-security-cohort/index.html", foundingSecurityCohortPage());
write("founding-security-cohort/thanks/index.html", foundingSecurityCohortThanksPage());
write("partners/index.html", securityPartnerPage());
write("partners/thanks/index.html", securityPartnerThanksPage());
write("open-source/index.html", openSourcePage());
write("use-cases/index.html", useCasesHub());
for (const page of platformPages) write(`platform/${page.slug}/index.html`, renderDetail(page, "platform"));
for (const page of useCasePages) write(`use-cases/${page.slug}/index.html`, renderDetail(page, "use-cases"));
write("features.html", redirectPage("/platform"));
write("continuous-testing.html", redirectPage("/platform/continuous-security/"));
write("evidence-reports.html", redirectPage("/platform/evidence-reporting/"));
