# ZeroQuarry pricing and packaging recommendation

Market snapshot: July 2026. Public prices and product capabilities should be rechecked quarterly.

## Recommendation

Sell ZeroQuarry as an annual security-operations platform with two primary value metrics:

1. **Protected products** represent the product boundaries whose code, releases, findings, decisions, and evidence ZeroQuarry maintains.
2. **Security runs** represent reserved assessment capacity. A focused pull-request or changed-file review consumes 1 run; a full source, binary, or authorized live assessment consumes 5.

Do not lead with seats, tokens, or an unlimited-scans promise. Seats punish healthy collaboration. Tokens expose an implementation cost rather than buyer value. Unlimited scans make both workload and gross margin difficult to forecast.

Model usage should remain separately metered at the posted rates. This keeps the platform price tied to security value while letting customers choose efficient models for routine work and deeper models for consequential decisions.

## Why this position can win

The market has three useful anchors:

- Developer security scanners are commonly priced per contributor. [Semgrep Teams starts at $30 per contributor per month](https://semgrep.dev/pricing/), while [GitHub Code Security lists $30 per active committer per month](https://github.com/security/advanced-security). This is a useful floor, but it underprices ZeroQuarry's testing, validation, vulnerability operations, remediation, retesting, and evidence workflow.
- Autonomous pentest products create a much higher outcome anchor. [XBOW lists $4,000 for a Plus test and $8,000 for a Premium test](https://xbow.com/pricing). [Aikido lists an autonomous standard pentest at $4,000 per assessment](https://www.aikido.dev/pricing). Foundation's $15,000 annual fee is therefore comparable to only a few point-in-time assessments while supporting continuous product-security operations.
- Traditional pentest-as-a-service vendors usually use annual packages and capacity credits. [Cobalt packages pentest credits into annual Standard, Premium, and Enterprise plans](https://www.cobalt.io/pricing). That validates committed capacity as a buying model, but ZeroQuarry can make the unit more legible and more closely tied to the actual workflow.

The core message is: **buy continuous security capacity and operating leverage, not scanner access.**

## Public packages

All prices are monthly equivalents, billed annually. Model usage is additional.

| Package | Annual price | Protected products | Security runs / month | Collaborators | Concurrency | Best fit |
|---|---:|---:|---:|---:|---:|---|
| Trial | $0 for 30 days | Public source only | 5 assessments total | 1 | 1 | Prove the workflow |
| Foundation | $15,000 | 1 | 25 | 10 | 2 | Seed–Series A baseline |
| Growth | $36,000 | 3 | 100 | 25 | 4 | Series A–C operating program |
| Scale | $90,000 | 10 | 300 | 75 | 10 | Series C–E portfolio operations |
| Enterprise | Custom | Custom | Custom | Custom | Custom | Complex portfolios or assurance needs |

### Foundation — establish

- Source, binary, release artifact, and authorized live testing
- Scheduled and pull-request review
- Proof generation, adversarial validation, lifecycle decisions, patches, and retests
- Jira issue creation
- 10 controlled evidence shares with a 30-day maximum expiry
- Standard onboarding and support

### Growth — operate

Everything in Foundation, plus:

- Inbound security-report email triage
- GitHub autofix with explicit human approval
- ServiceNow issue creation
- Custom report branding
- 50 controlled shares with a 90-day maximum expiry
- Guided rollout support

### Scale — standardize

Everything in Growth, plus:

- Portfolio capacity for 10 protected products
- Workspace appearance controls
- 200 controlled shares with a 365-day maximum expiry
- Higher concurrency and priority support

### Enterprise — control

- Custom products, run capacity, users, concurrency, storage, and sharing
- Security, privacy, and procurement review
- Deployment architecture review
- Rollout design across multiple engineering groups
- Custom commercial terms; use **$150,000 annual contract value** as the internal starting anchor unless scope warrants more

## Add-ons

| Add-on | Price | Purpose |
|---|---:|---|
| Additional protected product | $500 / month, annual commitment | Add a product without immediately repackaging |
| Additional 25 monthly security runs | $500 / month, annual commitment | Handle launch, diligence, or temporary change volume |
| Guided baseline | $2,500 one time | Scope, onboarding, first baseline, and operating-plan workshop |

If a customer repeatedly buys both product and run add-ons, move them to the next package at renewal. Do not let add-ons become a permanent way to recreate a larger plan at a lower price.

## Unit economics

The current trial token caps imply a planning assumption of roughly 80,000 input and 20,000 output tokens per security run. At the product's posted model rates, one run costs approximately:

| Model | Approximate posted cost / run |
|---|---:|
| GPT-5 nano | $0.06 |
| Claude Haiku 4 | $0.18 |
| GPT-5 mini | $0.48 |
| GPT-4o | $0.70 |
| Claude Sonnet 4.5 / 4.6 | $0.72 |
| GPT-5 | $2.40 |

At the highest posted rate, the included monthly model cost would be about $60 for Foundation, $240 for Growth, and $720 for Scale before infrastructure and support. Because model usage is separately billed, package economics have substantial margin room. The commercial price should therefore be set from avoided security headcount, external pentest spend, reduced remediation waste, faster customer assurance, and lower exposure—not token cost.

## Commercial rules

- Annual commitment is the default. If early-stage buyers need cash-flow flexibility, offer quarterly payment at a premium without changing the annual commitment or public price.
- Security-run capacity resets monthly and does not roll over. Add a temporary run bundle before a planned launch or diligence event.
- A new scan consumes capacity according to scope. Decisions, reports, shares, and rerunning a stage within an existing assessment do not consume more.
- Avoid discounting the unit price. Trade discounts for a longer term, reference rights, a case study, reduced support scope, or a pre-defined expansion.
- Keep the 30-day trial constrained to public source. A trial should prove quality and workflow, not substitute for production use.
- Do not promise that every ZeroQuarry report satisfies a human-pentest requirement. Some regulations, customers, and insurers still require an independent named assessor.

## Migration and implementation

The legacy `premium` tier should remain available for existing accounts but should no longer be sold. New paid accounts should be assigned Foundation, Growth, Scale, or Enterprise from a signed order.

The product now stores pricing metadata and monthly security-run allowances on tier records, records the run weight on every new scan, enforces the allowance when the scan is created, and shows usage in account billing. Adding a payment method no longer upgrades a trial account automatically.

The current invoicer still bills model-token usage. Annual platform fees should initially be handled through the order process and the account assigned to the purchased tier by an administrator. Fixed-fee subscription automation can follow once deal volume justifies it.

## What to measure for the first ten deals

- Which package a buyer chooses and which limit drove the choice
- Full assessments versus focused reviews per protected product
- Run utilization at months 1, 3, and 6
- Model-usage cost as a percentage of platform revenue
- Time from first assessment to first accepted finding, merged fix, and retest
- Which workflow creates the purchase: baseline, PR review, inbound report, customer evidence, or remediation
- Expansion triggers: additional product, run capacity, users, evidence consumers, or automation
- Discount requested and the buyer objection behind it

Use those data to tune allowances before changing headline price. The initial package ladder is intentionally wide enough to reveal whether ZeroQuarry is being bought as a scanner, a continuous pentest program, or a security-team operating layer.
