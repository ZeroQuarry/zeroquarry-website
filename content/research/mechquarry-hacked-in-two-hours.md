---
title: "I built a game with LLMs in a weekend. Internet scanners hacked it in two hours."
slug: "mechquarry-hacked-in-two-hours"
date: "2026-10-13"
author: "Shane Connelly"
status: "Account"
disclosure: false
description: "An LLM-written game server, compromised by autonomous scanners within two hours of deployment, and the security review I should have run first. I did run it afterwards, and this is what it found."
ogTitle: "Internet scanners hacked my LLM-built game in two hours"
ogDescription: "I built a game with LLMs in a weekend and deployed it to a test server. Two hours later it was compromised. Then I scanned it with ZeroQuarry, and this is what came back."
featured: false
tags:
  - vibe-coding
  - llm-security
  - account
  - adversarial-validation
---

I've wanted to build a particular game for a long time: something like BattleBots, but you pre-program your bot with a script instead of driving it. Render the battle in 3D, with sound effects, different bot frames and weapons that all have different effects, so the game is really about how you plan your code against how your bot is kitted out. I called it [MechQuarry](https://mech.zeroquarry.com).

It's genuinely *super* impressive how fast this kind of thing comes together now. I instructed the agents to design and build the 3D assets in [Blender over MCP](https://www.blender.org/lab/mcp-server/), generate the background music with [ACE-Step](https://github.com/ace-step/ACE-Step-1.5), and create announcer voice-overs and sound effects with a handful of other tools. In just a few weekends it wasn't just playable, it was really good looking and really fun!

I deployed it to a test server. Two hours later, before I had told a single person it existed, it was compromised.

Internet scanners found the test server, found an exploit autonomously, and took it. When I went through the repository afterwards, I realzied the models that had created the code had left every file world-readable, including the files holding OAuth secrets, API keys, and the user database. All of this was shipped by frontier models that had been smart enough to design a working scripting language interpreter, build a 3D arena visualisation, and test game fairness by running simulations.  But they never thought about who could read the files they wrote if deployed to a server.

I hadn't run the code through ZeroQuarry yet: I wanted to get it up on a test server quickly to see how it looked.

## What happened when I did run it

After the incident I pointed ZeroQuarry at the MechQuarry repository, and it has now scanned that codebase a few times now, so I can give you the real numbers rather than a vague claim that a security-focused scanner would have helped.

The first scan returned 34 findings. Three of them were critical, and the one that matters most here is an unauthenticated arbitrary file read: the catch-all static file handler served any file inside the application root, with no allowlist of permitted paths. An anonymous request could read the SQLite database and the `.env` file holding the secrets. It scored 9.8. ZeroQuarry's independent reviewer agent, whose only job is to try to kill the finding, accepted it at 90%+ confidence.

The numbers across the first 2 passes:

| Pass | Date | Findings recorded | Earlier findings rechecked | Of those, fixed |
|---|---|---|---|---|
| 1 | 21 Sep | 34 (3 critical) | — | — |
| 2 | 8 Oct | 21 (1 high) | 49 | 15 |

When you rescan a target with ZeroQuarry, it looks at the delta between the 2 to determine what has been fixed and what has not, so you get a remediation report.  You also get suggested PRs/git patches. (I've since closed the high-severity finding as well.)

## This is the message that I hear from users as well

The vibe-coding failure mode is *not* that the models write bad code. Mine wrote code that designed a scripting language and simulated game balance! That's amazing! The code *worked*: it didn't hit 5xx errors or have performance issues.  The failure is that security is not part of what "does it work" means to them. Every file being world-readable is about the most boring vulnerability class there is, which is exactly why it survives: it isn't interesting to the model writing the code, and it is the first thing an automated scanner checks for. Boring mistakes get found automatically now, by whoever runs the scan first.

The second thing is about the review, and it surprises a lot of people more. I asked frontier models for a plain security review of the code to see how they stacked up against ZeroQuarry, and in both cases the request itself was flagged as a cybersecurity risk and refused. The same class of model that wrote the vulnerable server wouldn't look at it when I asked it to check the damage.

So obviously I should have run a scan first before even deploying this to a test server, but I'm not saying I should have written a better prompt. The check *has* to be a separate thing that runs on purpose, on a schedule, and produces a record you can point at.  You don't want to go to a customer or the business after a hack and say "I asked a model and it said no", you want to say "here is what was checked on the 8th of October, here is what was fixed, and here is what is still open."

If you're shipping LLM-written code to a public server, whether you like it or not, someone (or more likely, some *thing*) is already scanning it.

It should be you, first.

If you maintain an open-source project and want to see what ZeroQuarry agents find in yours, [check a public project free](https://console.zeroquarry.com/register/open-source?utm_source=zeroquarry&utm_medium=research&utm_campaign=agent-containment). If you are evaluating software before deploying it, [start a 30-day trial](https://console.zeroquarry.com/register?utm_source=zeroquarry&utm_medium=research&utm_campaign=agent-containment) or [get in touch](https://zeroquarry.com/request-scan/?utm_source=zeroquarry&utm_medium=research&utm_campaign=agent-containment).
