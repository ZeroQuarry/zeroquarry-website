#!/usr/bin/env node
/* Behaviour for the ChatGPT Ads measurement pixel in cookie-consent.js.
 *
 * The site's privacy notice promises that a visitor who has not answered the
 * cookie banner gets no cookies and nothing stored on their device. This pixel
 * holds a first-party `__oppref` click identifier and the SDK has no
 * cookie-free mode, so the only acceptable behaviours are:
 *
 *   no choice yet -> the pixel never loads, nothing is sent
 *   accepted      -> the pixel loads, consent was granted before init
 *   declined      -> the pixel never loads
 *
 * and the Events API threshold means an unconfigured pixel id must leave the
 * page exactly as it was, rather than loading an SDK that can only 404.
 *
 * The consent-before-init ordering is the part worth testing: the SDK defaults
 * to granted, so initialising first and calling consent(false) afterwards
 * would already have sent the ping that the promise rules out.
 *
 * Run: node scripts/check-oai-pixel.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'cookie-consent.js');
const PIXEL_ID = 'WqjLdm3BmjRHhvcd6Nnh1E';

let failures = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/*
 * Run cookie-consent.js in a sandbox and hand back what the pixel was asked to
 * do. `oaiq` is the SDK's queue: the page pushes command tuples onto
 * `window.oaiq.q` before the real SDK boots, which is what the deployed site
 * does too, so reading that queue is reading the real integration.
 */
function run({ pageUrl = 'https://zeroquarry.com/', priorChoice = null, pixelId = PIXEL_ID,
             session = {}, posthogKey = '' } = {}) {
  const localStore = new Map();
  if (priorChoice) localStore.set('zeroquarry_cookie_consent', priorChoice);
  // Session storage survives a same-tab navigation, which is how the submit
  // marker reaches the thank-you page. Passing entries in simulates arriving
  // there after a submission rather than typing the URL.
  const sessionStore = new Map(Object.entries(session));
  const scripts = [];

  const document = {
    currentScript: {
      dataset: {
        analyticsId: 'G-ZRT44MWJT1',
        posthogKey,
        posthogHost: 'https://events.zeroquarry.com',
        posthogUiHost: 'https://us.posthog.com',
        ...(pixelId ? { oaiPixelId: pixelId } : {}),
      },
      getAttribute: () => null,
    },
    readyState: 'complete',
    cookie: '',
    forms: {},
    getElementById: () => null,
    createElement: (tag) => ({
      tag, id: '', innerHTML: '', async: false, src: '',
      addEventListener() {}, remove() {}, setAttribute() {},
      getAttribute: () => null, closest: () => null,
    }),
    head: { appendChild() {} },
    body: { appendChild() {} },
    getElementsByTagName: () => [{ parentNode: { insertBefore: (n) => scripts.push(n) } }],
    addEventListener() {},
    querySelectorAll: () => [],
  };

  const window = {
    location: new URL(pageUrl),
    localStorage: {
      getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
      setItem: (k, v) => localStore.set(k, v),
      removeItem: (k) => localStore.delete(k),
    },
    sessionStorage: {
      getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
      setItem: (k, v) => sessionStore.set(k, v),
    },
  };
  const gtagCalls = [];
  window.gtag = (...args) => { gtagCalls.push(args); };
  // Stand in for the PostHog SDK. The loader installs the real bootstrap
  // snippet, which wraps whatever is already on window.posthog, so this has to
  // mimic the SDK's queue shape: it pushes [method, ...args] through `push`.
  // A capture therefore arrives as ['capture', eventName, properties].
  const posthogCalls = [];
  window.posthog = { push: (entry) => { posthogCalls.push(entry); } };
  window.window = window;

  const context = { console, URL, URLSearchParams, setTimeout, document, window };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(SRC, 'utf8'), context);

  // Read the queue at call time, not once at the end. The stub SDK assigns a
  // fresh `window.oaiq` (with a fresh `.q`), so an array captured here would
  // still be the pre-init one and would report an empty queue.
  const queue = () => ((window.oaiq && window.oaiq.q) || []);
  return {
    gtagCalls: () => gtagCalls.slice(),
    posthogCalls: () => posthogCalls.slice(),
    sessionStore,
    calls: () => queue().slice(),
    commands: (name) => queue().filter((c) => c[0] === name),
    sdkRequested: () => scripts.some((s) => String(s.src || '').includes('bzrcdn.openai.com')),
    api: window.zeroQuarryCookieConsent,
  };
}

console.log('no choice yet -> the pixel does not load and nothing is sent');
{
  const r = run();
  check('no consent call', r.commands('consent').length === 0, JSON.stringify(r.calls()));
  check('no init call', r.commands('init').length === 0);
  check('no measure call', r.commands('measure').length === 0);
  check('SDK not requested', !r.sdkRequested());
}

console.log('\nprior accepted -> the pixel loads, consent granted before init');
{
  const r = run({ priorChoice: 'accepted' });
  const order = r.calls().map((c) => c[0]);
  check('SDK requested', r.sdkRequested());
  check('exactly one init', r.commands('init').length === 1, JSON.stringify(order));
  check('init carries the pixel id',
    (r.commands('init')[0] || [])[1] && r.commands('init')[0][1].pixelId === PIXEL_ID,
    JSON.stringify(r.commands('init')));
  const firstConsent = order.indexOf('consent');
  const initAt = order.indexOf('init');
  check('consent is queued before init', firstConsent !== -1 && firstConsent < initAt,
    JSON.stringify(order));
  check('consent is granted, not denied',
    (r.commands('consent').slice(-1)[0] || [])[1] === true,
    JSON.stringify(r.commands('consent')));
}

console.log('\nprior declined -> the pixel never loads');
{
  const r = run({ priorChoice: 'declined' });
  check('SDK not requested', !r.sdkRequested());
  check('no init call', r.commands('init').length === 0);
  check('no consent granted', r.commands('consent').every((c) => c[1] === false));
}

console.log('\naccepting after load is not needed: accept before load');
{
  const r = run();
  r.api.accept();
  check('SDK requested on accept', r.sdkRequested());
  check('one init after accept', r.commands('init').length === 1);
  check('consent granted before init on the accept path',
    r.calls().map((c) => c[0]).indexOf('consent')
      < r.calls().map((c) => c[0]).indexOf('init'),
    JSON.stringify(r.calls().map((c) => c[0])));
}

console.log('\nno pixel id configured -> the page is untouched');
{
  const r = run({ pixelId: '' });
  check('SDK not requested', !r.sdkRequested());
  check('no init call', r.commands('init').length === 0);
}

console.log('\nreset() withdraws consent');
{
  const r = run({ priorChoice: 'accepted' });
  r.api.reset();
  check('consent denied on reset',
    (r.commands('consent').slice(-1)[0] || [])[1] === false,
    JSON.stringify(r.commands('consent')));
}

console.log('\nrequest-scan lead conversion, for a visitor who accepted analytics');
{
  const marker = { zq_request_scan_submission_pending: '1' };
  const r = run({ pageUrl: 'https://zeroquarry.com/request-scan/thanks/',
    priorChoice: 'accepted', session: marker, posthogKey: 'phc_test' });
  const gtagEvents = r.gtagCalls().filter((c) => c[0] === 'event').map((c) => c[1]);
  const posthogEvents = r.posthogCalls().map((c) => c[1]);
  check('GA4 records request_scan_submitted', gtagEvents.includes('request_scan_submitted'),
    JSON.stringify(gtagEvents));
  check('PostHog records request_scan_submitted', posthogEvents.includes('request_scan_submitted'),
    JSON.stringify(posthogEvents));
  check('the pixel records lead_created',
    r.commands('measure').some((c) => c[1] === 'lead_created'),
    JSON.stringify(r.commands('measure')));
  check('lead_created uses the customer_action shape',
    r.commands('measure').some((c) => c[1] === 'lead_created'
      && c[2] && c[2].type === 'customer_action'));
}

console.log('\na visitor who has not accepted still gets counted, but not by the pixel');
{
  // This is the deliberate asymmetry, and it is worth pinning so it cannot be
  // "fixed" by accident: without consent the pixel must stay silent, while GA4
  // in reduced mode still counts the page and the lead event. A non-consenting
  // lead is visible in Netlify's submissions log and the email notification,
  // which is the backstop until they reach the console.
  const marker = { zq_request_scan_submission_pending: '1' };
  const r = run({ pageUrl: 'https://zeroquarry.com/request-scan/thanks/', session: marker });
  const gtagEvents = r.gtagCalls().filter((c) => c[0] === 'event').map((c) => c[1]);
  check('GA4 still records request_scan_submitted', gtagEvents.includes('request_scan_submitted'));
  check('the pixel does not fire', r.commands('measure').length === 0);
  check('the SDK is not even loaded', !r.sdkRequested());
}

console.log('\na direct visit to the thank-you page is not a conversion');
{
  const r = run({ pageUrl: 'https://zeroquarry.com/request-scan/thanks/' });
  check('no request_scan_submitted',
    !r.gtagCalls().some((c) => c[1] === 'request_scan_submitted'));
  check('no lead_created', r.commands('measure').length === 0);
}

console.log('\nthe conversion is counted once, not on every reload');
{
  const first = run({ pageUrl: 'https://zeroquarry.com/request-scan/thanks/',
    session: { zq_request_scan_submission_pending: '1' } });
  check('first visit counts it',
    first.gtagCalls().some((c) => c[1] === 'request_scan_submitted'));
  // Carry the session forward exactly as the browser would across a reload.
  const carried = Object.fromEntries(first.sessionStore);
  const reload = run({ pageUrl: 'https://zeroquarry.com/request-scan/thanks/', session: carried });
  check('reload does not count it again',
    !reload.gtagCalls().some((c) => c[1] === 'request_scan_submitted'),
    JSON.stringify(reload.gtagCalls().filter((c) => c[0] === 'event').map((c) => c[1])));
}

console.log('');
if (failures) {
  console.error(`${failures} ChatGPT Ads pixel check(s) failed`);
  process.exit(1);
}
console.log('all ChatGPT Ads pixel checks passed');
