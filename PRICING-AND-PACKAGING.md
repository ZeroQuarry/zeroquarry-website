# ZeroQuarry pricing and packaging recommendation

Market snapshot: July 2026. Recheck public comparisons quarterly.

## Strategic decision

ZeroQuarry should **enter through the developer-tool budget and expand into the security-program budget**.

The first pricing proposal started at $1,250 per month. That reflected the eventual value of continuous testing, vulnerability operations, remediation, and evidence, but it forced a startup to make an outsourced-security-program purchase before experiencing ZeroQuarry as a daily product-development tool.

The aggressive package now does three things:

1. A permanent Free plan removes time pressure and creates an open-source adoption loop.
2. Developer and Startup plans sit close enough to coding-agent subscriptions to be bought from a software budget or company card.
3. Growth, Scale, and Enterprise monetize portfolio coverage, automation, external evidence, coordination, and assurance. Model access is not the product.

The positioning is: **developer-tool price, independent security-operation outcome.**

## The comparison buyers are actually making

Developer AI has trained buyers to expect low-friction, self-serve pricing:

- [ChatGPT Business is $20 per user per month on annual billing and $25 monthly](https://openai.com/business/pricing/), with Codex included.
- [Cursor Individual is $20 per month and Teams is $40 per user per month](https://cursor.com/pricing).
- [GitHub Copilot lists Free, $10 Pro, $39 Pro+, and $100 Max individual plans](https://github.com/features/copilot/plans).
- [Claude Pro is $17 per month annually or $20 monthly and includes Claude Code](https://claude.com/pricing).

ZeroQuarry cannot win that comparison by saying “we are more valuable” while asking for 30 to 60 times the entry price. It can win by making the first paid plan comparable to a power-user coding tool while clearly showing that the job is different.

A coding agent helps a developer produce code. ZeroQuarry independently:

- tests source, release artifacts, binaries, and authorized live behavior;
- challenges findings with proof, confidence, and adversarial review;
- retains human risk decisions and ownership;
- generates controlled fixes and verifies remediation; and
- turns the same history into customer, audit, and leadership evidence.

Those workflows are the differentiation. Model access is not.

## Value metrics

The subscription is priced by protected products and security-run capacity, not seats.

- **Protected product:** one customer-facing product or service with a coherent codebase, release boundary, ownership model, and evidence history.
- **1 security run:** a focused pull-request or changed-file review.
- **5 security runs:** a full source, release artifact, binary, or authorized live assessment.
- **Included follow-through:** review stages, decisions, reports, sharing, and rerunning a stage inside an existing assessment.

Collaborator limits exist for operational sizing, but they are deliberately generous and do not multiply the subscription price.

## Public packages

Monthly purchase is available. Annual billing is exactly 20% less:

`annual total = monthly list price × 12 × 0.80`

| Plan | Monthly | Annual total | Annual monthly equivalent | Products | Runs / month | Collaborators | Concurrency |
|---|---:|---:|---:|---:|---:|---:|---:|
| Free | $0 | $0 | $0 | 1 public | 5 | 1 | 1 |
| Developer | $50 | $480 | $40 | 1 | 10 | 3 | 1 |
| Startup | $200 | $1,920 | $160 | 1 | 50 | 15 | 3 |
| Growth | $500 | $4,800 | $400 | 5 | 200 | 50 | 8 |
| Scale | $1,000 | $9,600 | $800 | 15 | 600 | 150 | 20 |
| Enterprise | Custom | Custom | Custom | Custom | Custom | Custom | Custom |

### Free: create the habit

- Permanent, not a trial
- One public product
- Five security runs each month: one full review or five focused reviews
- One operator and efficient models in batch mode
- Watermarked reports
- No card or expiry

Free should create public-repository adoption, workflow familiarity, product feedback, and organic proof. It should be useful but not sufficient for a private commercial product.

### Developer: enter the developer-tool budget

- One private product
- Ten security runs each month
- Three collaborators
- Source, scheduled, and pull-request review
- Proof, adversarial validation, patch proposals, and retests
- Five controlled evidence shares

At $40 per month annually, Developer is comparable to a single premium developer-AI seat while covering an account and producing an independent security result.

### Startup: the default commercial plan

- One protected product
- Fifty security runs each month
- Fifteen collaborators and three concurrent assessments
- Source, binary, release artifact, and authorized live testing
- Jira routing, patches, retests, and 25 controlled shares

At $160 per month annually, Startup should be cheap enough for a founder to buy without a security procurement process and broad enough to become the product-security record for a seed or Series A company.

### Growth: automate the operating loop

Everything in Startup, plus:

- Five protected products and 200 runs per month
- Fifty collaborators and eight concurrent assessments
- Inbound security-report email triage
- GitHub autofix with human approval
- ServiceNow and Jira integrations
- Custom report branding
- 100 controlled shares with up to 180-day expiry

### Scale: standardize across a portfolio

Everything in Growth, plus:

- Fifteen protected products and 600 runs per month
- 150 collaborators and 20 concurrent assessments
- Workspace appearance controls
- 500 controlled shares with up to 365-day expiry
- Priority rollout support

### Enterprise: sell assurance and coordination

- Custom products, runs, users, concurrency, storage, and sharing
- Security, privacy, procurement, and deployment architecture review
- Rollout design across engineering groups
- Custom commercial and support terms

Use **$24,000 annual contract value** as the internal starting anchor. Expand from there based on capacity, deployment, support, assurance requirements, and contract complexity. Avoid rebuilding the old $150,000 opening position unless scope genuinely justifies it.

## Add-ons

| Add-on | Monthly | Annual monthly equivalent | Purpose |
|---|---:|---:|---|
| Additional protected product | $100 | $80 | Add a product without immediately repackaging |
| Additional 25 monthly runs | $50 | $40 | Absorb launch, diligence, or temporary change volume |
| Guided baseline | $1,000 once | Not applicable | Scope, onboarding, first baseline, and operating-plan workshop |

If both recurring add-ons would cost more than the next plan, quote the next plan instead.

## Unit economics and model usage

The current planning assumption is roughly 80,000 input and 20,000 output tokens per security run. At posted ZeroQuarry model rates, one run costs approximately:

| Model | Posted cost / run |
|---|---:|
| GPT-5 nano | $0.06 |
| Claude Haiku 4 | $0.18 |
| GPT-5 mini | $0.48 |
| GPT-4o | $0.70 |
| Claude Sonnet 4.5 / 4.6 | $0.72 |
| GPT-5 | $2.40 |

Model usage remains separately metered. This makes the aggressive subscription sustainable and lets customers choose depth. The risk is that buyers perceive a second meter, so the product must show a pre-scan estimate, current-month usage, and an optional spending cap as early as practical.

At full plan utilization, even the highest posted model rate is bounded by the run allowance. Typical use should be materially lower because focused reviews use less context and customers can choose efficient models.

## Commercial rules

- Show annual pricing by default and make the exact 20% saving explicit.
- Keep monthly purchase available. Early-stage buyers value reversibility.
- Do not add a per-seat charge. Expansion is driven by products, security work, automation, evidence consumers, and assurance.
- Run capacity resets monthly and does not roll over.
- Avoid bespoke discounting below the public annual price. The 20% annual discount is the standard concession.
- Trade any further discount for a longer term, reference rights, a case study, reduced support, or a pre-defined expansion.
- Do not promise that every ZeroQuarry report satisfies a human-pentest requirement. Some regulations, customers, or insurers still require an independent named human assessor.

## Migration and implementation

- The internal `trial` id now represents the permanent Free plan to avoid destructive account migration.
- Existing legacy `premium` and `foundation` tiers remain available for old accounts but are no longer sold.
- New sellable tiers are Developer, Startup, Growth, Scale, and Enterprise.
- Existing Growth and Scale rows are migrated only when their prices still match the first public package experiment, preserving superadmin customizations.
- Existing Free accounts have their old trial expiry cleared.
- The product stores monthly list price, annual total, and monthly run allowance on each tier; records run weight on every scan; and enforces the allowance atomically.
- Fixed subscription collection still needs Stripe products or an external order flow. The existing invoicer continues to handle model usage.

## What to measure

- Free-to-Developer and Free-to-Startup conversion
- Developer-to-Startup expansion and time to expansion
- Full versus focused reviews per protected product
- Monthly run utilization by plan
- Model spend as a percentage of subscription revenue
- Time to first validated finding, accepted decision, merged fix, and retest
- Purchase trigger: PR review, baseline, inbound report, customer evidence, or remediation
- Expansion trigger: private product, additional product, capacity, automation, evidence, or assurance
- Monthly-to-annual conversion and cancellation rate

Hold headline pricing steady for the first 25 paid accounts unless unit economics break. Tune run allowances, onboarding, and plan boundaries before raising the entry price.
