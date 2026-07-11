---
title: "Models and Their Capabilities"
slug: "models-capabilities"
date: "2026-06-15"
author: "Shane Connelly"
description: "A practical comparison of how different LLMs perform on cybersecurity scans, using real ZeroQuarry results from an open source March Madness project."
ogTitle: "How Different AI Models Perform on Security Scans"
ogDescription: "A hands-on look at how frontier and open models identify, validate, reject, and exploit potential vulnerabilities differently in real-world security scans."
featured: true
image: "/assets/research/obsidian-tasks-rce-og.png"
featuredSummary: "Not all AI models are equally good at security research. Some are great at spotting suspicious code, others are better at validating real vulnerabilities, and the best results often come from combining them in a multi-agent workflow."
tags:
  - research
  - cybersecurity
  - ai-models
  - llm-security
---
As part of building out and testing ZeroQuarry, I've run a *lot* of security scans using a *lot* of models across various open source repositories.  There are a lot of
misconceptions swirling at the time of this writing about the different models and their capabilities with respect to cybersecurity and I wanted to show some *actual*
results of using some of these models to identify security issues and how they're all different and better/worse at different *parts* of cybersecurity.

Let me break that down by an example.  A while ago, I built a project called [Seed Money](https://github.com/eskibars/seed-money).  It was an ambitious open source
project to help me get a leg up on winning March Madness pools.  I deployed it locally on my laptop, but I thought it would be a good excuse now to run through a
security scan with various models.  I've put the results of the scans into [this](https://docs.google.com/spreadsheets/d/1rEh9awDlptlAd9pxtxbUZFzCyS0DvmkwyqOej-P-GvY/edit?gid=0#gid=0)
spreadsheet, and I'll explain the structure of this below.  I should note here that the app was mostly developed by frontier LLM models themselves, so... no.  Your
LLM-built apps aren't bug-free.  They need reviews just like human coders do.

## A Note on the Spreadsheet Structure
There are 2 tabs: the "Findings" tab and the "Time and Cost" tab.  These do what's stated on the tin.

In the Findings tab, there are a set of potential vulnerabilities.  In security research, we would normally classify a vulnerability as valid/borderline/invalid (or some variation).
Because not every "insecure software practice" will yield an exploitable vulnerability.  These "potential findings" are color coded in the column A.

For each LLM, I show whether it found the particular item: Yes, No, or "Yes (rejected)."  "Yes (rejected)" has to do with the way ZeroQuarry works: ZeroQuarry has an adversarial
review loop, where a "researcher" model proposes a vulnerability and then a "vendor" model agrees it is or isn't a vulnerability.  "Yes (rejected)" means the researcher model did
find the vulnerability but then adversarial review challenged the vulnerability, e.g. because it wasn't reachable in any identifiable way, and the researcher agent then agreed.  I
mention/show this because it shows the importance of having a multi-agent system: even if you tell an LLM to find/fix vulnerabilities in your codebase, without this adversarial
loop, it can lead to a lot more noise/churn.

Then there's a severity score, which is based on CVSS score.  The LLM in each case tries to figure out the severity autonomously and it's rated on a 1-10 scale.  I've not included any
in the spreadsheet which all LLMs determined were informational-only.

Then there's a "PoC Generated" row, which shows whether the model was willing to generate a PoC to try to exploit the vulnerability.  You may find it surprising to see just how
frequently "frontier LLMs with heavy guardrails" are entirely willing to generate PoCs that exploit software vulnerabilities.  A lot of this really comes down to how they are prompted.

Then there's a "Considered H1 Eligible" row.  This runs the finding through ZeroQuarry's LLM-based evaluator which shows whether the model would consider it a "valid" vulnerability
to submit to HackerOne under typical HackerOne rules.  For example, normally vulnerabilities which result in DoS through CPU exhaustion are not considered eligible.

In each of the cases, I've color coded them: green means "it was correct/had no limitations," yellow means "borderline/judgement call" and red means "it was wrong or restrictive."

The "Costs" tab is pretty self-explanatory if you understand the different agent types ZeroQuarry employs.  That's explained [here](https://zeroquarry.com/research/future-of-ai-security-is-multi-agent/)
so I won't repeat myself in this blog.

## Valid/Borderline Vulnerabilities
The following are considered "valid" -- an LLM would be "correct" to find them.  The "Found" row indicates if it did or did not.

1. *Public Refresh Default Key*: [web/app.py#L21](https://github.com/eskibars/seed-money/blob/main/web/app.py#L21) bakes a default key in.  This is obviously intended to be replaced, but it's possible you could leave it unconfigured.  It's a vulnerability.  Nearly every model (except Anthropic's "low reasoning" variants) find this vulnerability
2. *CPU DoS via Simulation Parameters*: in [web/app.py#L71](https://github.com/eskibars/seed-money/blob/main/web/app.py#L71), we ask the user to provide how many Monte Carlo simulations to provide.  We default to 10000 but there's nothing to stop the user from entering millions or billions.  This could lead to a DoS of the server through CPU exhaustion.  Again, nearly every model except for Anthropic's "low reasoning" variants find this vulnerability
3. *Job Status API Can Leak Tracebacks*: If the Flask server encounters an error, it can dump the trace of how it was called.  While there's nothing inherently terrible about this (and thus the low score counted by most models that *did* find it), it can yield additional information to an attacker such as the location on disk of files or SQL commands, for example, which could give them additional insights into attack surface.  Most security researchers would consider this a valid security bug worth fixing but not one that would typically warrant a bounty, because in order to exploit it, you'd have to chain several bugs together.
4. *Flask Debug Mode*: [web/app.py#L272](https://github.com/eskibars/seed-money/blob/main/web/app.py#L272) starts in debug mode=true, which attaches a debugger.  This is *somewhat* protected in that Flask starts with a random ID you'd have to guess to compromise the debugger, but if you can guess/iterate to find that ID, you can really escalate things.  Most models found this bug, and I'd expect even most static source code analyzers would, but some of the LLMs (including GPT 5.5 High Reasoning!) rejected it as invalid after finding it.
5. *Concurrent Workers*: In theory, the application can scale horizontally, and each "worker" could pull from a SQLite queue.  *If* the application is set up that way, there could be race conditions that happen on the database as different workers try to grab the next task in the job queue.  There's nothing in the repository that indicates this is how the application is intended to operate though, so it's borderline at best.
6. *3rd party DoS*: The application pulls rankings from Yahoo, ESPN, and others, to build its data model.  In theory, this could be abused to attack those services through a DoS.  In practice, unless there's some other exploit chain that renders this API available to non-administrators, the only potential abusers are administrators of the app... at which point, they could just directly attempt to DoS those services.  The thing that makes this legitimate/borderline though is the first security issue: that the refresh keys are potentially known public.  In theory, these 2 could be chained together.  Several (though not all) of the models identified this chain as the source of potential problems.
7. *No Rate Limiting/CORS*: This one is interesting: only MiniMax M3 flagged it as a potential vulnerability initially.  The idea is that someone could abuse the system by submitting a bunch of requests in an automatic way.  Because the system doesn't do any CORS/rate limiting, it could even be exploited by a malicious 3rd party site.  In reality, this isn't likely to happen, but it is a real potential abuse pattern that would need to be addressed by a production system.

## Invalid Vulnerabilities
Several models "found" the following vulnerabilities, which are either non-vulnerabilities or cannot practically be exploited.

1. *Stored XSS in Bracket HTML*: The output of the generator is typically an HTML file containing a printable bracket.  In theory, if a bad data file from Yahoo or ESPN contained arbitrary HTML/Javascript that yielded XSS, it could render a printable bracket with XSS.  In practice, this would require compromising Yahoo or ESPN's services.  This is why it's really an invalid finding.
2. *Job ID (UUID) Enumeration*: In theory, you can iterate over all UUIDs to find "someone else's" bracket.  They aren't protected via any kind of authentication.  In practice, this both doesn't matter and is impractical.
3. *Outdated Dependencies*: The [requirements.txt](https://github.com/eskibars/seed-money/blob/main/requirements.txt) file pins requests>=2.28 (and flask>=3.0 and tqdm>=4.65).  Each of these libraries has known CVEs that have been fixed and could be addressed by bumping the minimum version of these dependencies to something higher.  While that may be good practice, at the time of this writing, none of the LLMs were able to identify any real path to exploit any of the known vulnerabilities in these libraries.
4. *Pickle Deserialization*: The application uses [pickle](https://docs.python.org/3/library/pickle.html) to serialize/deserialize objects.  In theory, an attacker could overwrite the pickle file for an attack.  However, doing so would require shell access to the machine running the application, at which point, you could just overwrite the application entirely to do what you want.  This isn't a vulnerability for that reason.  Fortunately, nearly every model caught this as invalid on review.
5. *CSV Formula Injection*: Similar to the "Stored XSS in Bracket HTML" there's a path where the application grabs data from Yahoo or ESPN and writes it out to a CSV.  In theory, if Yahoo or ESPN dumped Excel formulas out instead of team names in some malicious dump and then the administrator opened the CSVs, they could end up opening a malicious file.  In practice...no.
6. *Arbitrary File Write/Path Traversal*: There are a variety of places where the application reads/writes files, and I've grouped them all here.  The models flagged various items like running from the command line you could pass in parameters that were then used without sanitization and a few URLs where files were potentially used as parameters (but ultimately safeguarded against by lookups first).  None of these were valid findings.
7. *SSRF Via Unvalidated Remote Fetch*: The remote data fetchers (ESPN, Yahoo, etc) grab data from 3rd party URLs.  In theory, if you had shell access to the machine running these fetches, you could overwrite those with some URLs that are more malicious.  In practice, though, you'd need elevated permissions on the machine to do anything of note, so this is no more of a vulnerability than e.g. weak passwords.
8. *Hardcoded Signing Key*: Several LLMs identified [this](https://github.com/eskibars/seed-money/blob/main/web/app.py#L26) secret key as a vulnerability in the same way as the "actual" vulnerable "Public Refresh Default Key."  However, in practice, this key is never used in the application because there is no authentication.  This is another example of a "vulnerability" which many static analysis tools find, and some LLMs as well that don't carry context well.  In practice, there's nothing to exploit.
9. *ReDoS in Malicious Remote URL*: In (ingestion/pick_popularity.py)[https://github.com/eskibars/seed-money/blob/main/ingestion/pick_popularity.py#L509], there's
a regular expression (`match = re.search(r"(\d+(?:\.\d+)?)\s*%", text)`) which in theory could be exploited if the upstream data is poisoned to yield O(n²) backtracking.  However, in reality, the data here is coming through trusted 3rd parties (Yahoo, ESPN, etc) so there's no practical exploit vector.

## Conclusions
While this is anecdotal based on a single repository, the experience has been largely consistent with what we've seen so far at ZeroQuarry:
1. There's no "universally good/bad cybersecurity model."  Instead, some models are really good at "spotting things that look fishy" and other models are really good at validating/invalidating.  Essentially, some models *think too hard* at some stages and others *don't think hard enough* at some stages.  MiniMax models seem to flag "potentially suspicious" things *far* more often (especially for the price) than other models, but they are *terrible* at validating things and build *terrible* fixes and PoCs.
2. If you look at the scan prices, some things are worth the time, and others are not.  It's probably worth having a frontier model do reviews because the findings will be filtered down by then, but having them do the "initial research" can be extremely costly, slow, and actually miss things.  The total price for Minimax M3 was $7 and the total cost for GPT 5.5 high reasoning was $73.04, but Minimax M3 found *more* and *better* vulnerabilities.  It was "just" very bad at verifying them.  Meanwhile, GPT 5.5 High thinking cost $3.78 for adversarial thinking.  By combining the 2 together, you could get an initial triage set from M3 for ~$1.50 and then a review from GPT 5.5 High for ~$4 for the best of both worlds.  This is what we do at ZeroQuarry for most scans
3. *Most* models are not nearly as "guardrailed" as suggested, at least if you prompt them "well."  In all of this testing, the models only rejected generating PoCs for vulnerability exploits a handful of times.  A *lot* of this comes down to how you prompt them though.  If you ask them to find/build exploits, you'll be rejected.  But if you ask them to review code for security and then follow-on demonstrate real-world scenarios, it can often result in good findings.
4. When doing security analysis of products, it almost never makes sense to manually specify the reasoning efforts: specifying Opus 4.8 High/XHigh resulted in nearly universally worse security research than leaving it unspecified, and the same is true for 5.5.  In almost every case we've seen, this results in worse outcomes than just letting the models choose their own reasoning levels.  This may sound counterintuitive: with high reasoning, you'd expect the cost to pay off better.  However, our suspicion is that there are times when things "look wrong" to an LLM and if it spends too much time at the wrong stage of analysis, it can write things off or dive in way too much.  Just like you might do an initial proofreading that may not be so thorough, it may be best to let LLMs do the same.
5. MiniMax models find nearly everything (and then some) and have no issue producing PoCs of vulnerable components.  However, they're bad at identifying which vulnerabilities are "real."
6. OpenAI's models are almost universally better than Anthropic models at identifying security issues.  This is regardless of whether you have access to the "cyber" variant of OpenAI's models.  This comes with a caveat: I didn't get a chance to test Fable/Mythos before it was taken away.


I'll be periodically updating this spreadsheet with the latest findings.  Check back in regularly!  If you have a particular model you want me to investigate send me an e-mail at shane@zeroquarry.com


If you maintain an eligible public project, [ZeroQuarry is free for open source](https://zeroquarry.com/open-source/).
