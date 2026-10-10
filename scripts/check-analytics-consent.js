#!/usr/bin/env node
/* Consent behaviour for the analytics that runs on zeroquarry.com.
 *
 * The banner has three outcomes and each has to be observably different:
 *
 *   no choice yet  -> GA4 in the cookieless, signal-free reduced mode
 *   accepted       -> GA4 in the full configuration, cookies included
 *   declined       -> GA4 never loads
 *
 * and accepting after a reduced load has to actually upgrade the
 * configuration, otherwise "Accept All" grants nothing.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'cookie-consent.js');
const HOSTNAME = 'zeroquarry.com';
const MEASUREMENT_ID = 'G-ZRT44MWJT1';

let failures = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/* Run cookie-consent.js in a sandbox and hand back what GA was asked to do. */
function run({ priorChoice = null } = {}) {
  const gtagCalls = [];
  const head = { scripts: [], appendChild(node) { head.scripts.push(node); } };
  const localStore = new Map();
  if (priorChoice) localStore.set('zeroquarry_cookie_consent', priorChoice);

  const document = {
    currentScript: {
      dataset: {
        analyticsId: MEASUREMENT_ID,
        posthogKey: 'phc_test',
        posthogHost: 'https://events.zeroquarry.com',
        posthogUiHost: 'https://us.posthog.com',
      },
      getAttribute: () => null,
    },
    readyState: 'complete',
    cookie: '',
    forms: {},
    getElementById: () => null,
    createElement: () => ({ id: '', innerHTML: '', addEventListener() {}, remove() {},
      setAttribute() {}, getAttribute: () => null, closest: () => null }),
    head,
    body: { appendChild() {} },
    getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
    addEventListener() {},
    querySelectorAll: () => [],
  };

  const window = {
    location: new URL(`https://${HOSTNAME}/`),
    localStorage: {
      getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
      setItem: (k, v) => localStore.set(k, v),
      removeItem: (k) => localStore.delete(k),
    },
    sessionStorage: { getItem: () => null, setItem() {} },
  };
  // gtag is created by cookie-consent.js itself; record every call it makes.
  window.gtag = function (...args) { gtagCalls.push(args); };

  const context = {
    console, URL, URLSearchParams, setTimeout, document, window,
    gaConsentTest: true,
  };
  window.window = window;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(SRC, 'utf8'), context);

  // These are getters, not snapshots: the upgrade/decline assertions below
  // mutate the sandbox after run() has already returned, so a value copied at
  // return time would report the pre-mutation state and pass or fail wrongly.
  return {
    gtagCalls,
    get configs() {
      return gtagCalls
        .filter(([cmd]) => cmd === 'config')
        .map(([, id, cfg]) => ({ id, cfg }));
    },
    get gaDisable() { return window[`ga-disable-${MEASUREMENT_ID}`]; },
    get gtagScriptRequested() {
      return head.scripts.some((s) => String(s.src || '').includes('googletagmanager.com'));
    },
    store: localStore,
    api: window.zeroQuarryCookieConsent,
  };
}

console.log('no prior choice -> GA4 runs reduced and cookieless');
{
  const r = run();
  check('exactly one config', r.configs.length === 1, `got ${r.configs.length}`);
  const cfg = (r.configs[0] || {}).cfg || {};
  check('client_storage is "none"', cfg.client_storage === 'none', JSON.stringify(cfg.client_storage));
  check('google signals off', cfg.allow_google_signals === false);
  check('ad personalisation off', cfg.allow_ad_personalization_signals === false);
  check('ip anonymised', cfg.anonymize_ip === true);
  check('no cookie_domain while reduced', cfg.cookie_domain === undefined, JSON.stringify(cfg.cookie_domain));
  check('gtag.js requested', r.gtagScriptRequested);
  check('pageview still counted (config sent)', r.configs.length === 1);
}

console.log('\nprior accepted -> GA4 runs in the full configuration');
{
  const r = run({ priorChoice: 'accepted' });
  const cfg = (r.configs[0] || {}).cfg || {};
  check('exactly one config', r.configs.length === 1, `got ${r.configs.length}`);
  check('cookies allowed (no client_storage none)', cfg.client_storage === undefined,
        JSON.stringify(cfg.client_storage));
  check('cookie_domain is zeroquarry.com', cfg.cookie_domain === 'zeroquarry.com');
  check('ip anonymised', cfg.anonymize_ip === true);
}

console.log('\nprior declined -> GA4 never loads');
{
  const r = run({ priorChoice: 'declined' });
  check('no config call', r.configs.length === 0, `got ${r.configs.length}`);
  check('gtag.js not requested', !r.gtagScriptRequested);
  check('ga-disable set', r.gaDisable === true);
}

console.log('\naccepting after a reduced load actually upgrades');
{
  const r = run();
  r.api.accept();
  check('two configs now', r.configs.length === 2, `got ${r.configs.length}`);
  const upgraded = (r.configs[1] || {}).cfg || {};
  check('upgrade drops client_storage none', upgraded.client_storage === undefined,
        JSON.stringify(upgraded.client_storage));
  check('upgrade sets cookie_domain', upgraded.cookie_domain === 'zeroquarry.com');
  check('choice recorded as accepted', r.store.get('zeroquarry_cookie_consent') === 'accepted');
}

console.log('\ndeclining after a reduced load switches GA4 off');
{
  const r = run();
  r.api.decline();
  check('choice recorded as declined', r.store.get('zeroquarry_cookie_consent') === 'declined');
  check('ga-disable set', r.gaDisable === true);
}

console.log('');
if (failures) {
  console.error(`${failures} consent check(s) failed`);
  process.exit(1);
}
console.log('all consent checks passed');