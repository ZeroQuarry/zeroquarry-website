---
title: "The Future of AI Security Scanning Is Multi-Agent"
slug: "future-of-ai-security-is-multi-agent"
date: "2026-06-11"
author: "Shane Connnelly"
description: "In the battle of the 'frontier models' and 'bad actors', most software shops are getting caught in the middle. Multi-agent orchestration is the only viable solution to modern product security"
ogTitle: "If you're 1-shotting product security, you're probably wrong"
ogDescription: "In the battle of the 'frontier models' and 'bad actors', most software shops are getting caught in the middle. Multi-agent orchestration is the only viable solution to modern product security"
image: "/assets/research/obsidian-tasks-rce-og.png"
featured: true
featuredSummary: "In the battle of the 'frontier models' and 'bad actors', most software shops are getting caught in the middle. Multi-agent orchestration is the only viable solution to modern product security"
tags:
  - architecture
  - model-comparison
---

A lot of the current conversation about LLMs and cybersecurity is stuck between two extremes.

On one side, Mythos clearly inspires (and its release gating takes inspiration from) concerns that frontier LLMs are about to make vulnerability discovery dramatically easier for attackers.  If a model can reason through complex codebases, identify exploitable flaws, and help produce an attack/PoC, then the obvious fear is that product security is about to get pretty dicey.  So due to fear (or maybe to drive marketing or maybe somewhere in between.. who knows), we now have models that refuse to do *some* types of security work.  For example, if you ask an LLM too directly to "find vulnerabilities in this code," there is a good chance it will either refuse, give you a vague answer, or avoid the details that would actually let you fix the security of your code.

There's some good justification here, but it misses the practical point.

The software most exposed by this shift is not the ones with mature security teams, formal AppSec programs, and dedicated bug bounty operations.  Instead, it's the sub-300 person companies where there is no CISO yet, no large security team, and no clean separation between engineering/architects/product management/security.  At those companies, security is often something the CTO, VP Engineering, software architects, and technical product leaders all wear as an extra hat.

For them, the question is not whether AI will replace "the mythical security team": they do not have a full security team to replace.  The better question for them is: can AI help me build a lightweight, repeatable, cost-effective security review process before attackers get there first?

I think the answer is yes... but not with a single prompt/one giant autonomous hacker agent/AI code quality review agents.  The future of AI security scanning is multi-agent.  That may sound *more* expensive and complicated, but hear me out.

## One-shot AI vulnerability scanning is the wrong mental model

A lot of AI security tooling is still implicitly built around the idea of a "single magic scan."  The idea is that you point an AI at a repository and ask it to find vulnerabilities. Maybe you ask it to fix them too.  Or you use an AI agent to help build your code or act as a reviewer (or maybe both).  nThose paradigms sound attractive, but they fall apart quickly in practice.

First, the most direct prompts often collide with model guardrails. "Find exploitable vulnerabilities in this codebase" can look very similar to an offensive cyber request, even when the user owns the codebase and the intent is defensive.

Second, even when the model does answer, the output is often too shallow. It may produce generic security advice, vague hardening suggestions, or plausible-sounding findings that do not actually have a valid source-to-sink path.

Third, if you try to solve the problem by sending everything to the most expensive, highest-reasoning model available, the economics get ugly *fast*. A full security review involves architecture analysis, threat modeling, code research, evidence gathering, skeptical review, deduplication, severity scoring, proof-of-concept validation, and patch drafting. Treating all of that as one giant inference task is both expensive and brittle.

Fourth, the "code assistant" agents operate in isolation: they're reviewing the PRs from a code quality perspective, but not from a business perspective of "what's the real use case here and where does a possible source-to-sync vulnerability lie?"  They're *intentionally* designed as too isolated for looking at that.

But fundamentally, security review is not one task.  Because it never has been!  It's a chain of tasks that require different kinds of reasoning, different levels of skepticism, and different kinds of evidence.  That's why one-shot AI vulnerability scanning is the wrong mental model.

## Guardrails do not make AI useless for security

There is a tempting (but lazy) conclusion people draw from LLM safety guardrails: if a model refuses to help find vulnerabilities, then it cannot be useful for security.  That has not been my experience.  Guardrails change the *shape* of the required workflow: they do not eliminate the workflow.

As mentioned above, if you ask a model to "find exploitable vulnerabilities," you'll likely get a refusal or an over-cautious answer.  But instead, if you ask it to review a codebase from an architectural perspective, map trust boundaries, identify risky flows, and highlight areas worth hardening, you can often can get it to give you a useful signal.  What's interesting in my experience here is that you can get *most* models to provide useful signals, even if they have pretty good and hardened guardrails.

That signal can then become a set of narrower research questions and then those questions can be investigated by specialized researcher agents.  The resulting findings can be challenged by skeptical reviewer agents.  Only the findings that survive that process need deeper validation, proof-of-concept work, or patch drafting.

This is much closer to how real security work happens: a good security researcher does not walk into a codebase and immediately produce a perfect bug report.  They build a model of the system, then they form hypotheses, then they test those hypotheses.  They revise. They throw away weak findings.  They argue with maintainers, triagers, and other engineers, etc.  They refine the severity and only once they're fully confident in their approach: they produce evidence.

The same *must* be true for AI security systems.

## The useful architecture is a review team, not a hacker bot

At a high level, the correct workflow for AI-based security triage and analysis looks something like this:

```text
Coordinator / Architect
        ↓
Risk Areas + Research Hypotheses
        ↓
Researcher Agent ⇄ Vendor Skeptic Agent
        ↓
Validated Candidate Findings
        ↓
HackerOne-Style Reviewer
        ↓
Deduplication + Consolidation
        ↓
PoC Agent
        ↓
Patch Drafting Agent
        ↓
Human Review + Remediation
```

1. The coordinator or architect agent looks across the codebase and thinks about the system structurally. Where are the trust boundaries?  Where does user input enter?  Where does authorization happen?  Where are tenant boundaries enforced?  Where are external calls made?  Where are secrets handled?  Where are assumptions encoded?
2. The researcher agent does not try to solve the whole codebase at once: it investigates a specific hypothesis or risk area.
3. The vendor skeptic agent plays the role of a maintainer, vendor, or bug bounty triager who is trying to reject the finding.  It asks the annoying but essential questions: is there actually a valid source-to-sink path?  Is the vulnerable function reachable?  Is the attacker-controlled input real?  Is the impact overstated?  Is this just theoretical?  Is there already a mitigation somewhere else in the stack?
4. The researcher and vendor skeptic then loop until they reach consensus (or hit a maximum number of turns, to keep the inference costs from running away).

The researcher/vendor loop matters a lot, and how they're prompted matters even more.  2 arguing agents won't magically "create truth" but if you allow them to revise their approach with each pass, then the pressure testing can force revisions and yield high quality areas to investigate.

## Hallucination is not an edge case

I spent a few years as Head of Product at Vectara from the company’s launch, so I have probably thought more than most people should about hallucination benchmarks.  One thing that experience made clear is that hallucination is not a vague philosophical complaint about LLMs: it is measurable behavior.

The exact rate of hallucinations depends heavily on the task, model, and evaluation method. (Summarization faithfulness is not the same as vulnerability research, factual recall is not the same as source-to-sink validation, etc). But across benchmarks, the pattern is consistent: even the frontier models still produce plausible false claims in the [2-20%](https://huggingface.co/spaces/vectara/leaderboard) or [higher](https://suprmind.ai/hub/ai-hallucination-rates-and-benchmarks/) range.

In security review, a hallucination often looks like a false vulnerability finding: the model sees a risky-looking pattern, infers exploitability, and writes a convincing report. (Or maybe it just churns on tokens until it gets something less scary looking in your code, never having looked at the whole architecture.)  But when challenged, the source-to-sink path is missing, the vulnerable function is not reachable, authorization is enforced elsewhere, or the attacker-controlled input is not actually attacker-controlled.

That is not a minor problem... for a small engineering team, a false vulnerability report is not free.  I've talked with a few maintainers of open source projects that have told me that they are considering giving up maintenance on their projects because they're being flooded by false vulnerability reports and slop AI-generated PRs.

In my testing while building ZeroQuarry, *all* frontier models still produce false security findings often enough that the workflow *has to* assume the first answer may be wrong.  As a specific note: MiniMax (M2.7 and now M3) has been especially interesting: it has produced some of the most useful high-level *research *in my testing, but it has also had a *noticeably* higher false-positive rate than the best frontier models.

Eventually, I expect we will need security-specific hallucination benchmarks, because summarization and factuality benchmarks do not perfectly map to vulnerability research. But they are already enough to show the broader point: model error rates are too high to ignore in workflows that create engineering work.

## Different models behave differently

This is where a lot of current AI security products are too simplistic: they assume one model should do everything.  Here are some of the finding's I've had:
1. Claude and Gemini models have generally been the most reluctant to produce PoCs, even in defensive contexts
2. MiniMax models have often been most willing to produce PoCs... unfortunately, they're also the most willing to produce non-working code and hallucinate security findings
3. GPT-5.5 operates very well as a coordinator, validator, and reviewer, but only if you prompt it very well.  You can often use different levels of thinking for different tasks
4. Gemma is quite good from a locally hosted coordinator, but often produces very broken code
5. Some models seem to *highly* prefer one language over another.  It's *very* difficult to get Qwen to think about a Python project from an architect/coordinator role: it really seems to insist on Javscript/Typescript.  Meanwhile, OpenAI's and Google's models seem to prefer Python, and operate fine in Typescript as well.  Claude is somewhere in between.
6. Some models seem reluctant to perform remote security scans (e.g. against a live SaaS asset), some flat-out refuse, and some seem willing.

So far, my recommendation for *most* projects is to use MiniMax for research (because it's very cheap, relatively), GPT-5.5 or Claude for review tasks with thinking set to medium to high,  Claude (or GPT-5.5) with thinking set to low-to-medium for patch generation

I know that these observations will change as models change and this is not meant to be an announcement as a formal benchmark.  But I suspect part of why there are so many different "feelings" on which models are best/worse comes down to both prompting and how you're using the models.

## The real shift

The AI security debate is often framed today as a battle between attackers and guardrails: attackers will use LLMs to find and exploit vulnerabilities, model providers will add restrictions and defenders will be stuck somewhere in the middle or be forced to pay up the wazzoo in inference.  I think this is incomplete.

The practical future of AI security is not about one unconstrained model doing everything: it is about workflow orchestration.  And I actually think this extrapolates to many AI applications beyond AI security as well: that there's enormous value to be locked in orchestrating the right models with the right prompts for the right tasks at the right time.

Those that understand this will be able to review *far* more code, *far* more often, for *far* less money, with *far* better signal.  Those that keep looking for a one-shot "find and fix everything" button will either run into guardrails, drown in false positives, burn too much inference budget, or all three.
