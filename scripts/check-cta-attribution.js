#!/usr/bin/env node
/* Behavioural check for the CTA attribution stamp in cookie-consent.js.
   Loads the real script in a minimal DOM harness and asserts what the console
   link ends up carrying. Run: node scripts/check-cta-attribution.js */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeLink(href) {
  return {
    _attrs: { href },
    dataset: {},
    getAttribute(name) { return this._attrs[name]; },
    set href(v) { this._attrs.href = v; },
    get href() { return new URL(this._attrs.href, 'https://zeroquarry.com/').toString(); },
  };
}

function run(pageUrl, hrefs, storageChoice) {
  const links = hrefs.map(makeLink);
  const context = {
    console,
    URL,
    URLSearchParams,
    setTimeout,
    document: {
      // Mirror the deployed tag's data attributes so the loader has a project
      // key to work with, exactly as configure-analytics.js writes it.
      currentScript: {
        dataset: {
          analyticsId: 'G-ZRT44MWJT1',
          posthogKey: 'phc_test_key',
          posthogHost: 'https://events.zeroquarry.com',
          posthogUiHost: 'https://us.posthog.com',
        },
        getAttribute: () => null,
      },
      readyState: 'complete',
      cookie: '',
      forms: {},
      getElementById: () => null,
      createElement: () => ({
        id: '',
        innerHTML: '',
        addEventListener() {},
        remove() {},
        setAttribute() {},
        getAttribute: () => null,
      }),
      head: { appendChild() {} },
      body: { appendChild() {} },
      // The PostHog stub injects its own loader tag ahead of the first script.
      getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
      addEventListener() {},
      querySelectorAll: (sel) => (sel === 'a[href]' ? links : []),
    },
    window: {
      location: new URL(pageUrl),
      localStorage: {
        getItem: () => storageChoice || null,
        setItem() {},
        removeItem() {},
      },
      sessionStorage: { getItem: () => null, setItem() {} },
    },
  };
  // cookie-consent.js reuses an existing gtag if present, so installing a
  // recorder here captures the config object it builds.
  context.window.gtag = (...args) => { context.gtagCalls.push(args); };
  context.gtagCalls = [];
  context.globalThis = context;
  const src = fs.readFileSync(path.join(__dirname, '..', 'cookie-consent.js'), 'utf8');
  vm.createContext(context);
  vm.runInContext(src, context);

  const queue = (context.window.posthog && context.window.posthog._i) || [];
  const initCall = queue.find((entry) => Array.isArray(entry) && entry[1]);
  return {
    hrefs: links.map((l) => l._attrs.href),
    posthogConfig: initCall ? initCall[1] : null,
    // "Loaded" means GA4 was actually configured. Whether window.gtag exists
    // is no longer a signal: the sandbox installs a recorder up front.
    gaLoaded: context.gtagCalls.some((c) => c[0] === 'config'),
    gaConfig: context.gtagCalls.filter((c) => c[0] === 'config').map((c) => c[2])[0] || null,
    captioned: Boolean(context.window.posthog
      && context.window.posthog._i.some((e) => e === 'opt_out_capturing')),
  };
}

let failures = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) {
    console.log(`      expected: ${expected}`);
    console.log(`      actual:   ${actual}`);
  }
}

console.log('CTA attribution stamp\n');

// 1. Plain homepage CTA picks up the page it was on.
check(
  'homepage CTA gets ref=/',
  run('https://zeroquarry.com/', ['https://console.zeroquarry.com/register']).hrefs[0],
  'https://console.zeroquarry.com/register?ref=%2F',
);

// 2. Campaign params on the incoming URL are carried through.
check(
  'utm params pass through to the CTA',
  run('https://zeroquarry.com/pricing/?utm_source=linkedin&utm_medium=organic', [
    'https://console.zeroquarry.com/register',
  ]).hrefs[0],
  'https://console.zeroquarry.com/register?ref=%2Fpricing%2F&utm_source=linkedin&utm_medium=organic',
);

// 3. Off-site links are never touched.
check(
  'third-party link untouched',
  run('https://zeroquarry.com/', ['https://example.net/thing']).hrefs[0],
  'https://example.net/thing',
);

// 4. Existing query on the CTA is preserved, not clobbered.
check(
  'existing destination query survives',
  run('https://zeroquarry.com/', ['https://console.zeroquarry.com/register?next=%2Fprojects'])
    .hrefs[0],
  'https://console.zeroquarry.com/register?next=%2Fprojects&ref=%2F',
);

// 5. Hash fragment survives.
check(
  'destination hash survives',
  run('https://zeroquarry.com/', ['https://console.zeroquarry.com/register#top']).hrefs[0],
  'https://console.zeroquarry.com/register?ref=%2F#top',
);

console.log('\nconsent-free reduced mode\n');

// 6. No choice recorded: PostHog loads, but cookieless and with nothing
//    that could profile or replay the visitor.
const undecided = run('https://zeroquarry.com/', ['https://console.zeroquarry.com/register']);
check('no choice -> PostHog is loaded', undecided.posthogConfig ? 'yes' : 'no', 'yes');
check('no choice -> nothing persisted', String(undecided.posthogConfig.disable_persistence), 'true');
check('no choice -> no autocapture', String(undecided.posthogConfig.autocapture), 'false');
check(
  'no choice -> no session recording',
  String(undecided.posthogConfig.session_recording),
  'false',
);
check(
  'no choice -> no cross-subdomain cookie',
  String(undecided.posthogConfig.cross_subdomain_cookie),
  'false',
);
check('no choice -> pageviews still counted', String(undecided.posthogConfig.capture_pageview), 'true');
// GA4 now runs before anyone answers the banner, in a cookieless, signal-free
// mode. Presence alone is not the assertion: what matters is that it writes no
// cookie and builds no advertising profile in that state.
check('no choice -> Google Analytics loaded in reduced mode', undecided.gaLoaded ? 'yes' : 'no', 'yes');
check('no choice -> GA writes no cookie', String((undecided.gaConfig || {}).client_storage), 'none');
check('no choice -> GA google signals off', String((undecided.gaConfig || {}).allow_google_signals), 'false');
check('no choice -> GA ad personalisation off', String((undecided.gaConfig || {}).allow_ad_personalization_signals), 'false');
check('no choice -> GA ip anonymised', String((undecided.gaConfig || {}).anonymize_ip), 'true');
check('no choice -> GA no cookie_domain', String((undecided.gaConfig || {}).cookie_domain), 'undefined');
check(
  'no choice -> CTA still stamped without consent',
  undecided.hrefs[0],
  'https://console.zeroquarry.com/register?ref=%2F',
);

// 7. Declined: nothing loads at all.
const declined = run('https://zeroquarry.com/', ['https://console.zeroquarry.com/register'], 'declined');
check('declined -> PostHog not loaded', declined.posthogConfig ? 'yes' : 'no', 'no');
check('declined -> Google Analytics not loaded', declined.gaLoaded ? 'yes' : 'no', 'no');
check(
  'declined -> attribution stamp still applied (server-side bridge)',
  declined.hrefs[0],
  'https://console.zeroquarry.com/register?ref=%2F',
);

// 8. Accepted: full analytics.
const accepted = run('https://zeroquarry.com/', ['https://console.zeroquarry.com/register'], 'accepted');
check('accepted -> Google Analytics loaded', accepted.gaLoaded ? 'yes' : 'no', 'yes');
check('accepted -> persistence on', accepted.posthogConfig.disable_persistence, undefined);
check('accepted -> autocapture default (not forced off)', accepted.posthogConfig.autocapture, undefined);
check(
  'accepted -> cross-subdomain cookie on',
  String(accepted.posthogConfig.cross_subdomain_cookie),
  'true',
);

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);