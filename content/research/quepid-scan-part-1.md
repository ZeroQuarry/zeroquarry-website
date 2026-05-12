---
title: "Unauthenticated SSRF in Quepid (Part 1 of a series)"
slug: "quepid-scan-part-1"
date: "2026-05-12"
author: "ZeroQuarry Research"
status: "Fixed in production and open source"
description: "ZeroQuarry scanned Quepid, the open-source search-relevance tool from OpenSource Connections. Part 1: an unauthenticated open-proxy SSRF that was live both in the public repo and on the hosted go.quepidapp.com service. Fixed in commit 634aa4a."
ogTitle: "ZeroQuarry found an unauthenticated SSRF in Quepid — patched in OSS and on go.quepidapp.com"
ogDescription: "First in a series. ZeroQuarry's scan of Quepid surfaced an open-proxy SSRF reachable on the public repo and the hosted service. Patched in commit 634aa4a."
image: "/assets/research/quepid-scan-og.png"
featured: true
featuredSummary: "ZeroQuarry's scan of Quepid, the open-source search-relevance tool from OpenSource Connections, surfaced an unauthenticated open-proxy SSRF that was live both in the public repo and on the hosted go.quepidapp.com service. Part 1 of a drip series."
disclosureDetail: "Detail is published here because the SSRF is patched in OSS and in production. Other findings exist and are being held until their fixes ship."
disclosureClass: "Server-side request forgery"
disclosureSurface: "Open-source Rails app + hosted service"
disclosurePosture: "Coordinated, ongoing"
tags:
  - ssrf
  - rails
  - responsible-disclosure
---

In April 2026, ZeroQuarry scanned [Quepid](https://github.com/o19s/quepid), the open-source search-relevance tool maintained by OpenSource Connections (OSC). The scan surfaced multiple security issues. We reported them privately and shipped patch files with the report.

> Disclosure status: Fixed in OSS and on the hosted service.

## TL;DR

Quepid shipped a `ProxyController` whose `fetch` action took a `url` parameter and made an outbound HTTP request to it on behalf of the caller. The action skipped authentication entirely and did no URL validation. Anyone on the internet could use a deployed Quepid as a server-side request forgery (SSRF) primitive: reading cloud-metadata services, reaching internal-only addresses, and exfiltrating stored Basic Auth credentials by passing a `search_endpoint_id` they did not own.

The bug was reported on April 25, 2026 and [fixed in commit `634aa4a`](https://github.com/o19s/quepid/commit/634aa4a5d9a217198ebfd9e9864333094ae3c25b) on May 2.

OSC also runs Quepid as a hosted service at [go.quepidapp.com](https://go.quepidapp.com). The same vulnerability was live there too. Patching the open-source repo simultaneously patched the production deployment.

[Request a private ZeroQuarry scan](/request-scan/)

## Why we scanned Quepid

Quepid sits in the middle of how search relevance gets evaluated. If you've ever tuned an Elasticsearch, Solr, or OpenSearch index, and you cared whether your tuning made things better or worse, there's a good chance you or your team may have run your judgments through Quepid. It's a Rails app. It stores cases, judgments, scorers, and curator variables. It acts as a control plane for the messy human-and-data work of search quality, and it is widely deployed.

That makes it exactly the kind of project we wanted to scanning early at ZeroQuarry: small enough that a single team largely maintains it, important enough that a lot of other teams depend on it, and Rails-enough that the security patterns we look for are common in adjacent projects.

ZeroQuarry scans are free for open-source projects. Quepid was one of the first we picked up after the [Obsidian Tasks disclosure](/research/obsidian-tasks-rce/).

## The vulnerability

Quepid shipped a `ProxyController` whose job was to fetch a URL on behalf of the front-end and return the response. The pattern is common in tools that work with search backends, where the browser needs to read a response that's blocked by CORS or that sits behind authentication the backend already has. The Quepid version, before the fix, looked roughly like this:

```ruby
class ProxyController < ApplicationController
  skip_before_action :require_login
  skip_before_action :verify_authenticity_token, only: [:fetch]

  def fetch
    url_param = params.require(:url)
    # ...
    search_endpoint = SearchEndpoint.find_by(id: params[:search_endpoint_id])
    credentials    = search_endpoint&.basic_auth_credential
    client = HttpClientService.new(url_param,
                                   headers: headers,
                                   credentials: credentials)
    # ... fetch and return the response to the caller
  end
end
```

Three things compound here:

1. **No authentication.** `skip_before_action :require_login` means anyone on the internet can hit the endpoint.
2. **No URL allowlist or host validation.** Whatever `url` the caller supplies is what gets fetched.
3. **Credential attachment by unowned ID.** The caller can pass any `search_endpoint_id` they like. The controller looks up that endpoint and attaches its stored Basic Auth credentials to the outbound request, without checking that the requester owns the endpoint.

## Impact

The exploit shapes are textbook SSRF, with a credential-exfiltration twist:

- A request to `/proxy/fetch?url=http://169.254.169.254/latest/meta-data/` returns the cloud instance metadata service response. On many EC2 and ECS deployments, that response includes temporary AWS credentials usable against the rest of the account.
- A request targeting an internal address, like `http://localhost:3000/admin` or any RFC1918 host, lets an external attacker reach things that should never have been reachable from the public internet.
- A request to an attacker-controlled URL with a known or guessed `search_endpoint_id` causes Quepid to forward the victim endpoint's Basic Auth credentials to the attacker's collector. The attacker gets the secret without ever touching the legitimate target.

Worth dwelling on the third one. Even teams that scope their Quepid deployment to an internal network (so the cloud-metadata and internal-host vectors are mostly theoretical) were still exposed to credential exfiltration if any user with network access to Quepid could hit the proxy. The credentials being exfiltrated are exactly the credentials Quepid was designed to keep safe: the Basic Auth secrets that let it talk to production search clusters.

## The hosted service was affected too

OSC offers Quepid as a hosted service at [go.quepidapp.com](https://go.quepidapp.com), the way Discourse offers hosted Discourse or GitLab offers hosted GitLab. The codebase is the same. The vulnerability was the same. Anyone on the internet could have used `go.quepidapp.com` as their SSRF primitive.

So the same scan that helped OSC ship a fix to the open-source project simultaneously closed a critical hole in their own production deployment. This is one of the cases where the math on free open-source scans gets very straightforward: the scan showed value the moment the proxy was unreachable for unauthenticated callers on `go.quepidapp.com`.

If you maintain an open-source project and also offer a hosted version of it, this dynamic applies to you too. Scanning the OSS repo is scanning your production environment, for free, before someone else does.

## What the patches were

The scan ZeroQuarry runs on a source-code surface doesn't just produce findings. It produces fixes: concrete unified `.patch` files that a maintainer can `git apply` (or attach as a GitHub App that opens pull requests directly). Each finding ships with the patch alongside it, so a maintainer triaging a report is looking at "here is the issue, here is the proposed fix, here is the diff" rather than at a description of a problem they then have to figure out how to solve.

For Quepid, we sent the maintainer the report and the patch files together. OSC's response on those patches:

> I really appreciate the patch files. So far they have all been accurate fixes.

The actual fix shipped in [commit 634aa4a](https://github.com/o19s/quepid/commit/634aa4a5d9a217198ebfd9e9864333094ae3c25b) closes the endpoint to unauthenticated callers and scopes the credential attachment so a caller can only use credentials from endpoints they're entitled to. The shape of the fix matches the proposed patch; the maintainer's judgment about exact wording, surrounding refactors, and release timing is theirs.

This is what we think coordinated disclosure should look like at the tool level. ZeroQuarry's job ends at a clear, reproducible finding and a working patch. The maintainer decides what to ship.

## Lessons for similar projects

If you maintain a Rails application (or anything else) that exposes a proxy or fetch endpoint, three things worth checking on your own:

1. **Authentication.** Every controller action that makes outbound HTTP on behalf of a caller should require a real session. `skip_before_action :require_login` on a fetch endpoint is, almost without exception, a bug.
2. **URL validation.** Validate the target URL against an allowlist where possible, and at minimum block the metadata services (`169.254.169.254`, `fd00:ec2::254`), `localhost`, and RFC1918/RFC4193 ranges. Don't trust DNS: an attacker can stand up a name that resolves to `127.0.0.1`.
3. **Scoped credential attachment.** If your fetch endpoint attaches stored credentials to outbound requests, scope the credential lookup to records the current user is allowed to use. Looking the record up by attacker-controlled ID and then sending its secrets out is a credential-exfiltration primitive even when nothing else is wrong.

None of these are novel. They are well-documented Rails-security advice. The reason scanners find them in real codebases anyway is drift: a feature that started life inside an authenticated UI flow gets exposed as an API endpoint, and the auth callback gets skipped because the existing one didn't fit. ZeroQuarry's job is to be the cold-eyed reviewer that catches the drift before someone less friendly does.

## Why ZeroQuarry exists

Most companies already run scanners for known CVEs, dependency advisories, and common static-analysis patterns. Those tools are useful, but they do not answer the question:

> What would an adversary find if they spent time looking for product-specific exploit paths in our software?

ZeroQuarry is built to answer that question. We help teams find serious vulnerabilities in their own products before adversaries do, especially the ones that emerge from the interaction between features, authentication flows, user content, plugin systems, AI workflows, and trust boundaries inside a non-trivial codebase: and we ship the proposed patches alongside the findings.

ZeroQuarry is free for open-source projects. We want maintainers to find and fix these issues before bad actors scan the same code.

## Public references

- [Quepid repository](https://github.com/o19s/quepid)
- [Commit 634aa4a — proxy fetch fix](https://github.com/o19s/quepid/commit/634aa4a5d9a217198ebfd9e9864333094ae3c25b)
- [OpenSource Connections](https://opensourceconnections.com/)
- [ZeroQuarry research: Obsidian Tasks RCE](/research/obsidian-tasks-rce/)
