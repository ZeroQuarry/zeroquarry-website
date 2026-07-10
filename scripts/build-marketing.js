const fs = require("fs");
const path = require("path");
const { siteFooter, siteNav } = require("./site-shell");

const root = path.resolve(__dirname, "..");
const siteUrl = "https://zeroquarry.com";
const socialImage = `${siteUrl}/assets/og-zeroquarry.png`;

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

function layout({ title, description, canonical, active, body, schemas = [] }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:image" content="${socialImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${socialImage}" />
<link rel="icon" type="image/png" href="/assets/favicon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/index.css" />
<link rel="stylesheet" href="/marketing.css" />
<link rel="stylesheet" href="/cookie-consent.css" />
<script src="/cookie-consent.js" data-analytics-id="G-ZRT44MWJT1" defer></script>
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
    h1: "Test the product you ship, not just the <em>code you wrote.</em>",
    lede: "ZeroQuarry combines AI code security review, binary analysis, and authorized live application testing so teams can follow vulnerabilities across build, packaging, and runtime boundaries.",
    image: "/assets/product/report-overview.png",
    imageAlt: "ZeroQuarry security assessment report showing findings and review controls",
    proof: ["Source repositories", "Binary artifacts", "Authorized live targets"],
    sectionTitle: "Three assessment surfaces. One <em>evidence chain.</em>",
    sectionIntro: "A source finding can disappear during packaging—or only become exploitable at runtime. Keeping every surface in one project makes those differences visible.",
    capabilities: [
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
      ["Is ZeroQuarry a SAST or DAST scanner?", "ZeroQuarry covers source, binary, and authorized live targets, but its workflow is closer to agent-led security research than a deterministic rule scanner. It investigates product-specific behavior and produces evidence for review."],
      ["Can it test private repositories?", "Yes. Accounts can configure scoped HTTPS or SSH Git credentials, and CI workflows can reference the saved credential without placing it in the scan payload."],
      ["Can ZeroQuarry test production?", "Remote testing requires explicit authorization and scope. Use a staging or production-like environment when active probes could create risk, and keep the allowed host boundary narrow."],
    ],
    related: [["/use-cases/release-security-review/", "Release security review"], ["/use-cases/pr-security-review/", "Pull request security review"], ["/platform/adversarial-validation/", "Adversarial validation"]],
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
    sectionTitle: "False positives become a <em>process problem</em>, not a filter setting.",
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
      ["Less alert fatigue", "Engineering sees reviewed claims with a visible evidence trail, not a raw queue of model suggestions."],
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
    sectionIntro: "The right cadence is not a full pentest on every commit. It is a reliable security signal around high-risk changes, plus a path to deeper review when the signal warrants it.",
    capabilities: [
      ["GitHub Actions workflow", "Install a maintained workflow that dispatches repository scans on pull requests, pushes, schedules, or manual runs."],
      ["Delta scans", "Use Git history to focus the next assessment on changed files and adjacent data flow after the first baseline."],
      ["Native schedules", "Attach daily, weekly, or monthly coverage to a Git lineage and skip unchanged commits automatically."],
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
    h1: "Turn security work into an <em>operating loop</em>, not an inbox.",
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
      ["Can external email trigger arbitrary scans?", "No. Email processing requires an assigned project address, an allowed sender, approved repositories, and an explicit setting for remote targets. Auto-start can remain off while rules are tuned."],
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
    lede: "Generate focused diffs, stage audited auto-fix proposals, open pull requests through ZeroQuarryBot, or hand findings into the team’s ticketing system—then retest in the same lineage.",
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
      ["Retest and regression history", "Re-run focused assessments, record mitigation and retest decisions, and surface a later recurrence as regression."],
    ],
    workflow: [
      ["Validate", "Confirm the vulnerability applies to the product before generating or filing remediation work."],
      ["Propose", "Generate a patch, auto-fix proposal, or ticket with source, impact, proof, and expected outcome."],
      ["Review", "Use normal engineering ownership, CI, branch protection, and code-review controls."],
      ["Retest", "Verify the risk after merge and record retested or regression state in the original history."],
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
    slug: "evidence-reporting",
    title: "Security Evidence, Pentest Reports, and Customer Assurance | ZeroQuarry",
    description: "Create pentest-style PDF reports, asset evidence packs, controlled finding shares, disclosure records, and audit trails for customers and auditors.",
    eyebrow: "Security evidence and reporting",
    h1: "Make security work <em>provable</em> when someone asks.",
    lede: "Package current evidence by asset, export reviewed reports, share only the findings a recipient needs, and retain the decision history behind remediation, retest, and accepted risk.",
    image: "/assets/product/evidence-room.png",
    imageAlt: "ZeroQuarry Evidence Room with target-level security reports and PDF export",
    proof: ["Asset-level Evidence Room", "Pentest-style PDF exports", "Expiring finding shares"],
    sectionTitle: "Evidence should be a by-product of the <em>operating process.</em>",
    sectionIntro: "Waiting for a customer questionnaire or audit to reconstruct security history from tickets and chat is expensive—and often produces an incomplete story.",
    capabilities: [
      ["Evidence Room", "See completed work by actual Git repository, URL, upload, or path and export the latest report for selected assets."],
      ["Report and finding exports", "Create Markdown, single-file HTML, or pentest-style PDF outputs with confidence and review filters."],
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
      ["What is included in a PDF report?", "The pentest-style layout can include target context, executive summary, finding overview, per-finding evidence, and configured report definitions, branding, and disclaimers."],
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
    proof: ["Seed to Series E", "One operating record", "Human control points"],
    sectionTitle: "Security maturity should grow with the <em>company’s actual risk.</em>",
    sectionIntro: "A seed company needs a defensible baseline. A later-stage company needs consistent execution across products, owners, customer commitments, and audit evidence. The loop is the same; depth and governance increase.",
    capabilities: [
      ["Seed: establish the baseline", "Map the core product, assess the main repository, validate important findings, and retain one reviewed evidence record."],
      ["Series A–B: enter delivery", "Add PR or scheduled coverage, route accepted findings into engineering, and operationalize external report intake."],
      ["Series C–E: scale decisions", "Standardize lifecycle states, adversarial review, repository controls, retests, and asset-level assurance evidence."],
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
      ["A buyer-ready security story", "Show how software is tested, how findings are handled, and how fixes are verified—not just which scanner is installed."],
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
    sectionTitle: "Use CI as a <em>tripwire</em>, not a replacement for triage.",
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
      ["Persistent change history", "Keep scans, findings, discussions, fixes, and retests with the product project—not only the CI run."],
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
    sectionTitle: "The risk is not just missing a real report. It is <em>losing context</em> during intake.",
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
      ["Should auto-start be enabled immediately?", "Start with manual kickoff while tuning senders, repositories, and remote-scan policy. Enable automatic start after the reports and target matching behave as expected."],
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
      ["Evidence packs", "Select the assets in scope and combine the latest reports into a branded pentest-style PDF."],
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
    sectionIntro: "A vendor, researcher, or bounty program needs a reproducible claim, clear affected scope, and a controlled communication trail—not raw model output.",
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

function renderDetail(page, type) {
  const isPlatform = type === "platform";
  const baseLabel = isPlatform ? "Platform" : "Use cases";
  const baseHref = isPlatform ? "/platform" : "/use-cases/";
  const canonicalPath = isPlatform ? `/platform/${page.slug}/` : `/use-cases/${page.slug}/`;
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
            <a class="btn btn-primary" href="/request-scan/">See it on your product <span class="arr">-&gt;</span></a>
            <a class="btn btn-ghost" href="https://docs.zeroquarry.com">Read the documentation</a>
          </div>
          <div class="buyer-proofline">${page.proof.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        </div>
        <figure class="product-frame hero-image">
          <img src="${page.image}" alt="${escapeHtml(page.imageAlt)}" width="1440" height="1000" loading="eager">
        </figure>
      </div>
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">What the platform changes</div><h2>${page.sectionTitle}</h2></div><p class="section-intro">${escapeHtml(page.sectionIntro)}</p></div>
      ${renderCards(page.capabilities)}
    </div>
  </section>

  <section class="buyer-section">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Operating workflow</div><h2>From trigger to <em>verified outcome.</em></h2></div><p class="section-intro">ZeroQuarry automates investigation and coordination while keeping authorization, product context, risk ownership, and production change authority explicit.</p></div>
      ${renderWorkflow(page.workflow)}
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Buyer outcomes</div><h2>What this changes for the <em>team.</em></h2></div><p class="section-intro">The value is not scan volume. It is better coverage, faster decisions, cleaner remediation, and evidence that survives the next question.</p></div>
      <div class="outcome-grid">${page.outcomes.map(([title, text]) => `<article class="outcome-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("\n")}</div>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Questions buyers ask</div><h2>Practical answers before <em>evaluation.</em></h2></div><p class="section-intro">ZeroQuarry is designed to increase security capacity without hiding the human control points that matter.</p></div>
      ${renderFaqs(page.faqs)}
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">Related workflows</div><h2>Continue through the <em>operating loop.</em></h2></div></div>
      ${renderRelated(page.related)}
    </div>
  </section>

  ${renderCta("Give us one real security boundary.", "We’ll use your product context to show how ZeroQuarry investigates, validates, and turns the result into an operating decision—not just another scanner output.")}
  </main>`;

  return layout({ title: page.title, description: page.description, canonical: `${siteUrl}${canonicalPath}`, active: type === "platform" ? "platform" : "use-cases", body, schemas });
}

function renderCta(title, text) {
  return `<section class="buyer-cta"><div class="container"><div class="buyer-cta-panel"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></div><div class="buyer-actions"><a class="btn btn-primary" href="/request-scan/">Request a working session <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="https://console.zeroquarry.com">Open the console</a></div></div></div></section>`;
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
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", category: "30-day trial" },
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
        <div class="buyer-kicker">AI security operations for software companies</div>
        <h1 class="buyer-title">Run product security like you already <em>staffed the team.</em></h1>
        <p class="buyer-lede">ZeroQuarry receives security work, tests source, binaries, and live applications, challenges weak findings, opens fixes, verifies remediation, and packages the evidence customers ask for.</p>
        <div class="buyer-actions"><a class="btn btn-primary" href="/request-scan/">See it on your workflow <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/platform">Explore the platform</a></div>
        <div class="buyer-proofline"><span>AI penetration testing</span><span>Application security operations</span><span>Evidence and remediation</span></div>
      </div>
      <div class="hero-system" aria-label="ZeroQuarry security operating loop">
        <div class="system-head"><span>security-ops://product</span><span class="system-status">loop active</span></div>
        <div class="loop-map">
          <div class="loop-node"><span>01 / RECEIVE</span><strong>Code change or report</strong><p>PR, schedule, manual review, API, or forwarded researcher email.</p></div>
          <div class="loop-node"><span>02 / ASSESS</span><strong>Source, binary, live</strong><p>Specialist agents investigate the surface that can change the decision.</p></div>
          <div class="loop-node wide"><span>03 / VALIDATE</span><strong>Red team claim vs. vendor challenge</strong><p>Evidence must survive skeptical review before it becomes expensive work.</p></div>
          <div class="loop-node"><span>04 / REMEDIATE</span><strong>Patch, PR, or ticket</strong><p>Route accepted work through GitHub, Jira, ServiceNow, and engineering controls.</p></div>
          <div class="loop-node"><span>05 / PROVE</span><strong>Retest and evidence</strong><p>Preserve decisions, verification, reports, controlled shares, and asset history.</p></div>
        </div>
        <div class="system-foot"><span class="pulse-dot"></span><span>authorization and risk ownership remain human</span></div>
      </div>
    </div>
  </section>

  <section class="buyer-section soft">
    <div class="container">
      <div class="buyer-section-head"><div><div class="section-label">The buying moments</div><h2>Security becomes urgent in <em>recognizable moments.</em></h2></div><p class="section-intro">ZeroQuarry is designed around the decisions buyers actually face—not a generic inventory of scanner features.</p></div>
      <div class="moment-grid">
        ${[["Enterprise deal", "A buyer asks for current test evidence and how findings are remediated.", "/use-cases/customer-security-reviews/"], ["Risky release", "A change crosses identity, tenant, billing, upload, webhook, or runtime boundaries.", "/use-cases/release-security-review/"], ["Researcher report", "An external claim arrives and someone must resolve the target, reproduce it, and respond.", "/use-cases/inbound-vulnerability-reports/"], ["Fast-moving codebase", "Security review must happen in PR and scheduled workflows without becoming a noisy gate.", "/use-cases/pr-security-review/"], ["Lean security team", "The company needs real coverage before it can hire every AppSec and security-operations specialty.", "/use-cases/startup-security/"], ["External disclosure", "A serious claim needs stronger proof, controlled delivery, remediation, and timeline tracking.", "/use-cases/vulnerability-disclosure/"]].map(([title, text, href], index) => `<a class="moment-card" href="${href}"><div class="card-code">0${index + 1}</div><h3>${title}</h3><p>${text}</p><span class="card-link">See the workflow <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}
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
      <div class="use-case-grid">${useCasePages.map((page, index) => `<a class="use-case-card" href="/use-cases/${page.slug}/"><div class="card-code">0${index + 1} / Use case</div><h3>${escapeHtml(page.eyebrow)}</h3><p>${escapeHtml(page.description)}</p><span class="card-link">See the playbook <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}</div>
    </div>
  </section>

  <section class="buyer-section">
    <div class="container split-proof">
      <div class="proof-copy"><div class="section-label">Research-backed</div><h2>Built where real vulnerability reports <em>land.</em></h2><p>ZeroQuarry’s workflows come from finding, validating, coordinating, and fixing real product vulnerabilities—not from wrapping a chat interface around a pattern scanner.</p><div class="proof-list"><div><span>RCE</span><p>Published coordinated research on exploitable plugin and extension ecosystems.</p></div><div><span>15Y</span><p>Security leadership and vulnerability-triage experience across Elastic, Kong, and Vectara.</p></div><div><span>LOOP</span><p>Validated research patterns feed future prompts, coverage, report language, and evidence structure.</p></div></div><a class="card-link" href="/research/">Read ZeroQuarry research <span aria-hidden="true">-&gt;</span></a></div>
      <div class="hero-system"><div class="system-head"><span>research://evidence</span><span class="system-status">coordinated</span></div><div class="loop-map"><div class="loop-node wide"><span>CLAIM</span><strong>Opening untrusted Markdown reaches executable behavior</strong><p>Trace the plugin path, prove reachability, and identify the affected configuration.</p></div><div class="loop-node"><span>CHALLENGE</span><strong>Is execution actually reachable?</strong><p>Test default state, permissions, versions, and realistic user action.</p></div><div class="loop-node"><span>OUTCOME</span><strong>Fix, disclose, publish</strong><p>Coordinate the maintainer response before turning the finding into public research.</p></div></div><div class="system-foot"><span class="pulse-dot"></span><span>public writeups follow responsible disclosure</span></div></div>
    </div>
  </section>
  ${renderCta("Start with one real product boundary.", "Give ZeroQuarry a repository, release artifact, or authorized target and see the full path from investigation to a reviewed operating decision.")}
  </main>`;

  return layout({ title: "AI Security Operations for Product Teams | ZeroQuarry", description: "ZeroQuarry is an AI security operations platform for continuous application security testing, vulnerability validation, remediation, retesting, and customer evidence.", canonical: `${siteUrl}/`, active: "home", body, schemas });
}

function platformHub() {
  const body = `<main class="marketing-main">
  <section class="buyer-hero"><div class="container buyer-hero-grid"><div><div class="buyer-kicker">ZeroQuarry platform</div><h1 class="buyer-title">The security work <em>between pentests.</em></h1><p class="buyer-lede">One AI security-operations platform to receive work, test the product, challenge findings, route remediation, verify fixes, and package evidence.</p><div class="buyer-actions"><a class="btn btn-primary" href="/request-scan/">See it on your product <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/use-cases/">Explore use cases</a></div><div class="buyer-proofline"><span>Application security</span><span>Vulnerability operations</span><span>Customer assurance</span></div></div><figure class="product-frame hero-image"><img src="/assets/product/report-overview.png" alt="ZeroQuarry platform report overview" width="1440" height="1000" loading="eager"></figure></div></section>
  <section class="buyer-section soft"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Capability map</div><h2>Choose an entry point. Keep one <em>operating record.</em></h2></div><p class="section-intro">Each capability is useful independently; together they replace the fragmented handoffs between scanners, inboxes, tickets, patch tools, retests, and audit folders.</p></div><div class="capability-grid">${platformPages.map((page, index) => `<a class="capability-card" href="/platform/${page.slug}/"><div class="card-code">0${index + 1}</div><h3>${escapeHtml(page.eyebrow)}</h3><p>${escapeHtml(page.description)}</p><span class="card-link">Explore capability <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}</div></div></section>
  <section class="buyer-section"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Operating model</div><h2>The scan is one stage, <em>not the product.</em></h2></div><p class="section-intro">ZeroQuarry treats intake, validation, ownership, remediation, retesting, and assurance as first-class security work.</p></div><div class="operation-rail">${[["Receive", "PR, schedule, API, report"], ["Assess", "Source, binary, live"], ["Validate", "Proof and skeptical review"], ["Decide", "State, reason, owner"], ["Remediate", "Patch, PR, ticket"], ["Retest", "Verify or regress"], ["Prove", "Evidence and sharing"]].map(([title, text], i) => `<div class="operation-step"><small>0${i + 1}</small><h3>${title}</h3><p>${text}</p></div>`).join("")}</div></div></section>
  <section class="buyer-section soft"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Designed for control</div><h2>Automation where it scales. Humans where <em>authority matters.</em></h2></div><p class="section-intro">ZeroQuarry can automate investigation and routine coordination without silently authorizing a live test, accepting business risk, exposing evidence, or merging production code.</p></div><div class="outcome-grid"><article class="outcome-card"><h3>Authorization stays explicit</h3><p>Remote targets, sender and repository boundaries, shares, and GitHub access are individually controlled.</p></article><article class="outcome-card"><h3>Decisions retain reasons</h3><p>Validation, dispute, regression, accepted risk, and archive history remain visible and attributable.</p></article><article class="outcome-card"><h3>Production controls remain yours</h3><p>Generated changes flow through installation, enrollment, approval, branch protection, CI, review, and merge.</p></article></div></div></section>
  ${renderCta("See the complete loop on your product.", "A useful evaluation starts with a real security boundary and follows the result all the way through validation, remediation, and evidence.")}
  </main>`;
  const schemas = [breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Platform", href: "/platform" }]), { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "ZeroQuarry", applicationCategory: "SecurityApplication", operatingSystem: "Web", description: "AI security operations platform for application security testing, validation, remediation, and reporting.", url: `${siteUrl}/platform` }];
  return layout({ title: "AI Security Operations Platform | ZeroQuarry", description: "Explore ZeroQuarry's AI security testing, adversarial validation, continuous security, vulnerability operations, remediation, and evidence capabilities.", canonical: `${siteUrl}/platform`, active: "platform", body, schemas });
}

function useCasesHub() {
  const body = `<main class="marketing-main">
  <section class="buyer-hero"><div class="container buyer-hero-grid"><div><div class="buyer-kicker">ZeroQuarry use cases</div><h1 class="buyer-title">Start with the moment security becomes <em>urgent.</em></h1><p class="buyer-lede">The right workflow depends on the decision: merge a risky PR, ship a release, answer a researcher, satisfy a customer, or build a credible program with a lean team.</p><div class="buyer-actions"><a class="btn btn-primary" href="/request-scan/">Discuss your workflow <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="/platform">Explore the platform</a></div></div><div class="hero-system"><div class="system-head"><span>use-case://router</span><span class="system-status">ready</span></div><div class="loop-map"><div class="loop-node"><span>BUILD</span><strong>Shipping product</strong><p>PR review, release review, continuous baseline.</p></div><div class="loop-node"><span>OPERATE</span><strong>Handling findings</strong><p>Intake, validation, ownership, fixes, retest.</p></div><div class="loop-node wide"><span>PROVE</span><strong>Answering external trust questions</strong><p>Customer reviews, audit evidence, vulnerability disclosure, product history.</p></div></div><div class="system-foot"><span class="pulse-dot"></span><span>choose by outcome, not scanner category</span></div></div></div></section>
  <section class="buyer-section soft"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Use-case library</div><h2>Six workflows buyers <em>recognize immediately.</em></h2></div><p class="section-intro">Each one combines the appropriate assessment surface, validation depth, human decision, remediation path, and evidence output.</p></div><div class="use-case-grid">${useCasePages.map((page, index) => `<a class="use-case-card" href="/use-cases/${page.slug}/"><div class="card-code">0${index + 1}</div><h3>${escapeHtml(page.eyebrow)}</h3><p>${escapeHtml(page.description)}</p><span class="card-link">See the playbook <span aria-hidden="true">-&gt;</span></span></a>`).join("\n")}</div></div></section>
  <section class="buyer-section"><div class="container"><div class="buyer-section-head"><div><div class="section-label">Company stage</div><h2>The same loop, with <em>different depth.</em></h2></div><p class="section-intro">Company stage is only a proxy. Use the pattern that matches product exposure, customer pressure, change rate, and the cost of a miss.</p></div><div class="stage-table-wrap"><table class="stage-table"><thead><tr><th>Stage</th><th>Primary buyer concern</th><th>Starting workflow</th><th>What good looks like</th></tr></thead><tbody><tr><td>Seed</td><td>Do we know our critical product risk?</td><td>Source baseline and release review</td><td>Important findings have a decision and one fix has been retested.</td></tr><tr><td>Series A–B</td><td>Can security keep up with delivery?</td><td>PR review, schedules, issue routing</td><td>Security work moves through engineering without a separate manual program.</td></tr><tr><td>Series C–E</td><td>Can we execute consistently and prove it?</td><td>Lifecycle, adversarial review, evidence packs</td><td>Assets, decisions, remediation, exceptions, and retests are traceable.</td></tr></tbody></table></div></div></section>
  ${renderCta("Which security moment is consuming the most time?", "Start there. ZeroQuarry can expand into the rest of the operating loop once one workflow is producing clear decisions and verified outcomes.")}
  </main>`;
  const schemas = [breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Use cases", href: "/use-cases/" }])];
  return layout({ title: "Application Security and AI Pentesting Use Cases | ZeroQuarry", description: "Explore ZeroQuarry workflows for startup security, pull request review, release testing, inbound reports, customer assurance, and vulnerability disclosure.", canonical: `${siteUrl}/use-cases/`, active: "use-cases", body, schemas });
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
      ["Protected products", "1", "3", "10", "Custom"],
      ["Security runs / month", "25", "100", "300", "Custom"],
      ["Concurrent assessments", "2", "4", "10", "Custom"],
      ["Collaborators", "10", "25", "75", "Custom"],
    ] },
    { name: "Assessment coverage", rows: [
      ["Source-code and private-repository review", "Included", "Included", "Included", "Included"],
      ["Release artifact and binary review", "Included", "Included", "Included", "Included"],
      ["Authorized live-application testing", "Included", "Included", "Included", "Included"],
      ["Scheduled and pull-request review", "Included", "Included", "Included", "Included"],
      ["Proof generation and adversarial validation", "Included", "Included", "Included", "Included"],
    ] },
    { name: "Security operations", rows: [
      ["Patch proposals and finding retests", "Included", "Included", "Included", "Included"],
      ["Jira issue creation", "Included", "Included", "Included", "Included"],
      ["ServiceNow issue creation", "—", "Included", "Included", "Included"],
      ["Inbound researcher-report email triage", "—", "Included", "Included", "Included"],
      ["GitHub autofix with human approval", "—", "Included", "Included", "Included"],
    ] },
    { name: "Evidence and rollout", rows: [
      ["Controlled evidence shares", "10", "50", "200", "Custom"],
      ["Maximum share expiry", "30 days", "90 days", "365 days", "Custom"],
      ["Custom report branding", "—", "Included", "Included", "Included"],
      ["Workspace appearance controls", "—", "—", "Included", "Included"],
      ["Rollout and procurement support", "Standard", "Guided", "Priority", "Custom"],
    ] },
  ];
  const faqs = [
    ["What counts as a protected product?", "One customer-facing product or service with a coherent codebase, release boundary, and evidence history. A monorepo can still be one product; unrelated products with separate owners and risk decisions count separately."],
    ["What consumes a security run?", "A focused pull-request or changed-file review consumes 1 security run. A full source, binary, or authorized live assessment consumes 5. Reports, lifecycle decisions, evidence sharing, and rerunning a pipeline stage inside the same assessment do not consume more. Any newly started scan is metered by its scope."],
    ["Why is pricing not per seat?", "Security value comes from product coverage, investigation depth, and decisions completed—not how many people view a report. Collaborator limits protect operational scale without turning healthy cross-functional participation into a tax."],
    ["Is model usage included?", "No. Model input and output are metered separately at the posted rates below, so you can match model depth to the decision and see the cost by scan. The annual platform fee pays for the security operating system and reserved assessment capacity."],
    ["Can we add capacity without changing plans?", "Yes. Add protected products or bundles of 25 monthly security runs. If that becomes a recurring pattern, moving to the next plan will usually provide better economics and more operating controls."],
    ["Does this replace a human pentest?", "ZeroQuarry creates continuous assessment and evidence between point-in-time tests. Some regulations, customers, or insurance policies may still require a named independent human assessor; we will scope those requirements honestly rather than treating every report as interchangeable."],
  ];
  const body = `<main>
  <section class="pricing-hero">
    <div class="container pricing-hero-grid">
      <div>
        <span class="eyebrow"><span class="tag">PRICING</span><span>Plans for seed through Series E</span></span>
        <h1 class="headline pricing-headline"><span class="block">Buy security capacity.</span><span class="block thin">Not seats. Not</span><span class="block thin"><em>scanner noise.</em></span></h1>
        <p class="lede">Annual plans reserve the product coverage and assessment capacity your team can actually operate. Model usage stays separate and visible, so routine reviews and deep investigations do not hide behind the same black-box fee.</p>
        <div class="hero-ctas"><a class="btn btn-primary" href="/request-scan/">Choose a rollout <span class="arr">-&gt;</span></a><a class="btn btn-ghost" href="https://console.zeroquarry.com">Start the trial</a></div>
      </div>
      <div class="pricing-terminal" aria-label="ZeroQuarry pricing model">
        <div class="console-head"><span class="traffic"><span class="r"></span><span class="y"></span><span class="g"></span></span><span class="console-title"><span class="tbl">package://</span>security-capacity</span><span class="console-meta"><span class="live">LEGIBLE</span></span></div>
        <div class="pricing-terminal-body"><div><span class="muted">$</span> measure --unit security-run</div><div><span class="ok">1 run</span> focused PR or changed-file review</div><div><span class="ok">5 runs</span> full source, binary, or live assessment</div><div><span class="muted">$</span> include validation,decisions,reports,retests</div><div><span class="ok">ok</span> operate the finding without a click tax</div><div><span class="muted">$</span> meter model-usage --visible true</div></div>
      </div>
    </div>
  </section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">The value metric</div><h2>One unit buyers can <em>forecast.</em></h2></div><div class="aside">A security run represents reserved investigation capacity. It makes a five-minute PR check economically different from a full product assessment without turning every finding, report, or teammate into a surcharge.</div></div>
    <div class="run-metric-grid"><article><div class="run-number">1</div><div><h3>Focused review</h3><p>A pull request or changed-file assessment scoped to the code that moved.</p></div></article><article><div class="run-number">5</div><div><h3>Full assessment</h3><p>A complete source, release artifact, binary, or authorized live target review.</p></div></article><article><div class="run-number included">0</div><div><h3>Operational follow-through</h3><p>Review stages, decisions, reports, evidence sharing, and in-assessment reruns.</p></div></article></div>
    <div class="trial-strip"><div><span class="plan-kicker">30-day evaluation</span><h3>Trial · $0</h3><p>Five public source assessments, one operator, no card required, and watermarked reports. Enough to prove the workflow on a real repository.</p></div><a class="btn btn-ghost" href="https://console.zeroquarry.com">Start the trial</a></div>
  </div></section>

  <section class="pricing-section" id="plans"><div class="container">
    <div class="section-head"><div><div class="tag">Annual plans</div><h2>Match coverage to the <em>company you are becoming.</em></h2></div><div class="aside">Prices show the monthly equivalent and are billed annually. Every plan includes the complete assessment-to-evidence loop; higher plans expand products, run capacity, automation, and external-facing controls.</div></div>
    <div class="pricing-grid">
      <article class="price-card"><div class="plan-kicker">Establish</div><h2>Foundation</h2><p class="plan-audience">For a seed or early Series A company establishing a credible security baseline around one product.</p><div class="price-row"><span class="price">$1,250</span><span class="cadence">/ month</span></div><div class="price-note">$15,000 billed annually</div><a class="btn btn-ghost plan-btn" href="/request-scan/">Scope Foundation</a><ul class="plan-list"><li><span></span>1 protected product</li><li><span></span>25 security runs each month</li><li><span></span>10 collaborators, 2 concurrent assessments</li><li><span></span>Source, binary, and authorized live testing</li><li><span></span>Adversarial validation, patches, and retests</li><li><span></span>Jira routing and 10 controlled shares</li></ul></article>
      <article class="price-card featured"><div class="plan-ribbon">Most common</div><div class="plan-kicker">Operate</div><h2>Growth</h2><p class="plan-audience">For Series A–C teams making security part of delivery while researcher reports and customer pressure increase.</p><div class="price-row"><span class="price">$3,000</span><span class="cadence">/ month</span></div><div class="price-note">$36,000 billed annually</div><a class="btn btn-primary plan-btn" href="/request-scan/">Scope Growth <span class="arr">-&gt;</span></a><ul class="plan-list"><li><span></span>3 protected products</li><li><span></span>100 security runs each month</li><li><span></span>25 collaborators, 4 concurrent assessments</li><li><span></span>Inbound security-report email triage</li><li><span></span>GitHub autofix with human approval</li><li><span></span>Jira, ServiceNow, custom reports, 50 shares</li></ul></article>
      <article class="price-card"><div class="plan-kicker">Standardize</div><h2>Scale</h2><p class="plan-audience">For Series C–E companies coordinating a portfolio of products, evidence consumers, and engineering teams.</p><div class="price-row"><span class="price">$7,500</span><span class="cadence">/ month</span></div><div class="price-note">$90,000 billed annually</div><a class="btn btn-ghost plan-btn" href="/request-scan/">Scope Scale</a><ul class="plan-list"><li><span></span>10 protected products</li><li><span></span>300 security runs each month</li><li><span></span>75 collaborators, 10 concurrent assessments</li><li><span></span>Portfolio-wide inbound triage and autofix</li><li><span></span>Custom report and workspace appearance</li><li><span></span>200 controlled shares, up to 365 days</li></ul></article>
      <article class="price-card enterprise"><div class="plan-kicker">Control</div><h2>Enterprise</h2><p class="plan-audience">For complex portfolios, higher assurance requirements, tailored capacity, or a reviewed deployment architecture.</p><div class="price-row"><span class="price contact">Custom</span></div><div class="price-note">Annual agreement</div><a class="btn btn-ghost plan-btn" href="/request-scan/">Design Enterprise</a><ul class="plan-list"><li><span></span>Custom products, runs, concurrency, and storage</li><li><span></span>Custom collaborator and evidence-sharing limits</li><li><span></span>Security, privacy, and procurement review</li><li><span></span>Deployment architecture review</li><li><span></span>Rollout design across engineering groups</li><li><span></span>Commercial terms aligned to the program</li></ul></article>
    </div>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">Compare plans</div><h2>The whole package, <em>line by line.</em></h2></div><div class="aside">No plan withholds the core analysis loop. Packaging expands operating scale and automation where the value—and the coordination burden—actually grows.</div></div>
    <div class="compare-wrap"><table class="compare-table plan-comparison"><thead><tr><th>Capability</th><th>Foundation</th><th>Growth</th><th>Scale</th><th>Enterprise</th></tr></thead><tbody>${comparisonGroups.map(group => `<tr class="compare-group"><th colspan="5">${group.name}</th></tr>${group.rows.map(([feature, foundation, growth, scale, enterprise]) => `<tr><th scope="row">${feature}</th><td>${foundation}</td><td>${growth}</td><td>${scale}</td><td>${enterprise}</td></tr>`).join("")}`).join("")}</tbody></table></div>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">Add capacity</div><h2>Expand the constraint you <em>actually hit.</em></h2></div><div class="aside">Add-ons support temporary launch, diligence, or portfolio pressure without forcing an immediate repackage. Persistent overage is a signal that the next plan will be more economical.</div></div>
    <div class="pricing-addon-grid"><article><span>Product coverage</span><h3>+$500 / month</h3><p>One additional protected product, billed annually alongside the platform plan.</p></article><article><span>Assessment capacity</span><h3>+$500 / month</h3><p>Twenty-five additional security runs each month, billed annually.</p></article><article><span>Guided baseline</span><h3>$2,500 once</h3><p>Scope, onboarding, first baseline assessment, and a working session around the resulting operating plan.</p></article></div>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">Model usage</div><h2>Depth stays visible <em>on the invoice.</em></h2></div><div class="aside">Model input and output are billed separately from the annual platform plan. Choose efficient models for routine change review and deeper models where the risk or decision warrants it.</div></div>
    <div class="compare-wrap"><table class="compare-table"><thead><tr><th>Model</th><th>Input / 1M tokens</th><th>Output / 1M tokens</th></tr></thead><tbody>${rates.map(([model, input, output]) => `<tr><td><code>${model}</code></td><td>${input}</td><td>${output}</td></tr>`).join("")}</tbody></table></div>
    <p class="usage-rate-note">Rates shown in USD reflect the current product configuration. Your account shows active rates, scan-level token history, and monthly usage. Cached-input discounts, when configured for a model, are applied separately.</p>
  </div></section>

  <section class="pricing-section compact"><div class="container">
    <div class="section-head"><div><div class="tag">Pricing FAQ</div><h2>Questions a serious buyer <em>should ask.</em></h2></div><div class="aside">The aim is a predictable commercial model with honest boundaries—not an artificially simple number that becomes surprising in production.</div></div>
    <div class="faq-list">${faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div>
  </div></section>
  ${renderCta("Price the workflow that is costing you time.", "Bring one current security motion—release review, inbound reports, customer evidence, or remediation—and we will map the smallest useful ZeroQuarry rollout.")}
  </main>`;
  const schemas = [breadcrumbData([{ name: "ZeroQuarry", href: "/" }, { name: "Pricing", href: "/pricing" }]), { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "ZeroQuarry", applicationCategory: "SecurityApplication", operatingSystem: "Web", url: `${siteUrl}/pricing`, offers: [{ "@type": "Offer", name: "Foundation", price: "15000", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "15000", priceCurrency: "USD", unitText: "YEAR" } }, { "@type": "Offer", name: "Growth", price: "36000", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "36000", priceCurrency: "USD", unitText: "YEAR" } }, { "@type": "Offer", name: "Scale", price: "90000", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "90000", priceCurrency: "USD", unitText: "YEAR" } }] }];
  return layout({ title: "AI Pentesting and Security Operations Pricing | ZeroQuarry", description: "Compare ZeroQuarry plans for AI pentesting, continuous application security, pull-request review, vulnerability operations, remediation, and security evidence.", canonical: `${siteUrl}/pricing`, active: "pricing", body, schemas });
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
write("use-cases/index.html", useCasesHub());
for (const page of platformPages) write(`platform/${page.slug}/index.html`, renderDetail(page, "platform"));
for (const page of useCasePages) write(`use-cases/${page.slug}/index.html`, renderDetail(page, "use-cases"));
write("features.html", redirectPage("/platform"));
write("continuous-testing.html", redirectPage("/platform/continuous-security/"));
write("evidence-reports.html", redirectPage("/platform/evidence-reporting/"));
