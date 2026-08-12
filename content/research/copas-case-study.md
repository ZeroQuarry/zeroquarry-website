---
title: "Finding and fixing vulnerabilities in an open source Lua coprocessor"
slug: "copas-concurrency-and-tls-case-study"
date: "2026-08-12"
author: "Shane Connelly"
status: "Mitigation available"
description: "ZeroQuarry helps an open source maintainer fix vulnerabilities in the popular Copas library."
ogTitle: "Finding and fixing vulnerabilities in an open source Lua coprocessor"
ogDescription: "A variety of security issues in Copas could lead to silently dropping to insecure channels. ZeroQuarry identified a variety of vulnerabilities like this and helped the maintainer fix them."
featured: true
featuredSummary: "One of the open source maintainers of the library scanned Copas using ZeroQuarry and ZeroQuarry then identified a number of serious vulnerabilities in the library. This writeup explains the impact, disclosure process, mitigation tradeoff, and lessons for embedded library ecosystems."
disclosureDetail: "Copas now has shipped a number of fixes. We are limiting exploit detail to avoid showing weaponized payloads."
tags:
  - oss
  - lua
  - ssl-bypass
  - responsible-disclosure
---

## Two bugs in Copas that turn ordinary application behavior into security problems

Earlier this month, ZeroQuarry was run against [Copas](https://github.com/lunarmodules/copas), an asynchronous networking library for Lua. Copas is not huge: roughly 6,000 lines of code. But it sits underneath the sort of code where small mistakes can have outsized consequences: HTTP clients, TLS servers, connection pools, timers, and locks.  Copas is used in [a number of projects in the Lua ecosystem](https://github.com/search?q=copas+language%3ALua&type=repositories), and due to Lua's nature as a popular embedded language: in a variety of other applications upstream.  One of the Copas maintainers signed up for ZeroQuarry to scan the open source repository for free under ZeroQuarry's "[protect OSS](https://console.zeroquarry.com/register/open-source)" free offering.

### What Copas does, and why a bug here can matter elsewhere

Copas is a coroutine-based dispatcher for asynchronous networking in Lua. An application gives it a handler for a TCP or UDP connection, Copas waits for sockets to become readable or writable, and then wakes the appropriate coroutine to continue the request. This is a common way to build a server that can deal with many connections without allocating an operating-system thread to each one.

It is built on [LuaSocket](https://github.com/lunarmodules/luasocket) for network access and [LuaSec](https://github.com/lunarmodules/luasec) for TLS. It also ships HTTP(S), FTP, and SMTP client support, timers, semaphores, locks, and connection-related helpers.

That makes Copas infrastructure rather than an end-user product. A bug in an application handler may affect one endpoint. A bug in the event loop, transport-selection code, or lock implementation can affect every application built on that behavior. The application author may have written the right-looking code: `HTTPS://...` or `lock:get(0)`. The library still has to preserve what those operations promise.

The scan produced a number of reports that were then worked through publicly by a Copas maintainer. So far that work has resulted in [13 issues](https://github.com/lunarmodules/copas/issues?q=zeroquarry) and 16 pull requests: many of those PRs drafted by ZeroQuarry and then reviewed/revised by a human.

Two of the findings are worth looking at because neither starts with the usual security smell. There is no obvious `eval`, SQL query, or buffer overflow. They come from a small mismatch between what an application developer thinks happened and what the library actually does.

### 1. When `HTTPS://` can become a plaintext request

URL schemes are case-insensitive. `https://example.com`, `HTTPS://example.com`, and `HtTpS://example.com` are all URLs with the HTTPS scheme.

Before the fix, Copas only selected its TLS path when the scheme string was exactly lowercase `"https"`. Anything else went down the ordinary TCP path. That means an application could accept a URL which clearly appears to request HTTPS, but Copas would open an unencrypted connection instead.

Here is a plausible way this becomes a real problem. Imagine a service which fetches a webhook, an import URL, a customer-configured endpoint, or an internal integration. The service accepts a URL, adds an `Authorization` header, and hands the URL to Copas. An attacker who can control the URL can supply `HTTPS://...` rather than `https://...` (and can also specify a port). The application thinks it is making a TLS request; the library takes the plaintext branch instead. Credentials, request contents, and the response are no longer protected by TLS.

This is more than a URL-normalization bug. A string comparison changed a transport security guarantee without producing an error.

The fix is straightforward: normalize the scheme before using it, validate that it is `http` or `https`, and derive the default port from the normalized result. The more general lesson is that transport selection should fail closed. A value which is almost HTTPS should not quietly become HTTP.

The public issue is [#188: Mixed-case HTTPS schemes silently downgrade requests to plaintext HTTP](https://github.com/lunarmodules/copas/issues/188).

### 2. How a failed non-blocking lock attempt can permanently block later requests

The second issue is a concurrency bug, but it has a very practical availability impact.

Applications commonly use a lock to protect a shared cache, session, database operation, or rate-limited resource. Sometimes they do not want a request to wait. They call a non-blocking acquire such as `lock:get(0)`: either take the lock immediately or return a timeout and let the request do something else.

Before the fix, Copas added the requesting coroutine to the lock queue *before* it checked whether the timeout was zero. It would then return `"timeout"`, but leave that coroutine behind in the queue.

Later, when the genuine lock owner released the lock, Copas transferred ownership to the stale coroutine. That coroutine had already been told it did not acquire the lock, so it was not waiting to run the success path and had no reason to release it. Subsequent callers could then time out forever.

An attacker does not need to flood a server to make this relevant. If an endpoint holds a shared lock long enough, they can make a second request hit the non-blocking path at the right time. The second request gets a failure response, but the queued coroutine can poison the lock immediately after the legitimate request finishes. Every later request which needs that lock can now hang or fail.

The fix is also conceptually simple: a failed immediate acquire needs to leave no queue entry behind. More generally, fast-fail paths need to be treated as state-changing code, not just early returns. If an API says it did not take a lock, the scheduler must agree.

The public issue is [#201: Failed zero-timeout lock acquisition remains queued and poisons the lock](https://github.com/lunarmodules/copas/issues/201).

### Why these are interesting

Both bugs require following a sequence rather than spotting one suspicious function:

1. What does the caller believe `HTTPS://` or `lock:get(0)` means?
2. Which branch does the library actually take?
3. What state survives after the request returns?
4. Can an attacker control the timing or input needed to turn that mismatch into a real problem?

That is the sort of work ZeroQuarry is meant to do. It reads the code, looks at the surrounding library behaviour and documented contract, follows the state across functions, then tries to turn the result into a concrete attack story. For these two findings, that meant connecting URL syntax to TLS selection in one case, and a timeout return value to scheduler state and future request handling in the other.

The rest of the Copas work has similar examples: [empty TLS parameters silently disabled TLS](https://github.com/lunarmodules/copas/issues/210), [a cancelled lock waiter could retain ownership forever](https://github.com/lunarmodules/copas/issues/199), and [socket timeouts left stale waiters behind when a connection was reused](https://github.com/lunarmodules/copas/issues/208).

Copas is open source, and the fixes are now public. If you maintain an open-source project and want to see what ZeroQuarry finds, [protect an open-source project free](https://console.zeroquarry.com/register/open-source). If you want to use it on a private product, [start a 30-day trial](https://console.zeroquarry.com/register) or [get in touch](https://zeroquarry.com/request-scan/).

