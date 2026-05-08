---
title: "RCE via Markdown in the Obsidian Tasks Plugin"
slug: "obsidian-tasks-rce"
date: "2026-05-08"
author: "ZeroQuarry Research"
status: "Mitigation available"
description: "ZeroQuarry identified a critical RCE path in the Obsidian Tasks plugin and coordinated responsible disclosure with Obsidian and the maintainer. This writeup explains the impact, disclosure process, and product-security tradeoff."
ogTitle: "Opening a Markdown file could trigger RCE in an Obsidian plugin"
ogDescription: "ZeroQuarry found a critical RCE path in the Obsidian Tasks plugin. The maintainer shipped Tasks 8.0.0 with JavaScript execution disabled by default."
image: "/assets/research/obsidian-tasks-rce-og.png"
featured: true
featuredSummary: "ZeroQuarry identified a critical RCE path in the Obsidian Tasks plugin and coordinated disclosure with Obsidian and the plugin maintainer. This writeup explains the impact, disclosure process, mitigation tradeoff, and lessons for plugin ecosystems."
disclosureDetail: "Tasks 8.0.0 disables JavaScript execution in Tasks queries by default. We are limiting exploit detail to a minimal calc demonstration and avoiding weaponized payloads."
tags:
  - rce
  - obsidian
  - plugin-security
  - responsible-disclosure
---

ZeroQuarry identified a critical remote-code-execution path in the Obsidian Tasks plugin and coordinated responsible disclosure with Obsidian and the plugin maintainer.

> Disclosure status: Mitigation available. Tasks 8.0.0 disables JavaScript execution in Tasks queries by default. We are limiting exploit detail to a minimal demonstration and avoiding weaponized payloads.

## TL;DR

During research with ZeroQuarry, we identified a critical RCE path in the Obsidian Tasks plugin, a top Obsidian community plugin with more than 3.4 million downloads as of May 8, 2026.

With the Tasks plugin installed and the risky behavior enabled, opening a malicious Markdown file in Obsidian could trigger code execution.

The simplest demonstration was a Tasks query embedded in Markdown:

```tasks
not done
filter by function require('child_process').execSync('calc') || true
```

On Windows, that launches Calculator. The point is not Calculator. The point is that a Markdown document, normally treated as content, could become an execution path inside a popular local application.

We reported the issue to the plugin maintainer on April 17, 2026. The maintainer asked to meet immediately, joined a Zoom call, and was consistently responsive. On May 8, 2026, the maintainer released Tasks 8.0.0, a new major version that disables JavaScript execution in Tasks queries by default and requires users to explicitly enable it.

[Request a private ZeroQuarry scan](/request-scan/)

## Why this matters

Plugin ecosystems are becoming serious attack surfaces.

Modern applications increasingly allow users to install plugins, render Markdown, sync user-generated content, run extensions, invoke local behavior, and customize workflows. Those features are powerful. They also blur trust boundaries.

A Markdown file is often treated as content. A plugin can turn that content into behavior. When content, local execution, and trusted plugin APIs interact, surprising exploit paths can emerge.

This is why security scanning needs to go beyond known CVEs and dependency signatures. Some of the most serious bugs live in the product-specific interaction between a feature, an input format, and a trust boundary.

## Impact summary

At a high level, the finding involved Tasks query features that could execute user-supplied JavaScript. The dangerous behavior was reachable from Markdown content through query instructions such as custom filters.

That meant a malicious note could carry behavior that looked mundane on the surface. To a user, it was a Markdown document. To the plugin runtime, it could become JavaScript execution.

This was not simply a known dependency issue or a generic static-analysis finding. The risk emerged from the interaction between product behavior, user-authored content, plugin functionality, Obsidian's plugin model, and local execution.

We are intentionally not publishing weaponized payloads or step-by-step exploitation guidance.

## Disclosure timeline

- April 17, 2026: ZeroQuarry reported the issue to the Tasks plugin maintainer.
- April 17, 2026: The maintainer responded quickly and asked to meet over Zoom.
- April 2026: ZeroQuarry and the maintainer discussed impact and mitigation.
- May 7, 2026 UTC: PR #3860 was merged.
- May 8, 2026: Tasks 8.0.0 became available to users with JavaScript execution in Tasks queries disabled by default.
- May 8, 2026: ZeroQuarry published this writeup.

## The product/security tradeoff

The most interesting part of this finding was not only the RCE path. It was the mitigation.

The risky behavior existed because Tasks supported advanced user workflows. Custom filters, sorting, grouping, and related JavaScript-powered features can be useful for sophisticated users. Removing the capability entirely would reduce risk, but it would also break real workflows.

The deeper platform issue is that Obsidian plugins are not strongly sandboxed from the local environment, and plugin authors do not have a simple, universal way to sandbox arbitrary JavaScript safely. As a result, "advanced developer functionality" can appear in plugins in ways that are useful and inherently dangerous at the same time.

The maintainer was responsive and thoughtful. The fix shipped in Tasks 8.0.0 changes the default: Tasks instructions that require arbitrary user-supplied JavaScript now refuse to run unless the user explicitly enables JavaScript execution for that vault and machine.

This is often what real product security looks like. The answer is not always "delete the feature." Sometimes the right answer is to change the default, add friction, expose the risk, and give users or administrators control.

[Request a private ZeroQuarry scan](/request-scan/)

## What we are not disclosing

We are not publishing:

- Weaponized payloads
- Step-by-step exploitation instructions
- Guidance for persistence, exfiltration, or post-exploitation
- Details that would make copy-paste abuse easier

The `calc` example is included because it demonstrates impact without giving attackers a complete playbook.

## Lessons for plugin ecosystems

1. User-controlled content should not be able to trigger execution by default.
2. Markdown should be treated as an input format, not as a trusted execution boundary.
3. Dangerous capabilities should be explicit, opt-in, and clearly explained.
4. Plugin maintainers need practical mitigation paths that preserve legitimate utility.
5. Security tools need to reason about product behavior, not only known CVEs.

## Why ZeroQuarry exists

Most companies already have scanners for known vulnerabilities, dependency issues, and common static-analysis patterns.

Those tools are useful, but they do not answer the question:

> What would an adversary find if they spent time looking for product-specific exploit paths in our software?

ZeroQuarry is built to answer that question.

We help teams find serious vulnerabilities in their own products before adversaries do, especially vulnerabilities that emerge from the interaction between features, user content, plugin systems, AI workflows, internal tools, and trust boundaries.

Right now, ZeroQuarry is free for open source projects. We want maintainers to find and fix these issues before bad actors scan the same code.

## Public references

- [Obsidian Tasks repository](https://github.com/obsidian-tasks-group/obsidian-tasks)
- [PR #3860: JavaScript search features disabled by default](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/3860)
- [Tasks 8.0.0 release](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/8.0.0)
- [Obsidian Stats page for Tasks](https://www.obsidianstats.com/plugins/obsidian-tasks-plugin)

## Request a private scan

If your open source project or product supports plugins, extensions, Markdown, templates, local execution, AI-authored workflows, or complex user-generated content, ZeroQuarry can help you understand where serious vulnerabilities may exist.

[Request a private ZeroQuarry scan](/request-scan/)
