# AGENTS.md — zeroquarry.com

This file is written for AI agents. It gives you a factual map of what ZeroQuarry is and what it does, then shows you how to find your way around this website. Everything below is drawn from the site's own pages; the linked page is always the source of truth. Last reviewed: 2026-10-10.

If you are a coding agent working in this repository, skip to "Working in this repository" at the end.

---

## What ZeroQuarry is

ZeroQuarry is an AI security-operations platform that continuously tests software products and proves every finding before it becomes your team's work. One platform covers the full finding lifecycle: it receives inbound vulnerability reports, tests source code, binaries, and authorized live applications, challenges every finding with adversarial review, routes and fixes what survives, retests the fix, and packages the whole history as evidence for customers and auditors.

The operating loop: **Receive → Assess → Validate → Decide → Remediate → Retest → Prove.** Every step writes to the same project record, so a question asked months later — "why was this dismissed?", "was this fix verified?", "when was this last tested?" — has an answer on file.

The core idea: finding security problems is easy, and automated scanners are fast and confident and often wrong. ZeroQuarry's differentiator is what happens after detection:

- **Adversarial validation.** Every finding must survive a skeptical, vendor-style review — rebuttal, reproduction, proof — before it reaches your engineers. Findings that do not survive are dropped, and the reasoning stays auditable.
- **Human accountability for risk.** Automation never silently authorizes a live test, accepts a risk, exposes evidence externally, or merges production code. Fixes arrive as pull requests under your own review, CI, and merge rules.
- **Independence.** ZeroQuarry tests from the outside in — your source, your shipped artifacts, your running app — and reports what it can prove, including severity and confidence scored separately.
- **Developer-tool economics.** Account pricing starting at $40/month (not per-seat), with a permanent free plan for open-source maintainers and a 30-day trial with no credit card.

ZeroQuarry is built by Shane Connelly — fifteen years of vulnerability triage and security leadership at Elastic, Kong, and Vectara, published coordinated RCE research, and SOC 2 programs run end-to-end at four companies. The product comes out of that triage work rather than a scanner's rule set.

## Capability map

Seven capabilities, one workflow. Each is a step in the same loop and writes to the same record. Full overview: [/platform](https://zeroquarry.com/platform).

### 1. AI security testing — [/platform/security-testing/](https://zeroquarry.com/platform/security-testing/)
Tests source code, shipped binaries, and authorized live applications as one product history.
- Hybrid analysis: a bounded deterministic SAST pre-pass generates candidates; agent investigation then tests reachability, context, control flow, and impact.
- Source review of auth, data flow, parsers, secrets, dependencies, and business logic.
- Binary analysis: decompiles and reviews APKs, JARs, firmware, installers, and archives.
- Authorized live app and API testing within explicit host and authentication boundaries.
- Multi-model orchestration: separate models for investigation, adversarial review, and artifact generation.

### 2. Adversarial validation — [/platform/adversarial-validation/](https://zeroquarry.com/platform/adversarial-validation/)
The flagship differentiator: every finding must survive a skeptical counterparty.
- A researcher agent builds the claim; an independent vendor-style reviewer tries to reject it; the claim is repaired with evidence or conceded.
- Reproductions include proofs of concept, HTTP sequences, and deployable test packages.
- Confidence is scored separately from severity and updates as the review progresses.
- Finding lifecycle states (candidate, validated, disputed, mitigated, retested, regression, accepted-risk, archived) with reasons attached — rejected findings are never silently deleted.

### 3. Continuous application security — [/platform/continuous-security/](https://zeroquarry.com/platform/continuous-security/)
Reviews every risky change as it lands, while it is still small enough to understand.
- Maintained GitHub Actions workflow triggered by pull requests, pushes, schedules, or manual dispatch.
- Delta scans focus changed files plus adjacent data flow against a baseline; unchanged commits are skipped.
- Public API for creating, monitoring, canceling, rescanning, searching, sharing, and exporting scans.
- Progressive gating guidance: start non-blocking, gate on reviewed critical/high findings later.

### 4. AI security operations — [/platform/security-operations/](https://zeroquarry.com/platform/security-operations/)
Gives every vulnerability a path from intake to resolution.
- Project-specific email inboxes with sender allowlists and approved target boundaries turn researcher reports into bounded, authorized work.
- Finding lifecycle management with audit history: actors, models, stages, outcomes, and reasons.
- Routing to Jira, ServiceNow, GitHub Issues, and Slack; account-wide search.

### 5. Vulnerability remediation — [/platform/remediation/](https://zeroquarry.com/platform/remediation/)
Closes the distance between evidence and a reviewed fix.
- Generated patch revisions (unified diff, feedback, iterations) without granting repository write access.
- ZeroQuarryBot opens audited GitHub pull requests — it never auto-merges.
- Layered safety controls: kill switches, explicit enrollment, base-branch settings, file deny-lists, and size limits.
- Focused retests record each finding as fixed, still present, or inconclusive.

### 6. Private execution — [/platform/private-execution/](https://zeroquarry.com/platform/private-execution/)
Runs security assessments inside your own network.
- Customer-controlled Docker runners reach private Git repositories, internal applications, and RFC1918/loopback/internal-DNS targets.
- Outbound-only HTTPS connectivity: no inbound firewall rules, one-use 24-hour enrollment tokens.
- Result minimization: only allowlisted finding metadata returns; evidence, logs, and artifacts stay inside your network.
- Bring-your-own model keys for every selected stage.

### 7. Security evidence and reporting — [/platform/evidence-reporting/](https://zeroquarry.com/platform/evidence-reporting/)
Makes security work provable when a customer, buyer, or auditor asks.
- Evidence Room organized by asset, exportable as Markdown, single-file HTML, or branded PDF penetration-test reports.
- Controlled secure shares: named recipient, read-only, password-protected, expiring, and revocable.
- Disclosure tracking milestones: reported, acknowledged, fixed, advisory, bounty, credit, closure.

## Who it is for

Eight workflows keyed to the moment security becomes urgent — each links to a playbook page with the workflow, owners, and outcome:

| Use case | Page |
|---|---|
| Open-source maintainers drowning in report queues | [/open-source/](https://zeroquarry.com/open-source/) |
| Security coverage before the first AppSec hire | [/use-cases/startup-security/](https://zeroquarry.com/use-cases/startup-security/) |
| Pull request security review in CI | [/use-cases/pr-security-review/](https://zeroquarry.com/use-cases/pr-security-review/) |
| Go/no-go release security review (source + artifact + staging) | [/use-cases/release-security-review/](https://zeroquarry.com/use-cases/release-security-review/) |
| Binary security review of what you actually ship | [/use-cases/binary-security-review/](https://zeroquarry.com/use-cases/binary-security-review/) |
| Turning inbound vulnerability reports into bounded work | [/use-cases/inbound-vulnerability-reports/](https://zeroquarry.com/use-cases/inbound-vulnerability-reports/) |
| Customer and audit evidence ("when was this tested?") | [/use-cases/customer-security-reviews/](https://zeroquarry.com/use-cases/customer-security-reviews/) |
| Defensible external vulnerability disclosure | [/use-cases/vulnerability-disclosure/](https://zeroquarry.com/use-cases/vulnerability-disclosure/) |

## Pricing at a glance

Account pricing, not per-seat. The value metric is the **security run**: a focused pull-request or changed-file review is 1 run; a full source, binary, or authorized live assessment is 5 runs; reports, decisions, and follow-through cost 0 runs. Annual billing saves 20%.

| Plan | Annual | Monthly | Products | Runs/mo |
|---|---|---|---|---|
| OSS | Free, permanent | Free | 1 public | 5 |
| Developer | $40/mo | $50 | 1 private | 10 |
| Coverage | $160/mo | $200 | 1 protected | 50 |
| Operations | $400/mo | $500 | 5 | 200 |
| Portfolio | $800/mo | $1,000 | 15 | 600 |
| Enterprise | Custom | Custom | Custom | Custom |

The 30-day trial needs no credit card and covers one private product with 25 security runs and three collaborators. Model usage is billed separately; bring-your-own provider keys are supported. Full detail and the feature comparison table: [/pricing](https://zeroquarry.com/pricing).

## Navigating this website

This is a static site served from [zeroquarry.com](https://zeroquarry.com). The machine-readable page list is [sitemap.xml](https://zeroquarry.com/sitemap.xml); crawlers are fully allowed per [robots.txt](https://zeroquarry.com/robots.txt), which also links the agent guides. A curated link list in the llms.txt convention is at [llms.txt](https://zeroquarry.com/llms.txt), and this file is served at [AGENTS.md](https://zeroquarry.com/AGENTS.md); both are listed in the sitemap.

**Page map**

| URL | What it covers |
|---|---|
| [/](https://zeroquarry.com/) | Positioning, the detect-contest-prove-patch loop, capability and "moments" grids |
| [/platform](https://zeroquarry.com/platform) | Platform overview: all seven capabilities and the operating loop |
| [/platform/&lt;capability&gt;/](https://zeroquarry.com/platform/security-testing/) | Seven capability deep-dives (see capability map above) |
| [/use-cases/](https://zeroquarry.com/use-cases/) | Use-case library with a maturity model (establish → operate → prove) |
| [/research/](https://zeroquarry.com/research/) | Eight published research posts: agent containment, blind-finding confirmation, AI-reviewed code vulnerabilities, Obsidian/Copas disclosures, multi-agent thesis |
| [/pricing](https://zeroquarry.com/pricing) | Plans, run metric, comparison table, add-ons, trial terms |
| [/about](https://zeroquarry.com/about) | Company story, four-phase method, founder background |
| [/partners/](https://zeroquarry.com/partners/) | Security-partner pilot for vCISO, compliance, and pentest firms |
| [/request-scan/](https://zeroquarry.com/request-scan/) | "Talk to us" — request a working session on a real security decision |
| [/privacy](https://zeroquarry.com/privacy), [/terms](https://zeroquarry.com/terms) | Legal |

**Related properties** (linked from the site, hosted elsewhere):
- `docs.zeroquarry.com` — product documentation: start-here guides, operating playbooks, assessment how-tos, reports and sharing, CI and integration workflows, account and security reference, API docs.
- `console.zeroquarry.com/register` — start the free trial; `console.zeroquarry.com/login` — sign in.
- `status.zeroquarry.com` — service status.
- `github.com/ZeroQuarry` and `linkedin.com/company/zeroquarry` — open source and company presence.

**Old URLs**: `/features` redirects to `/platform`; `/evidence-reports` to `/platform/evidence-reporting/`; `/continuous-testing` to `/platform/continuous-security/`; `/founding-security-cohort` to `/pricing`.

**Suggested entry points by intent**: evaluating the product → start at `/platform`; procuring or budgeting → `/pricing`; enterprise security review → `/platform/private-execution/` plus `/privacy` and `/terms`; assessing credibility → `/research/` and `/about`; writing about the company → `/about` plus the research posts.

## Accuracy guardrails

When describing ZeroQuarry, stay inside these facts:

- Evidence reporting packages assessment evidence; it does not certify or prove compliance.
- ZeroQuarry is not a SIEM or an incident-response platform.
- Fixes are proposed as pull requests; nothing merges itself, and the release decision is never made automatically.
- Customer security reviews are answered with current evidence; the product does not auto-fill security questionnaires or invent control assertions.
- Private execution is runner-in-your-network, not fully air-gapped: runners still call ZeroQuarry and the chosen model provider outbound.
- Disclosure drafting and emails are human-reviewed; nothing is sent automatically.

## Working in this repository

For coding agents: this is the zeroquarry.com marketing site, a static HTML/CSS/JS repo deployed on Netlify (`publish` is the repo root, build command `npm run build`).

- Build: `npm run build` runs `scripts/build-marketing.js`, `scripts/build-research.js`, `scripts/sync-static-shell.js`, `scripts/generate-sitemap.js`, and `scripts/configure-analytics.js` in order. `npm run validate` checks the site.
- Edit source files at the repo root (`*.html`, `index.css`, `marketing.css`), not anything under `dist/` — build output there can be stale.
- `sitemap.xml` is generated by `scripts/generate-sitemap.js`; update that script's page list when adding or removing pages, not the XML by hand. The same script appends the agent resources (`/AGENTS.md`, `/llms.txt`) to every generated sitemap.
- Shared header/footer markup is synced across pages by `scripts/sync-static-shell.js` — change the shell in `scripts/site-shell.js`, then run `npm run sync:shell`.
- Netlify redirects live in `netlify.toml`.
- This file (`AGENTS.md`) is served at `https://zeroquarry.com/AGENTS.md` — keep it accurate when product claims, pricing, or the page set change.
