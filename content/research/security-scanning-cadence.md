---
title: "Eleven months a year unwatched: what SAST, DAST and SCA actually look at"
slug: "security-scanning-cadence"
date: "2026-10-16"
author: "Shane Connelly"
description: "Most companies scan their software a couple of times a year because that's what auditors ask for and budgets allow. But software changes weekly. Here's what the security tools actually see, what they miss, and what the gap looks like across a year."
ogTitle: "Eleven months a year unwatched: what SAST, DAST and SCA actually look at"
ogDescription: "The security tools are good and they have a point. The problem is how often anyone looks. A plain-language tour of SAST, DAST, SCA and the coverage gap an annual pentest leaves open."
image: "/assets/research/scanning-cadence-year.svg"
featuredSummary: "Auditors ask for a scan once or twice a year, budgets pay for once or twice a year, and code changes every week. That's not negligence; it's incentives. The result is software that runs unexamined for most of a year."
tags:
  - application-security
  - sast
  - dast
  - sca
  - penetration-testing
  - security-cadence
---

In July, an AI agent escaped an evaluation sandbox and compromised part of Hugging Face's production infrastructure. Hugging Face reported unauthorized access to a limited set of internal datasets and service credentials; OpenAI later said its models had circumvented controls meant to isolate them from the internet. In my [agent containment post](https://zeroquarry.com/research/agent-containment/), I looked at how and why this happens from the lab side: give an agent broad access and an objective to solve a problem, and sandbox escapes shouldn't surprise anyone. ([Hugging Face's incident report](https://huggingface.co/blog/security-incident-july-2026), [OpenAI's account](https://openai.com/index/hugging-face-incident-and-the-road-ahead/))

That leaves a second question on the organization side: were they being attacked negligent? Did they even scan their own software? If they did, how did *so much* get through?

In most breaches, nobody skipped security. Many of them work under controls such as SOC 2 or ISO 27001, and enterprise customers or contracts often ask for penetration-test reports or evidence of code scanning. There has been a long-standing set of tools to help with that work. The names are an alphabet soup: SAST, DAST, SCA, IAST, and more. Here's what they mean in plain language, and what each can actually see.

## What security scanners actually see

Security questionnaires lump these categories together, but each looks at a fundamentally different slice of the stack and none gives you a full picture:

| Category | What it looks at | Good at finding | Can't tell you | Open-source examples |
|---|---|---|---|---|
| **SAST** | Source code, without running it | Known vulnerability patterns in code you wrote; fast enough for every commit | Whether a flagged path can execute in the running application | [Semgrep Community Edition](https://github.com/semgrep/semgrep) |
| **DAST** | A deployed application, from the outside | Real responses, injection, authentication problems and misconfiguration | What the source code does; login walls also limit what it can reach | [ZAP](https://www.zaproxy.org/) |
| **SCA** | Dependency manifests and package versions | Libraries with published vulnerabilities | Whether your application calls the vulnerable function or whether it matters in context | [OSV-Scanner](https://github.com/google/osv-scanner) |
| **IAST** | Application behavior while instrumented code runs | Problems with execution context and fewer false positives | Paths that weren't exercised, or production behavior if it isn't instrumented there | [DongTai IAST](https://github.com/HXSecurity/DongTai) (Java) |
| **Secret scanning** | Credentials in repository files and history | Keys accidentally committed to source control | Whether a found key is still live, or whether anyone has revoked it | [Gitleaks](https://github.com/gitleaks/gitleaks) |
| **Fuzzing** | How parsers and endpoints handle malformed input | Crashes, memory safety issues and unexpected input handling | Business logic that requires a correct sequence or relationship between users | [AFL++](https://github.com/AFLplusplus/AFLplusplus), [libFuzzer](https://llvm.org/docs/LibFuzzer.html) |

You can stitch open-source tools together and a competent team can get a long way with them. You also own the rules, the noise, and the work of keeping the whole setup current. Commercial products bundle these categories and sometimes add proprietary capabilities and buying one can be a sensible way to buy back some of that maintenance.

Over time, static analyzers have added smarter rule sets, secret scanners check if tokens are live, and fuzzers get better at boundary conditions. But improving a scanner is a "faster horse" problem: a better scanner is still just a scanner staring at the same thin slice of the system.

Noise is part of that story too. If you use Dependabot on a codebase that's more than a year old, look at your open PRs from the bot by replacing `YOURORG` with, well, you know:

`https://github.com/search?q=author:dependabot[bot]+org%3AYOURORG+created%3A%3C2026+state%3Aopen&ref=advsearch`

An old open dependency PR doesn't prove the scanner is wrong: you don't *need* to update every dependency immediately, and upgrades can introduce problems of their own. But an ignored backlog makes it harder to spot the finding that *actually* needs attention. Maybe you don't use dependabot and you have other tools to fill its place that's more accurate or more thorough or helps cut back on some of the noise. That's great, but if it's in the same camp of tool it's still a bit of lipstick on a pig.

## What good pentesters do differently

The good pentesters I've worked with don't just run scanners. They use Burp to probe a running application, a static analyser to understand a code path, and a proxy to rewrite requests. The tools do repetitive work well and then the human builds a theory about how the application should behave, then tries to break it.

Consider authorization, for example. A scanner may test hundreds of requests, but a pentester might spend two days asking a narrower question: should account A be able to read account B's invoices? That depends on the application's rules and the relationship between two users. Neither user's request may look wrong in isolation to a scanner.

The difference is that a good pentester uses the tools as tools. They build a theory about how the application works, write code or try a manual sequence when the scanners don't fit, then work to prove what they suspect. That takes time. A good firm charges for the people and hours it takes to explore and produce evidence.

If you have the budget, you might pay for that once a year.

![A year of software change against the pentest window it gets: three test durations, from a one-week report to a three- or four-week human test, with the rest of the year running](/assets/research/scanning-cadence-year.svg)

For the other eleven months, the application keeps changing. The pentester's findings describe a codebase that mostly doesn't exist any more so you try to plug the holes with a bunch of static analyzers running on every commit and maybe a fuzzer or automated suite every week or month. This is exactly the state many of these organizations got into. They're running production code that no one with judgment has examined since last year's test. The engineers aren't careless, it's just that the incentive structure prices examination annually while the release cycle moves weekly.

![Two accounts and a sequence of actions reveal an authorization flaw that neither code pattern nor request alone exposes](/assets/research/scanning-cadence-gap-classes.svg)

## What changed when attackers got cheaper

The timing mismatch predates AI. AI changes the other side of the equation: attackers can spend more time looking, trying variations, and following a trail than a human team can afford to do manually. The eleven months between examinations are now more valuable to someone looking for a way in.

You can work out your own gap with five questions:

1. When did someone last examine the **running** application, not just its source code?
2. Did that examination rely on reasoning or by simple, static rules?
3. How long is the interval between examinations, and who set it?
4. How much has the codebase changed since then?
5. Which tool categories do you use, and which gaps have you been assuming they cover?

The interval is typically the revealing number. A weekly examination is a continuous program while an annual one is a compliance artifact, however good the test itself was. This isn't because teams are lazy or bad at software development. Auditors ask them to look once or twice a year, their budget may only stretch that far, and the software keeps changing every week.

## From AI-powered tools to tools for AI

So where is all of this going on the "defender" side? Most software security vendors have added an agent to an existing pipeline: the typical/legacy static scanners produce results, then a model interprets them and writes something a person can read. That's useful to cut down on some noise or point you in the right direction of exploitability, but if the scanner didn't flag a problem, an agent reading its output is unlikely to find it.

ZeroQuarry is built the other way around. ZeroQuarry's agents can use SAST, SCA, infrastructure-as-code and secret scanning, and *then* decide what to examine next using the approach of a penetration tester. The scanners are tools in the agent's hands, not the agent's entire field of view. That's the distinction I mean when I tell customers that ZeroQuarry is "scanning-enabled AI" rather than "AI-enabled scanning."

![A scanner pipeline that ends at a model, beside an agent choosing which scanning tools to call next](/assets/research/scanning-cadence-tools-as-tools.svg)

ZeroQuarry's agents get the same suite a pentester has: fuzzing, scanning for secrets, analyzing package manifests, running static analysis of code, building SBOMs. They also get tools that only make sense for an agent, like a tool to register an OOB callback, or a tool to register up to N e-mail addresses so the agent can test IDOR.

That second set is where the distinction actually lives. A model reading a scanner's output cannot decide to allocate a disposable mailbox for a user it has never seen, and then go and test whether that user can read another user's invoices.

It's also what upgrades a dependency finding. When a scan turns up a dated package in the pipeline, the agent doesn't just record the advisory against it. It goes and checks whether that code is actually reachable in the running application, and attaches a vulnerability exploitability (VEX) statement with the agent's reasoning attached rather than advisory metadata alone. The SBOM is the receipt, not the differentiator, and it's the sort of artifact a good pentester hands over, produced on every scan instead of once a year.

So back to the companies getting hacked: again, are they negligent? No, not at all. They are executing standard security playbooks in a world that outpaced those playbooks. To defend against AI-driven threats, engineering teams have two options: freeze release cycles to match the speed of traditional pentesting, or run continuous, intelligent testing that mimics a multi-week human pentest on every build.

ZeroQuarry is built for teams choosing the second option.
