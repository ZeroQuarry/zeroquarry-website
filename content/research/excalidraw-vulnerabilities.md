---
title: "Many serious vulnerabilities found in Obsidian's Excalidraw plugin"
slug: "excalidraw-vulnerabilities"
date: "2026-05-20"
author: "ZeroQuarry Research"
status: "Mitigation available"
description: "ZeroQuarry identified and helped fix a large number of vulnerabilities in the Excalidraw plugin for Obsidian."
ogTitle: "Opening a malicious Markdown file could trigger serious security vulnerabilities"
ogDescription: "ZeroQuarry found and helped fix a large number of vulnerabilities in the Excalidraw plugin for Obsidian."
featured: true
featuredSummary: "ZeroQuarry identified a number of serious vulnerabilities in the Excalidraw plugin.  We engaged in a coordinated disclosure with Obsidian and the plugin maintainer. This writeup explains the impact, disclosure process, mitigation tradeoff, and lessons for plugin ecosystems."
disclosureDetail: "Excalidraw now has shipped a number of fixes. We are limiting exploit detail to avoid showing weaponized payloads."
tags:
  - rce
  - obsidian
  - plugin-security
  - responsible-disclosure
---
# ZeroQuarry Found Dozens of Obsidian's Excalidraw Plugin

Developer tools are becoming one of the most important frontiers in application security.

They are installed by technical users. They often run with broad local permissions. They sit close to source code, credentials, internal notes, architecture diagrams, API keys, and operational playbooks. They are trusted because they are used by builders.

That trust is powerful.

It is also dangerous.

We recently pointed ZeroQuarry at the Excalidraw plugin for Obsidian, one of the most popular plugins in the Obsidian ecosystem. Obsidian Hub currently lists the plugin at roughly 5.3 million downloads, and the plugin itself describes a feature-rich integration that lets users create, edit, embed, link, and automate drawings inside their Obsidian vaults.

ZeroQuarry's original scan identified 75 findings: 41 high severity, 32 medium severity, and 2 low severity. The top issues were not simple dependency bumps or obvious grep-able mistakes. They were trust-boundary failures across an unusually rich product surface: drawing metadata, embedded content, plugin scripts, Obsidian command links, local files, remote images, AI-generated HTML, SVG previews, and third-party URL enrichment.

After responsible disclosure, the plugin author fixed issues. A later re-scan showed a dramatically reduced set of findings. That is exactly what we want to see: automated research, useful reports, maintainer engagement, fixes, and safer software for everyone.

This post is not about shaming an open-source maintainer. It is the opposite. The Excalidraw Obsidian plugin is a sophisticated, widely used, deeply integrated developer tool. The maintainer took the findings seriously and improved the project. That is how the open-source security flywheel should work.

The interesting part is how ZeroQuarry found the issues: it did it automatically.  And the original scan cost less than $30 in inference.

## Why this class of bug is hard for SAST

Most static analysis tools are good at finding certain classes of issue:

- a dangerous function called with user input
- a known vulnerable dependency
- a missing sanitizer around an obvious sink
- hardcoded secrets
- unsafe deserialization
- injection patterns that match known templates

Those checks matter. They catch real bugs.

But the most interesting findings in the Excalidraw Obsidian plugin were not simply "the code calls a dangerous API." They required understanding what the product is, who uses it, what an Obsidian vault means, what content can be shared, which files are trusted, what a drawing element can control, how plugin scripts are installed, and which interactions feel normal to a user.

A SAST tool can flag `dangerouslySetInnerHTML`, `new Function`, `srcDoc`, `file://`, or command execution. But the real question is not whether those APIs exist. The real question is whether an attacker can reach them through a realistic workflow.

For example:

- A drawing file is not just a drawing. It can carry frontmatter, element links, embedded files, and app state.
- A script icon is not just an icon. It may be a vault-controlled SVG rendered inside a privileged desktop app.
- A link is not just a URL. In Obsidian, a `cmd://` or `obsidian://` link can cross from content into application behavior.
- An image is not just an image. It may be a remote URL, a local `file://` path, a fetched resource, or a persisted data URL.
- A cleanup script is not just maintenance code. If it trusts backlinks or marker files, it can become a deletion primitive.
- AI-generated HTML is not just output. If embedded unsandboxed, it becomes active code inside a trusted workspace.

That is product security work. It requires business context, attacker modeling, and an understanding of how users actually interact with the tool.

This is exactly the gap ZeroQuarry is built to close.

## What ZeroQuarry found

The original scan surfaced a large number of issues, but the themes were more important than the raw count.

### 1. Content could become code

Several findings involved attacker-controlled content becoming executable code. ZeroQuarry identified multiple variants of Excalidraw drawing frontmatter that could auto-execute JavaScript when a drawing was opened. The issue was high impact because the script execution path had access to ExcalidrawAutomate and Obsidian APIs, which meant 8a malicious drawing* could potentially read, modify, or delete vault content.

A traditional scanner might see a dynamic execution primitive. ZeroQuarry connected that primitive to the product reality: Excalidraw drawings are shareable vault artifacts. Opening a drawing is a normal user action. Users do not think of frontmatter as a code execution boundary.

### 2. Rich embeds crossed trust boundaries

The plugin supported embeddables, data URLs, iframes, Electron webviews, HTML generated by AI scripts, and SVG preview paths. The original scan found cases where untrusted drawing-controlled content could be rendered as active web content without the expected sandboxing or scheme restrictions.

Again, the finding was not just "iframe exists" or "srcDoc exists." The security issue was that a drawing could carry the payload, a user could open or interact with it naturally, and the plugin would treat that content as part of the trusted Obsidian/Excalidraw experience.

### 3. Obsidian command links became an application-control boundary

The original scan identified several paths where attacker-controlled drawing links using command-style schemes could execute Obsidian commands. This is a subtle product-specific issue. In a normal browser app, a link parser might be mostly a navigation concern. In Obsidian, links and commands are part of the application model.

That means link handling has to distinguish between "open this content" and "run this application behavior." Without that distinction, untrusted drawing data can cross into privileged command execution.

### 4. Script installation and updates carried supply-chain risk

The plugin's scripting ecosystem is one of the reasons it is powerful. It is also a security boundary. The original scan identified issues around script install code blocks, remote script store behavior, update flows, and filename/path handling.

This is the kind of thing ordinary scanners struggle to prioritize because the risk depends on how the product works. A script installer is not inherently a vulnerability. A script installer that accepts remote content, writes into executable script locations, and makes trust decisions based on weak metadata can become a supply-chain risk.

### 5. Local and remote resources were treated as drawings

Some findings involved remote image fetching, local `file://` paths, Iframely URL enrichment, and markdown/SVG preview paths. These are not always "critical" in isolation. But in a desktop knowledge-management tool, local files, private URLs, vault content, and internal links are all sensitive.

ZeroQuarry treated those as part of the attack surface because it first researched the product landscape. It did not start with a generic checklist. It started with the question: "What can an attacker make this plugin do from a shared drawing, shared vault, pasted link, dropped file, script pack, or synced setting?"

That is how a penetration tester thinks.

## How ZeroQuarry works differently

ZeroQuarry does not behave like a normal static scanner.

It starts by researching the software and its surrounding ecosystem. It asks what the product does, who uses it, what the trust boundaries are, what file formats and extension points exist, what user workflows matter, and what an attacker could realistically control.

Then it builds a test plan.

For Excalidraw in Obsidian, that meant looking beyond ordinary web-app patterns and asking questions like:

- What can a drawing file control?
- What happens when a vault is shared or synced?
- Which plugin features treat markdown, SVG, data URLs, or file paths as trusted?
- Which workflows feel safe to a user but cross into code execution?
- Which integrations turn content into commands, network requests, local file reads, or destructive actions?
- Which AI-assisted features turn model output into active embedded content?

After generating candidate findings, ZeroQuarry does not simply report everything it can imagine. It runs the ideas through adversarial review.

A researcher agent tries to strengthen and validate the finding: is the attack path realistic, is the source attacker-controlled, is the sink security-relevant, and is there a coherent exploit story?

A vendor agent tries to invalidate it: is this expected behavior, is there a missing prerequisite, is the impact overstated, does a guardrail exist elsewhere, is the code path actually reachable, or is the report confusing two different trust boundaries?

Only findings that survive that back-and-forth make it into the report.

That matters. LLMs are good at generating hypotheses. Security teams do not need more unfiltered hypotheses. They need validated, actionable findings.

ZeroQuarry is designed to turn agentic reasoning into usable security output.

## Why this matters for open source

Open source maintainers are carrying an impossible load.

They are expected to build features, review issues, answer support questions, manage releases, maintain docs, triage dependencies, and act as unpaid security engineers for software that may be used by millions of people.

The Excalidraw Obsidian plugin is a perfect example. It is not a toy project. It is a rich local-first application environment inside a larger extensible platform. It has scripting, embeds, AI workflows, drawing formats, markdown rendering, file operations, and integrations with Obsidian itself.

That kind of project deserves serious security review.

But most open-source projects cannot afford serious security review.

So I am offering ZeroQuarry for free to open-source projects.

If you maintain an open-source project and want ZeroQuarry to take a serious look at your attack surface, reach out. The goal is not to create scary reports and walk away. The goal is to help maintainers find issues before attackers do, generate useful remediation guidance, and make the ecosystem safer.

## The takeaway

The headline is not "AI found bugs."

The headline is that an automated system can now do meaningful, context-aware security research against real software: software with product-specific workflows, fuzzy trust boundaries, complex user interactions, and subtle exploit paths.

The Excalidraw Obsidian plugin had likely been downloaded millions of times. It is used by technical people. It lives in an ecosystem full of developers and power users. It almost certainly passed through plenty of dependency scanners, static checks, and community eyeballs before ZeroQuarry looked at it.

And yet ZeroQuarry still found meaningful issues for less than $30 of inference because it did not just scan the code.

It studied the product.

It mapped the attack surface.

It thought like a penetration tester.

Then it argued with itself before reporting.

That is the future of application security: not replacing maintainers, researchers, or security teams, but giving them leverage.

Especially the open-source maintainers who need that leverage most.
