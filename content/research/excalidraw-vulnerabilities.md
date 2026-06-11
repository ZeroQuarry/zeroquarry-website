---
title: "Many serious vulnerabilities found in Obsidian's Excalidraw plugin"
slug: "excalidraw-vulnerabilities"
date: "2026-05-20"
author: "Shane Connnelly"
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

Most security tools are good at spotting code smells.

They can flag `dangerouslySetInnerHTML`. They can complain about `new Function`. They can warn about outdated packages. They can tell you that a URL is being fetched, or that user input reaches a file path.

But the hardest vulnerabilities are rarely just "bad function used here."

They are usually: **bad function used here, in this product workflow, after this kind of file is shared, with these permissions, inside this trust model, by this kind of user.**

That is where many static analysis tools struggle. And that is exactly the class of issue ZeroQuarry was built to find.

In May 2026, ZeroQuarry scanned the Excalidraw plugin for Obsidian, a widely used visual thinking and whiteboarding plugin. The initial scan reported 41 high-severity, 32 medium-severity, and 2 low-severity findings. A later re-scan, after fixes, showed that the highest-risk surface had been substantially reduced.

The interesting part is not the count. The interesting part is the *type* of vulnerabilities ZeroQuarry found.

These were not simple "regex found eval" findings. They were product-context findings: issues that only matter if you understand how Obsidian vaults are shared, how Excalidraw drawings are represented as Markdown, how plugin scripts work, how users install community scripts, how drawings embed links and images, and how people collaborate by passing around notes, vaults, and canvases.

That is the gap ZeroQuarry is designed to close.

## Developer tools are an unusually high-value target

Developer and power-user tools sit in a strange place in the security landscape.

They are often open source. They are often trusted deeply. They are often installed by technical users. They often run locally with broad access to files, credentials, notes, source code, SSH keys, API keys, browser-accessible sessions, and internal URLs.

They also tend to have rich extension systems: plugins, scripts, templates, Markdown processors, embedded webviews, custom protocol handlers, AI helpers, import/export pipelines, and sync workflows.

That richness is what makes them useful. It is also what makes them difficult to secure.

The Excalidraw Obsidian plugin is a good example. On the surface, it is a drawing plugin. In practice, it is a miniature application platform inside Obsidian:

- Drawings are Markdown files.
- Drawings can contain frontmatter.
- Drawings can embed images, files, links, HTML-like content, Mermaid diagrams, and script-driven behavior.
- Scripts can automate the plugin and interact with Obsidian APIs.
- Users share drawings and vaults with each other.
- The plugin runs in an Electron/Obsidian environment, not a locked-down browser tab.

That means the security question is not simply, "Is there an unsafe function?"

The real question is: **Can attacker-controlled vault content cross a trust boundary and become executable behavior?**

ZeroQuarry found multiple places where the answer was yes.

## Example 1: A drawing file could execute script on open

One of the clearest examples was frontmatter-driven execution.

Excalidraw drawings in Obsidian are stored as Markdown-like files. The plugin supported an `excalidraw-onload-script` frontmatter field. ZeroQuarry traced the path from a drawing file's frontmatter into the plugin's script engine.

The issue was not merely that a script engine existed. Script engines are a legitimate feature. The issue was that a drawing file -- something a user might receive, sync, import, or open as content -- could carry executable code that ran automatically when the drawing opened.

Conceptually, the dangerous object looked like this:

```yaml
---
excalidraw-plugin: parsed
excalidraw-onload-script: |
  // attacker-controlled JavaScript executed when the drawing opens
  // could read, modify, or delete vault files through plugin APIs
---
```

The product-context problem is subtle:

- Users treat a drawing file as content.
- The plugin treated a field inside that content as code.
- The code ran automatically on open.
- The execution context had access to Excalidraw automation and Obsidian plugin capabilities.

A conventional scanner might flag the dynamic execution primitive. But it likely would not know whether this was a legitimate trusted script feature, a user-approved automation path, or an untrusted drawing-file execution path.

ZeroQuarry connected those dots: **content file -> frontmatter -> script extraction -> script engine -> Obsidian-capable execution.**

That is the difference between a lint warning and a vulnerability.

## Example 2: A pretty icon could become executable UI

Another finding involved custom script icons.

The plugin allowed scripts to have sibling `.svg` icon files. That is a useful feature: users can install scripts and have nice icons in menus or tool panels.

But ZeroQuarry found that SVG icon text from the vault could be read and rendered as raw HTML in the Obsidian UI through `dangerouslySetInnerHTML`.

A simplified version of the trust failure:

```text
Shared vault or script pack
  -> SomeScript.md
  -> SomeScript.svg
  -> plugin reads SVG text
  -> menu renders SVG as raw HTML
  -> active SVG behavior can run before the user runs the script
```

Why this matters: the user may think they are installing or previewing a harmless script pack. They may not even run the script. Merely rendering the menu icon could be enough to parse attacker-controlled markup.

A SAST tool can identify `dangerouslySetInnerHTML`. What it cannot easily know is that the input is not a developer-authored React component, but a vault-controlled SVG file that might arrive through a shared Obsidian vault or downloaded script bundle.

That product-specific chain is the vulnerability:

- The attacker controls the SVG file because vault content is shareable.
- The plugin trusts the SVG because it sits next to a script.
- The UI renders it as active markup.
- The user may trigger it simply by opening a tools panel.

Again, the bug is not just the sink. It is the path and the misplaced trust.

## Example 3: A link in a drawing could become an Obsidian command

Obsidian has internal command concepts. Excalidraw drawings have clickable links. The plugin also understood `cmd://` links.

ZeroQuarry found paths where attacker-controlled drawing links could reach command execution without a strong trust boundary.

A malicious drawing could contain an element that looked like an ordinary button or link, but whose target was conceptually:

```text
cmd://some-obsidian-or-plugin-command
```

When the victim clicked the drawing element, the plugin could interpret that link as a command and dispatch it through Obsidian's command system.

This is the kind of issue that traditional tools frequently miss because each component looks reasonable in isolation:

- Drawing elements have links. Normal.
- Obsidian has commands. Normal.
- Plugins can execute commands. Normal.
- `cmd://` is a supported internal convention. Normal.

The vulnerability appears only when you ask the product question:

**Should untrusted drawing content be able to trigger privileged application commands?**

That requires understanding the user workflow. People share drawings. People click links in drawings. Those links should behave like content navigation, not like privileged automation.

ZeroQuarry's finding was not "there is a function call." It was "a shared drawing can turn a normal click into an application command."

## Example 4: A cleanup feature could delete the wrong files

One of the more interesting findings was not about JavaScript execution at all.

The Image Occlusion workflow included a cleanup mode for old generated cards and related images. Cleanup features are inherently dangerous because deletion is expected behavior. A scanner cannot simply say "this code deletes files" and call it a bug.

The question is: **how does the plugin decide which files are safe to delete?**

ZeroQuarry found that the cleanup path trusted files named `batch-marker.md` that linked back to the active drawing. It then parsed linked files after a generated-cards marker and deleted those files and, in some cases, the marker's parent folder.

A malicious shared vault could include something like:

```text
ImportantProject/batch-marker.md
  backlinks to the victim's drawing
  contains a Generated Cards section
  links to unrelated vault files
```

Then, when the victim ran what looked like a normal "delete old generated cards" cleanup, the plugin could treat the attacker's marker as authoritative state and delete unrelated vault content.

This is a great example of a finding tied almost entirely to business logic.

A generic scanner sees:

```text
find backlinks -> parse links -> delete files
```

That is not automatically wrong. In fact, it is the feature.

The vulnerability is that the deletion manifest was not authenticated as plugin-created state, not scoped to the expected output folder, and not validated against the specific Image Occlusion batch.

ZeroQuarry had to understand the workflow well enough to ask: "What if the backlinking marker was attacker-supplied?"

That is pen-tester reasoning, not syntax matching.

## Example 5: A convenience preview leaked private URLs

Another example involved URL enrichment.

When a user dragged a link into Excalidraw, the plugin could call an Iframely-style title resolver to fetch metadata. The original scan found flows where full dropped URLs could be sent to a third-party endpoint over plaintext HTTP.

That sounds modest until you think about what developer and knowledge-work URLs often contain:

- private issue tracker links
- pre-signed cloud storage URLs
- internal wiki pages
- OAuth callback URLs
- local development URLs
- URLs with embedded tokens or reset parameters

A convenience feature becomes a data exposure issue when it silently sends sensitive URLs off-device.

Again, this is difficult for a generic scanner to judge. Sending a URL to a metadata service can be an intended product behavior. The security issue depends on defaults, user expectations, transport security, whether the full query string is sent, and what kinds of URLs users are likely to drag into a developer note-taking tool.

ZeroQuarry's approach is to model that context before judging the finding.

## Example 6: AI-generated HTML became active content

The plugin also included AI-assisted workflows that could generate HTML from drawings or prompts. That is a powerful feature. It is also a new kind of trust boundary.

ZeroQuarry found cases where AI-generated HTML could be converted into an embeddable document and rendered without a strong sandbox.

The risk here is not "AI is bad." The risk is that model output is untrusted input.

A malicious collaborator, prompt injection inside a drawing, or simply an unexpected model response could cause generated HTML to include active script. If the plugin then persists and renders that HTML as active embedded content, the output stops being a preview and becomes executable UI inside the user's workspace.

This is a class of vulnerability most older SAST tools were never designed to reason about:

```text
user drawing / prompt
  -> AI provider
  -> generated HTML
  -> persisted Excalidraw embeddable
  -> rendered in Obsidian
```

The security question is not whether HTML generation is useful. It is whether generated content is treated as untrusted, sandboxed output.

## Why SAST usually misses this

Static analysis is valuable. We use it. Everyone should use it.

But SAST typically struggles with findings like these because the vulnerability is not contained in one function. It lives across the product model.

For Excalidraw, the important context included:

- Obsidian vaults can be shared, synced, cloned, and imported.
- Markdown files are both user content and plugin state.
- Drawings are not inert images; they can contain links, metadata, embeddables, and generated content.
- Script automation is a legitimate feature, so the hard part is deciding when script execution is user-intended.
- Electron/plugin contexts have more power than a normal web page.
- Developer tools routinely handle private URLs, local files, API keys, diagrams, scripts, and internal documents.

A SAST tool can say:

> `dangerouslySetInnerHTML` is used here.

ZeroQuarry tries to answer:

> Can an attacker get a file into a shared vault such that opening a menu parses their SVG as active UI before the user runs anything?

A SAST tool can say:

> `new Function` appears here.

ZeroQuarry tries to answer:

> Is the string passed to `new Function` coming from a file the user believes is just a drawing?

A SAST tool can say:

> This function deletes files.

ZeroQuarry tries to answer:

> Is the deletion list controlled by plugin-created state, or can an attacker plant a backlinking marker that tricks cleanup into deleting unrelated vault content?

That is the difference.

## How ZeroQuarry found these for less than $30 of inference

The scan cost less than $30 in inference.

The reason it worked is that ZeroQuarry does not start by blindly grepping for dangerous APIs. It starts by trying to understand the product.

For this scan, that meant researching the attack surface first:

- What is Obsidian's trust model?
- How are plugins installed and executed?
- What does an Excalidraw drawing look like on disk?
- What kinds of files and metadata can be embedded in drawings?
- What script and automation features exist?
- How do users share vaults, notes, drawings, scripts, and templates?
- Which features cross from content into execution, rendering, filesystem access, network access, or command dispatch?

From there, ZeroQuarry builds a plan like a penetration tester would:

1. Identify trust boundaries.
2. Look for attacker-controlled content that crosses those boundaries.
3. Trace source-to-sink paths.
4. Construct plausible exploitation scenarios based on real product workflows.
5. Ask whether the issue survives scrutiny.

That last step matters.

ZeroQuarry does not just have one agent produce findings. It bounces candidate findings off of a researcher agent that tries to deepen and sharpen the case, and a vendor agent that tries to invalidate it. The vendor agent asks the uncomfortable questions maintainers would ask:

- Is this really attacker-controlled?
- Is this actually reachable?
- Is this intended functionality?
- Is user interaction required?
- Is there an existing trust prompt?
- Is the impact overstated?
- Is this a duplicate of another finding?
- Is the exploit scenario realistic for this product?

Only findings that survive that adversarial review make it into the report.

That is why the final output can include the thing maintainers actually need: not just "unsafe API used," but a concrete explanation of source, sink, reachability, impact, and a product-realistic exploit scenario.

## The maintainer response matters

The other important part of this story is that the maintainer fixed issues.

Security work is only useful if it helps maintainers improve the software. The initial scan surfaced a large number of high- and medium-severity issues. After remediation, a re-scan showed a much smaller remaining set.

That is the loop we want ZeroQuarry to enable:

1. Find the issues.
2. Explain them in maintainer language.
3. Generate patches where possible.
4. Re-scan to confirm what changed.
5. Help the project get safer without turning maintainers into full-time security triage teams.

Open-source maintainers already carry too much. The goal is not to dump a pile of vague alerts on them. The goal is to deliver specific, actionable, validated findings that are worth their time.

## ZeroQuarry is free for open-source projects

We are offering ZeroQuarry for free to open-source projects.

If you maintain an open-source project, especially one with plugins, scripting, local file access, developer workflows, AI features, complex import/export paths, or rich user-generated content, we would love to help.

You do not need another scanner that produces 1,000 low-confidence warnings.

You need something closer to an always-on security researcher: something that studies how your product works, reasons about how attackers would actually use it, tests its own assumptions, and gives you findings that are concrete enough to fix.

That is what we are building with ZeroQuarry.

And the Excalidraw Obsidian plugin is exactly the kind of case that shows why it matters.


