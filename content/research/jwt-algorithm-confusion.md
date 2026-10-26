---
title: "How We Found a JWT Authentication Bypass via Algorithm Confusion"
slug: "jwt-algorithm-confusion"
date: "2026-08-28"
author: "Shane Connelly"
status: "Mitigation available"
description: "ZeroQuarry identified a critical JWT algorithm confusion vulnerability that allowed authentication bypass. This writeup explains the exploit path, why traditional SAST tools miss it, and how the confusion pattern works."
ogTitle: "How algorithm confusion turns a JWT library against you"
ogDescription: "ZeroQuarry found an authentication bypass via JWT algorithm confusion. Here's the technical deep-dive into why this class of vulnerability is harder to find than it looks."
featured: false
featuredSummary: "ZeroQuarry identified a critical JWT algorithm confusion vulnerability during a client engagement. Here's the technical deep-dive into the exploit path, why static scanners miss it, and how to prevent it."
disclosureDetail: "The affected library has been notified and a fix has been released. We are limiting specific exploit detail to avoid creating a weaponized proof-of-concept."
tags:
  - jwt
  - authentication-bypass
  - algorithm-confusion
  - responsible-disclosure
---

During a ZeroQuarry engagement, we identified a critical authentication bypass vulnerability caused by a server that accepted multiple JWT algorithms — including both RS256 (asymmetric) and HS256 (symmetric).

That sounds like a minor configuration quirk. It is not. It is a well-known attack class that many tools miss and many developers do not fully understand.

## The TL;DR

JSON Web Tokens (JWTs) are signed to prevent forgery. The algorithm used to sign the token is embedded in the token header. A server that accepts *multiple* algorithms can be tricked into verifying a token with the wrong algorithm — allowing an attacker with only a public key to forge valid tokens and authenticate as any user.

## How JWTs work: a quick refresher

A JWT has three parts, separated by dots:

```
header.payload.signature
```

The header typically looks like this:

```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

The payload contains the claims:

```json
{
  "sub": "user_123",
  "role": "admin",
  "exp": 1735689600
}
```

The signature is computed over `header.payload` using the algorithm specified in the header.

**RS256 (asymmetric)** means: the server signs with a *private* key, and clients verify with the corresponding *public* key. The private key is never shared.

**HS256 (symmetric)** means: the same secret key is used for both signing and verification. If you know the secret, you can sign anything.

## The attack

A server that advertises support for both algorithms might accept a token with `alg: HS256` when it expects `alg: RS256`. If an attacker knows the server's *public* RSA key, they can do the following:

1. Take the RSA **public key** from the server.
2. Use it as the HMAC secret (`HS256`) to sign a token with whatever payload they want — including `sub: admin`.
3. Send that token to the server.

When the server receives the token, it sees `alg: HS256`, looks up its symmetric secret (which happens to be the RSA public key), and verifies the signature successfully. The attacker is now authenticated as `admin`.

```
Attacker has:  RSA public key (always public)
Attacker does: sign {sub: "admin"} with HS256 using public key as secret
Server sees:   alg: HS256, verifies with its stored "secret" (= public key)
Result:        Valid admin token from a public key
```

## Why standard tools miss this

Most SAST tools check for known-bad practices: `jwt.decode()` without verification, hardcoded secrets, disabled signature verification. They rarely catch the algorithm acceptance problem because the vulnerability is not in the *code* — it is in the *configuration*.

The vulnerable code often looks correct:

```python
import jwt

# Server-side verification
decoded = jwt.decode(
    token,
    public_key,
    algorithms=["RS256", "HS256"],  # <-- the problem
    audience="my-api"
)
```

The code is not wrong. The configuration is. Telling a JWT library to accept *any* of several algorithms without disambiguating by context is the vulnerability.

## How ZeroQuarry finds this

ZeroQuarry models the authentication context. It understands that:

- A JWT library accepting both RS256 and HS256 from an untrusted client is a cross-algorithm trust confusion.
- The verification function should either restrict to asymmetric algorithms (RS256, ES256) or symmetric ones (HS256), never both.
- Public keys used for asymmetric verification are not valid symmetric secrets — but only when the library enforces the distinction.

During the engagement, ZeroQuarry flagged the algorithm whitelist as an exploitable misconfiguration, identified the authentication context as sensitive, and surfaced a concrete proof-of-exploit path involving the public key already present in the codebase.

## The fix

Restrict accepted algorithms to exactly those appropriate for the key:

```python
# If verifying with an RSA public key — only asymmetric algorithms
decoded = jwt.decode(
    token,
    rsa_public_key,
    algorithms=["RS256"],  # Only asymmetric; HS256 is rejected
    audience="my-api"
)

# If verifying with a symmetric secret — only HMAC algorithms
decoded = jwt.decode(
    token,
    hmac_secret,
    algorithms=["HS256"],  # Only symmetric; RS256 is rejected
    audience="my-api"
)
```

The algorithm restriction should be explicit and tied to the key type, not a broad allowlist.

## Takeaway

Algorithm confusion is not a library bug. It is a configuration failure that uses a legitimate library feature — multiple algorithm support — in a way that collapses the trust boundary between asymmetric and symmetric verification.

The fix is simple. The hard part is finding it. Traditional static analysis looks for code patterns. ZeroQuarry looks for authentication context, trust boundaries, and the gap between what a system says it accepts and what it should accept.

> **Use ZeroQuarry to audit your authentication flows.** [Start a free scan](https://zeroquarry.com/)
