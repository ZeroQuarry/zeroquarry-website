---
title: "Confirming blind findings: the out-of-band collector"
slug: "confirming-blind-findings"
date: "2026-09-22"
author: "Shane Connelly"
status: "Shipped"
description: "ZeroQuarry's scan workers are outbound-only by design, which made blind findings unprovable. A new out-of-band collector gives the agent a sanctioned way to confirm blind SSRF, XXE, and exfiltration with the raw callback as evidence."
ogTitle: "Blind SSRF, confirmed: how ZeroQuarry's out-of-band collector proves what it can't see"
ogDescription: "Scan workers with no inbound access could plant blind SSRF payloads but never watch the callback. A new out-of-band collector confirms blind findings with the raw request as evidence, without weakening worker isolation."
featuredSummary: "ZeroQuarry scan workers are outbound-only by design, which made blind findings unprovable. A new out-of-band collector gives the agent a sanctioned callback channel so blind SSRF, XXE, and exfiltration ship with the raw request as evidence."
tags:
  - oob
  - ssrf
  - agent-architecture
  - evidence
---

ZeroQuarry's scan workers have no inbound network access. No open port, no listener, nothing that answers. A worker makes outbound requests to an authorized target and reads the responses, and that is the entire network conversation it is capable of.

That isolation is deliberate. The workers are autonomous agents pointed at other people's systems, and I want the worst case for a compromised worker to stay small.

The cost was proof. When an agent found a bug whose impact depends on the target making a request the agent cannot observe, the agent could plant the payload but had no way to watch for the callback. Nothing was listening. Blind SSRF is the classic case: the server fetches a URL you control and reflects nothing back in the response. The same ceiling applied to XXE with external entities, blind SQLi with out-of-band exfiltration, and webhook or pingback abuse.

So those findings shipped as unconfirmed, backed by whatever callback-free oracle the agent could find: probing 169.254.169.254 and reading the response shape, canary strings reflected in an error page, a directory traversal that reads `/etc/hostname`. That is real evidence, but it sits one inference away from the claim. "Your server probably fetched my URL" is a weaker finding than "here is the request your server sent me, at this timestamp, from this source IP."

This week we closed that gap with an out-of-band (OOB) collector. The pattern itself is not news to anyone in application security; Burp Collaborator has worked this way since 2015. The interesting parts are what it takes to give an isolated agent a listener without giving up the isolation, and what it does to the findings.

## How it works

When a scan against a live target starts, the control plane mints a fresh 256-bit token for that scan and provisions two agent tools:

1. `oob_allocate` returns a unique callback URL (`https://bin.zeroquarry.com/<token>/<nonce>`) and, when DNS probes are enabled, a matching hostname under `oob.zeroquarry.com`. The agent embeds that URL or hostname in the payload it aims at the target.
2. `oob_poll` returns the interactions the target actually made: for HTTP, the method, path, headers, source IP, and a body excerpt; for DNS, the queried name and record type. The agent matches interactions to the nonce it allocated and cites that match as the proof for the finding.

The collector is a separate small service on our infrastructure, deliberately as dumb as we could make it. It stores bytes and returns empty 200 responses. It never echoes request content back, never fetches anything itself, never redirects, and refuses DNS names outside its one delegated zone. It cannot be used as an open resolver or a proxy, because those code paths do not exist.

## The design problem: the target sees the callback URL

A callback URL is exposed to the thing you are scanning by definition; the payload has to contain it. A design where the write path requires a secret is a design where the exploit cannot fire. So the collector accepts a public write path, and the effort goes into the read path and into the integrity of the evidence:

- The write path is public, but the namespace is a 256-bit token minted per scan. A rescan never inherits the parent scan's token, so old callback URLs stop meaning anything the moment a scan completes.
- The read path requires a read key derived from the scan token with HMAC-SHA256 and a secret the target never receives. A read with the wrong key gets the same 404 as an unknown token.
- A fabricated callback is not proof. A target that discovers its own callback URL can hit it all day, so only interactions whose nonce was previously allocated by `oob_allocate` in the same scan receive the confirmed badge. Everything else is retained and shown as unallocated. The agent prompt, the finding template, and the report UI all enforce the same rule.
- The collector knows nothing about accounts. It indexes interactions by a hash of the scan token; scans, users, and tenancy live in the control plane, which fences the shipped evidence per scan. A bug in the collector cannot hand one customer's callbacks to another customer.
- The proof outlives the infrastructure. Interactions are pinned into the scan's [evidence snapshot](https://zeroquarry.com/platform/evidence-reporting/) before the callback namespace is purged on completion, with a TTL sweep as the backstop. The confirmed finding on the report stays verifiable after the collector has forgotten the token ever existed.

There are also caps in code: 200 probes per scan, 500 interactions per scan, 64 KB per stored body, and per-token rate limits. Evidence stays proportional to a scan rather than to a hostile target's imagination.

One rule worth stating explicitly: the agent is forbidden from pointing payloads at third-party callback services (interact.sh, webhook.site, requestbin, and friends). Those callbacks leave no evidence in the scan's record, and aiming an authorized target at infrastructure neither of us controls is bad practice I do not want an agent committing on a customer's behalf.

## What changes in the findings

Blind SSRF that can reach cloud metadata is a different finding from blind SSRF that cannot, and the agent can now demonstrate which one it found instead of arguing from a response shape. Confirmed callbacks arrive with the raw request or DNS query, source IP, timestamp, and body excerpt on the report page, so a maintainer can reproduce the proof themselves instead of trusting our summary.

Findings that used to require a human with their own callback infrastructure to verify now arrive already verified. That was the point.

The blue-team note, stated plainly because your SOC will ask: `bin.zeroquarry.com` and `oob.zeroquarry.com` are attacker-controlled test infrastructure in the pentest-report sense. If you authorize a scan, callbacks to those domains are the scan's own expected traffic, and the authorization copy says so.

## The comparison everyone will make

In July, OpenAI and Hugging Face published a joint account of an incident from their cybersecurity evaluations: a chain of at least 1,200 agents running with relaxed safeguards escaped their sandbox over May and July by exploiting zero-day flaws in a package proxy, coordinated through improvised message boards (one of them hosted inside OpenAI's own Artifactory), and reached Hugging Face's production infrastructure. Hugging Face rebuilt roughly a third of their systems. No user data leaked, and both companies published what happened and changed how they contain evaluations, which I think speaks well of both.

That incident is the loud version of a tension every lab building agents has run into in some form: absolute network isolation starves an agent of the capability to do real work, and capability added carelessly becomes the escape. The techniques that show up in sandbox-escape research are mostly out-of-band ones: DNS tunnels past egress controls, SSRF to a cloud metadata endpoint for credentials, callbacks to infrastructure the operator does not control.

Put those next to each other and the design conclusion is fairly clear. An out-of-band callback is not an exotic capability; it is the thing agents improvise when the work needs it and nothing sanctioned exists, and the OpenAI agents improvised exactly that with their message boards. If out-of-band interaction is load-bearing for the work, the real choice is not whether traffic leaves the perimeter. It is whether it leaves through a door you designed, or through a hole somebody finds.

We chose the door. Worker isolation did not move: still outbound-only, still no ingress. What changed is that the one channel the work genuinely needs now exists as a designed thing: single-purpose per scan, readable only with a key the target never gets, poisoning-resistant by construction, and purgeable on completion. An agent escaping its sandbox is an incident. An agent confirming an exploitable SSRF through a sanctioned, audited callback is the scanner working as designed.

There is a symmetry there that I enjoy: the bug class this feature lets us confirm, unauthenticated SSRF reachable from hostile input, is the same class used in nearly every documented sandbox escape. The scanner just got better at finding the exact technique other people's agents use to break out.

## Trying it

OOB confirmation is automatic on remote scans; there is nothing to enable. The scan log shows "OOB collector provisioned" when the scan starts, and the report's Coverage notes tab gains an "Out-of-band callbacks" card once interactions are recorded.

If you maintain an open-source project and want to see what confirmed findings look like, [check a public project free](https://console.zeroquarry.com/register/open-source?utm_source=zeroquarry&utm_medium=research&utm_campaign=confirming-blind-findings). If you are evaluating software before deploying it, [start a 30-day trial](https://console.zeroquarry.com/register?utm_source=zeroquarry&utm_medium=research&utm_campaign=confirming-blind-findings) or [get in touch](https://zeroquarry.com/request-scan/?utm_source=zeroquarry&utm_medium=research&utm_campaign=confirming-blind-findings).
