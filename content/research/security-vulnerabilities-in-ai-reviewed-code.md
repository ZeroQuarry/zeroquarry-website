---
title: "ZeroQuarry is finding security vulnerability chains in AI-reviewed code"
slug: "security-vulnerabilities-in-ai-reviewed-code"
date: "2026-09-01"
author: "Shane Connelly"
status: "Mitigation available"
description: "iShortn, an open source URL shortener, was already using AI code review when the vulnerabilities ZeroQuarry found were introduced. The review found locally plausible concerns. It missed both attack paths."
ogTitle: "ZeroQuarry is finding security vulnerability chains in AI-reviewed code"
ogDescription: "A pre-deployment scan of an open source URL shortener surfaced cross-tenant link takeover, SSRF, and custom-domain takeover chains that AI code review did not flag."
featuredSummary: "iShortn, an open source URL shortener, was already using AI code review when the vulnerabilities ZeroQuarry found were introduced. Cross-tenant link takeover, SSRF, and custom-domain takeover chains that the AI reviewer did not flag."
disclosureDetail: "Fixes were merged publicly. The original remediation PR (#324) had drifted from main and was re-landed as part of PR #336."
disclosureClass: "Broken Access Control, SSRF, Vulnerable Components"
disclosureSurface: "TypeScript, Next.js 16, tRPC, sharp"
disclosurePosture: "Disclosure-safe"
tags:
  - oss
  - nextjs
  - typescript
  - responsible-disclosure
---

I was considering deploying [iShortn](https://github.com/AmoabaKelvin/ishortn.ink), an open-source URL shortener with custom domains, analytics, QR codes, password-protected links, and a REST API.

Before deploying it, I ran the source code through ZeroQuarry, which I'm thankful I did.

iShortn was running AI code review on the pull requests that introduced two of the bugs discussed below. The AI reviewer had commented on the exact files where the problems appeared. It did not identify either attack path.

The ZeroQuarry scan found several ways that one account could cross into another account's data or infrastructure. In total, ZeroQuarry found 13 high-severity and 33 medium-severity issues in iShortn, all of which have been fixed. The clearest allowed someone with an ordinary API key to read and modify links owned by another user. Combined with a second bug in the update endpoint, an attacker could replace the destination of a trusted short link with a phishing page.

The scan also found *multiple* server-side request forgery paths. These matter even more when software is self-hosted, because the application often runs next to databases, caches, admin tools, and cloud credentials that are not reachable from the public internet.

I disclosed the findings privately to the maintainer. The fix was merged in [PR #336](https://github.com/AmoabaKelvin/ishortn.ink/pull/336).

Three of the findings are worth explaining in more detail, because they show how the bugs hide, how they could be chained, and why each is the kind of issue a code-change reviewer is poorly positioned to catch.

## 1. A public link contained everything needed to target it

Consider a company (example.com) that publishes this link with iShortn (hosted on go.example.com):

```
https://go.example.com/payroll
```

The domain and alias are obviously not secrets: they appear together every time somebody shares or follows the link.

iShortn also has an authenticated REST API. An API key identifies the user making a request, but the API accepted a `domain` parameter supplied by that user. If the parameter was present, the domain resolver returned it without checking whether the API-key owner controlled the domain.

The link lookup then searched for a record using only:

```
domain = go.example.com
alias  = payroll
```

It did not include the authenticated user's ID in the query.

This distinction is the core of a large number of authorization bugs:

```
authenticated: the application knows who made the request
authorized:   the application checked that they may act on this object
```

iShortn did the first part. For this API path, it did not do the second.

An attacker could create their own account, generate their own API key, and use the public domain and alias from somebody else's short link. A GET request disclosed the link's destination and expiry information. A PATCH request could modify the same record.

That was already enough for a link takeover. A second problem made the update even more dangerous.

### TypeScript types disappear at runtime

The PATCH handler declared a TypeScript type containing four expected fields. It looked roughly like this:

```
{
  url?: string;
  alias?: string;
  disableLinkAfterDate?: Date | null;
  disableLinkAfterClicks?: number | null;
}
```

But a TypeScript type does not validate an incoming JSON request: it disappears when the code runs.

The handler parsed the body, copied every supplied key into an update object, and passed that object to the database. There was no runtime allowlist. Fields such as `blocked`, `passwordHash`, `publicStats`, and `userId` were therefore available for mass assignment even though they did not appear in the TypeScript type.

The PATCH path also skipped the phishing and blocked-domain check used when a link was created.

ZeroQuarry was able to identify that those two bugs could be chained together:

1. The attacker takes the domain and alias from a public short link.
2. They authenticate using an API key for their own account.
3. The API finds the victim's link without checking its owner.
4. The attacker changes its destination to a credential-harvesting page.
5. Existing emails, documents, QR codes, and browser bookmarks continue sending people through the trusted short link.

Through this chain, the victim does not need to click an unusual attachment or approve a request. The thing they already distributed changes underneath them.

That is what makes a link-shortener takeover particularly useful to an attacker. The short domain is the trust signal: the destination is deliberately hidden.

[The first remediation commit](https://github.com/AmoabaKelvin/ishortn.ink/commit/f085189a3f57c7642ef5c337cfe3a0818e2a9045) addresses the chain in several places. Explicit custom domains are checked against the API-key owner. Link reads and updates include an ownership predicate. The PATCH body is parsed through a strict runtime schema. URL changes go through the same safety checks used during creation. [A follow-up commit](https://github.com/AmoabaKelvin/ishortn.ink/commit/4cdda885115c9be64d1716f92245887c7bd80a0e) authorizes the record before spending work on URL checks and updates it by the authorized database ID.

## 2. iShortn's link-preview feature could reach inside the deployment's network

iShortn checks whether a destination can be displayed in an iframe. The feature accepted a URL and fetched it from the server to inspect its response headers. It parsed the URL and allowed HTTP or HTTPS. It did not check where the hostname resolved.

That meant a requester could ask the iShortn server to fetch addresses such as:

```
http://127.0.0.1:3000/
http://redis.internal:6379/
http://169.254.169.254/latest/meta-data/
```

These addresses may be unreachable from the attacker's computer but reachable from the application server. This is server-side request forgery (SSRF). The endpoint returned only whether the target appeared iframeable, so this was primarily a blind SSRF.

Redirects created another path: the code followed redirects automatically, so an attacker could begin with an ordinary public URL that redirected the server to an internal address.

This is a particularly relevant problem for self-hosted software. A public iShortn deployment might share a Docker network with MySQL and Redis, run inside a cloud account with a metadata service, or have access to internal tools that were never designed to receive public traffic. The URL shortener becomes an indirect route into that environment.

ZeroQuarry found the same trust problem in a separate feature. Bio-page image URLs were stored and later rendered on the server when generating an Open Graph image. A user could point an image field at an internal URL, then ask the public image route to make the request. This is an easy class of bug to fix once and then reintroduce elsewhere. URL shorteners fetch URLs for metadata, screenshots, phishing checks, previews, images, redirects, and analytics. Each feature tends to grow its own small piece of request code.

[The remediation](https://github.com/AmoabaKelvin/ishortn.ink/commit/d2ac63bc169ee8c3bb15fdc9a4f718e3b6fc5515) introduces a shared outbound-request guard. It rejects loopback, private, link-local, cloud-metadata, and other reserved addresses after DNS resolution. It also checks each redirect before following it. The iframe endpoint now requires authentication, and the Open Graph renderer accepts only image sources hosted by the application. [A later fix](https://github.com/AmoabaKelvin/ishortn.ink/commit/165f779e0884f94684d1ba47fe094eeab3d4278f) replaced hand-written IP parsing with Node's built-in `net.BlockList` and added tests for IPv4-mapped IPv6 addresses and other less obvious address formats.

## 3. Another custom-domain problem

One other finding shows why multi-tenant security often fails at the boundary between an application and its infrastructure provider.

iShortn uses Vercel to manage custom domains. Once one customer had verified a domain on the shared Vercel project, Vercel correctly reported that the domain already existed and was verified.

The application treated that project-wide verification state as proof that a different workspace also controlled the domain.

An attacker could ask to add a domain already verified by another iShortn customer. The shared Vercel project said it was verified, and iShortn created an active domain record in the attacker's workspace without requiring new proof of control. The attacker could then create their own short links under the victim's branded domain.

Vercel's answer was correct: the domain had been verified for the project. The application asked the wrong authorization question. It needed to know whether this specific workspace controlled the existing claim.

[The custom-domain remediation](https://github.com/AmoabaKelvin/ishortn.ink/commit/09f5a77a1482558bf1c26aff29239c04c0893527) adds that workspace check.

## 4. AI code review was already in place

iShortn was running AI code review on the pull requests that introduced these vulnerabilities. The AI reviewer, CodeRabbit, was specifically configured to look at the same files. The AI reviewer did not treat the vulnerabilities uniformly:

- On [PR #306](https://github.com/AmoabaKelvin/ishortn.ink/pull/306), the AI reviewer identified the exact cross-tenant GET and PATCH vulnerabilities, rated them Major, and supplied the missing ownership checks. The one-commit PR merged roughly an hour later without the fixes.
- On [PR #267](https://github.com/AmoabaKelvin/ishortn.ink/pull/267), the AI reviewer examined the iframe-fetching file but focused on CSP behavior and did not identify that the public endpoint could make arbitrary server-side requests.
- On [PR #255](https://github.com/AmoabaKelvin/ishortn.ink/pull/255), it reviewed the custom-domain service, found database and race-condition concerns, but missed the cross-workspace domain takeover.
- On the [remediation PR](https://github.com/AmoabaKelvin/ishortn.ink/pull/336), the AI reviewer provided useful review.

That is what AI code review does in practice. The AI reviewer can surface a finding on one PR and the finding can fail to be applied; the AI reviewer can be working in the same file and miss the cross-tenant question. AI code review is good at spotting local defects in a diff, and less good at the question of what a feature actually does versus what it promises, which is the question that surfaces cross-tenant, BOLA, and SSRF chains. The pattern shows up across other AI-assisted codebases.

## 5. Why these findings matter

None of these issues came from a single obviously dangerous function.

The link takeover required following authentication through domain resolution, link lookup, JSON parsing, database update behavior, and URL safety checks. The custom-domain issue required understanding that Vercel's verification scope and iShortn's tenant scope were different. The SSRF findings appeared in product features that had legitimate reasons to fetch URLs.

Two things follow from cases like this. First, AI coding tools produce code quickly, and that code is not less likely to be wrong than any other code. The same volume of features that makes the work go faster also makes the surface area for security mistakes larger. Second, AI code review does not catch all of those mistakes, because it is structurally looking at a diff rather than at a product. A setting on a review tool does not turn a code reviewer into a product security assessor.

That is the gap a dedicated model and harness is built to fill. It reads the repository the way a product is read, with the tenant model, the deployment, and the attacker in view, rather than as a diff. That is the role ZeroQuarry is built to play, regardless of which AI coding tools are in use elsewhere in the workflow.

This is the kind of security review I want ZeroQuarry to perform:

1. Work out what the product promises.
2. Follow the data and authorization state across the implementation.
3. Look at the same workflow from another tenant's perspective.
4. Turn the result into a specific attack path.
5. Challenge it before asking a maintainer to spend time on it.

The fix is in. The vulnerabilities are closed, the diff is public, and the maintainer shipped it without changing the public API surface that customers depend on.

iShortn is open source, and the remediation is public. If you maintain an open-source project and want to see what ZeroQuarry finds, [protect an open-source project free](https://console.zeroquarry.com/register/open-source?utm_source=zeroquarry&utm_medium=research&utm_campaign=ishortn-security). If you are evaluating software before deploying it, [start a 30-day trial](https://console.zeroquarry.com/register?utm_source=zeroquarry&utm_medium=research&utm_campaign=ishortn-security) or [get in touch](https://zeroquarry.com/request-scan/?utm_source=zeroquarry&utm_medium=research&utm_campaign=ishortn-security).
