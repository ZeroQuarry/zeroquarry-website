(function () {
  const script = document.currentScript;
  const analyticsId = script && script.dataset.analyticsId;
  const posthogKey = script && script.dataset.posthogKey;
  const posthogHost = (script && script.dataset.posthogHost) || 'https://us.i.posthog.com';
  const posthogUiHost = (script && script.dataset.posthogUiHost) || 'https://us.posthog.com';
  const storageKey = 'zeroquarry_cookie_consent';
  const consentCookieName = 'zq_analytics_consent';
  const acceptedValue = 'accepted';
  const declinedValue = 'declined';
  const bannerId = 'cookie-consent-banner';
  const partnerFormName = 'security-partner-pilot';
  const oaiPixelId = (script && script.dataset.oaiPixelId) || '';
  const oaiSdkUrl = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
  const requestScanFormName = 'request-scan';
  const requestScanSubmissionMarker = 'zq_request_scan_submission_pending';
  const partnerSubmissionMarker = 'zq_security_partner_submission_pending';
  let analyticsLoaded = false;
  let gaReduced = false;
  let posthogLoaded = false;
  let posthogReduced = false;
  let marketingTrackingInstalled = false;
  let oaiPixelLoaded = false;
  let oaiPixelConsentGranted = false;
  let oaiPixelObserved = false;

  // Consent-free PostHog configuration.
  //
  // Counted pageviews are how we learn which pages people land on and from
  // where, and at this site's volume that is worth having without asking. What
  // is deliberately switched off is everything that builds a profile or
  // replays a session:
  //   disable_persistence - nothing is written to cookies or localStorage, so
  //                        a visitor cannot be stitched across pages or
  //                        recognised on a return visit. Events still carry the
  //                        page, referrer and campaign of the single pageview.
  //   autocapture off     - no element/click capture, which is behavioural
  //                        profiling by another name.
  //   no session recording - recordings replay page content, which can contain
  //                        anything a visitor typed into a form.
  //   pageleave off       - unload tracking is a weak fingerprinting signal.
  //
  // Accepting analytics replaces this with the full configuration: persistent
  // identity, cross-subdomain association with the product, and recordings.
  const REDUCED_MODE = {
    disable_persistence: true,
    autocapture: false,
    session_recording: false,
    advanced_disable_decide: true,
    advanced_disable_feature_flags: true,
    advanced_disable_feature_flags_on_first_load: true,
    advanced_disable_surveys: true,
    capture_performance: false,
    capture_dead_clicks: false,
    capture_rageclick: false,
    capture_exceptions: false,
    respect_dnt: true,
  };

  function getChoice() {
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + consentCookieName + '=([^;]+)'));
    if (match) return decodeURIComponent(match[1]);
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) return stored;
    } catch (_) {
      // Fall back to the cross-subdomain consent cookie below.
    }
    return null;
  }

  function setChoice(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (_) {}
    const domain = /(^|\.)zeroquarry\.com$/i.test(window.location.hostname)
      ? '; Domain=.zeroquarry.com'
      : '';
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = consentCookieName + '=' + encodeURIComponent(choice)
      + '; Path=/; Max-Age=31536000; SameSite=Lax' + domain + secure;
  }

  function hostnameParts() {
    const host = window.location.hostname;
    if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return [''];
    }

    const parts = host.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i += 1) {
      domains.push('.' + parts.slice(i).join('.'));
    }
    return domains;
  }

  function deleteCookie(name) {
    const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
    hostnameParts().forEach((domain) => {
      const domainPart = domain ? '; domain=' + domain : '';
      document.cookie = name + '=; expires=' + expires + '; path=/' + domainPart;
    });
  }

  function deleteAnalyticsCookies() {
    document.cookie
      .split(';')
      .map((cookie) => cookie.split('=')[0].trim())
      .filter((name) => /^_ga/.test(name) || name === '_gid' || name === '_gat'
        || /^_gac_/.test(name) || /^ph_/.test(name))
      .forEach(deleteCookie);
  }

  function disableAnalytics() {
    if (analyticsId) {
      window['ga-disable-' + analyticsId] = true;
    }
    if (window.posthog && posthogLoaded && window.posthog.opt_out_capturing) {
      window.posthog.opt_out_capturing();
    }
    deleteAnalyticsCookies();
  }

  // Cookieless, signal-free GA4 settings. This is what runs before anyone
  // answers the banner, so it must not store anything on the device and must
  // not build an advertising profile:
  //   client_storage: 'none'          no _ga / _ga_<ID> cookie is written
  //   allow_google_signals: false     no Google Signals remarketing audience
  //   allow_ad_personalization_signals: false   no ad-personalisation features
  //   anonymize_ip: true              IP truncated on Google's side
  // It still sends page_view so traffic is countable before consent. The cost
  // is session stitching: without a cookie there is no _ga value for the _gl
  // cross-domain linker to carry, so marketing -> console attribution now
  // rests on the Referer header the console records at /register, which does
  // not need cookies or consent either way.
  const GA_REDUCED_CONFIG = {
    client_storage: 'none',
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    anonymize_ip: true,
  };

  function loadAnalytics(reduced) {
    if (!analyticsId || analyticsLoaded) return;
    analyticsLoaded = true;
    gaReduced = Boolean(reduced);
    window['ga-disable-' + analyticsId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    const config = reduced ? { ...GA_REDUCED_CONFIG } : { anonymize_ip: true };
    if (!reduced && /(^|\.)zeroquarry\.com$/i.test(window.location.hostname)) {
      config.cookie_domain = 'zeroquarry.com';
    }
    window.gtag('config', analyticsId, config);
    trackCurrentPageMilestone('google');

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(analyticsId);
    document.head.appendChild(gaScript);
  }

  function captureMarketingEvent(name, properties) {
    if (analyticsLoaded && window.gtag) {
      window.gtag('event', name, properties);
    }
    if (posthogLoaded && window.posthog && window.posthog.capture) {
      window.posthog.capture(name, properties);
    }
  }

  function setPartnerSubmissionMarker() {
    try {
      window.sessionStorage.setItem(partnerSubmissionMarker, '1');
    } catch (_) {}
  }

  function hasPartnerSubmissionMarker() {
    try {
      return window.sessionStorage.getItem(partnerSubmissionMarker) === '1';
    } catch (_) {
      return false;
    }
  }

  function consumePartnerSubmissionMarker(provider) {
    const providerKey = partnerSubmissionMarker + '_' + provider;
    try {
      if (window.sessionStorage.getItem(providerKey) === '1') return false;
      window.sessionStorage.setItem(providerKey, '1');
      return true;
    } catch (_) {
      return true;
    }
  }

  function trackCurrentPageMilestone(provider) {
    if (window.location.pathname === '/partners/thanks/'
      && hasPartnerSubmissionMarker()
      && consumePartnerSubmissionMarker(provider)) {
      const properties = {
        campaign_name: 'security-partner-pilot-2026',
        source_path: window.location.pathname,
      };
      if (provider === 'google' && window.gtag) {
        window.gtag('event', 'generate_lead', properties);
      }
      if (provider === 'posthog' && window.posthog && window.posthog.capture) {
        window.posthog.capture('partner_pilot_proposal_received', properties);
      }
    }
  }

  function installTrackedForm(options) {
    const form = document.forms[options.formName];
    if (!form) return;
    let formStarted = false;
    form.addEventListener('focusin', () => {
      if (formStarted) return;
      formStarted = true;
      captureMarketingEvent(options.startedEvent, {
        campaign_name: options.campaignName,
        source_path: window.location.pathname,
      });
    });
    form.addEventListener('submit', () => {
      options.setSubmissionMarker();
      const properties = {
        campaign_name: options.campaignName,
        source_path: window.location.pathname,
      };
      if (options.value) {
        properties.currency = 'USD';
        properties.value = options.value;
      }
      captureMarketingEvent(options.submittedEvent, properties);
    });
  }

  const campaignParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  // Stamped onto console-bound links so the signup that follows can be traced
  // back to the page that produced it. This reads only the visitor's own URL
  // and stores nothing — no cookie, no localStorage, no referrer read — so it
  // is not gated by the analytics consent banner below, and it still works for
  // the overwhelming majority of visitors who never click "Accept analytics".
  function attributionParams() {
    const current = new URL(window.location.href);
    const params = new URLSearchParams();
    params.set('ref', current.pathname);
    for (const key of campaignParams) {
      const value = current.searchParams.get(key);
      if (value) params.set(key, value);
    }
    return params;
  }

  function decorateConsoleLink(link) {
    if (!link || link.dataset.attributionStamped === '1') return;
    let destination;
    try {
      destination = new URL(link.getAttribute('href'), window.location.href);
    } catch (_) {
      return;
    }
    if (destination.hostname !== 'console.zeroquarry.com') return;
    if (destination.searchParams.has('ref')) return;
    link.dataset.attributionStamped = '1';
    for (const [key, value] of attributionParams()) {
      destination.searchParams.set(key, value);
    }
    link.href = destination.toString();
  }

  function decorateConsoleLinks(root) {
    const scope = root || document;
    if (!scope.querySelectorAll) return;
    for (const link of scope.querySelectorAll('a[href]')) {
      decorateConsoleLink(link);
    }
  }

  function setRequestScanSubmissionMarker() {
    try {
      window.sessionStorage.setItem(requestScanSubmissionMarker, '1');
    } catch (_) {}
  }

  function hasRequestScanSubmissionMarker() {
    try {
      return window.sessionStorage.getItem(requestScanSubmissionMarker) === '1';
    } catch (_) {
      return false;
    }
  }

  function consumeRequestScanSubmissionMarker() {
    try {
      if (window.sessionStorage.getItem(requestScanSubmissionMarker + '_sent') === '1') {
        return false;
      }
      window.sessionStorage.setItem(requestScanSubmissionMarker + '_sent', '1');
      return true;
    } catch (_) {
      return true;
    }
  }

  function trackRequestScanMilestone() {
    // A Netlify form posts to a thank-you page, so the submit fires here and
    // the completion is counted on /request-scan/thanks/. Two events, not one,
    // because a lead who abandons the form after submitting is a different
    // problem from a lead who never starts.
    if (window.location.pathname === '/request-scan/thanks/'
      && hasRequestScanSubmissionMarker()
      && consumeRequestScanSubmissionMarker()) {
      captureMarketingEvent('request_scan_submitted', {
        campaign_name: 'request-scan',
        source_path: window.location.pathname,
      });
      oaiMeasure('lead_created', { type: 'customer_action' });
    }
  }

  function installMarketingTracking() {
    if (marketingTrackingInstalled) return;
    marketingTrackingInstalled = true;
    decorateConsoleLinks();
    document.addEventListener('click', (event) => {
      const link = event.target && event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      let destination;
      try {
        destination = new URL(link.href, window.location.href);
      } catch (_) {
        return;
      }
      if (destination.hostname !== 'console.zeroquarry.com') return;
      // Catch links added after load, and keep the destination the user
      // actually lands on in sync with the stamped one.
      decorateConsoleLink(link);
      captureMarketingEvent('marketing_cta_clicked', {
        cta_text: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
        source_path: window.location.pathname,
        destination_url: destination.origin + destination.pathname,
      });
    });
    installTrackedForm({
      formName: partnerFormName,
      campaignName: 'security-partner-pilot-2026',
      startedEvent: 'partner_pilot_proposal_started',
      submittedEvent: 'partner_pilot_proposal_submitted',
      setSubmissionMarker: setPartnerSubmissionMarker,
    });
    installTrackedForm({
      formName: requestScanFormName,
      campaignName: 'request-scan',
      startedEvent: 'request_scan_started',
      submittedEvent: 'request_scan_submitted',
      setSubmissionMarker: setRequestScanSubmissionMarker,
    });
  }

  // ChatGPT Ads measurement pixel.
  //
  // Unlike GA4 and PostHog, this one is not loaded in any reduced mode. The
  // site's own privacy notice promises that a visitor who has not answered the
  // banner gets no cookies and nothing stored on their device; this pixel
  // holds a first-party `__oppref` click identifier, and the SDK has no mode
  // that runs without it. So it waits for an accept, and does nothing at all
  // for a decline. The Conversions API sender in the console covers the
  // visitors this misses.
  //
  // Consent is set *before* init on every path, because the SDK defaults to
  // granted: initialising first and calling consent(false) afterwards would
  // already have sent the ping. `oaiq('consent', true)` is held until init so
  // that setting consent and initialising cannot be reordered by accident.
  function oaiConsent(flag) {
    oaiPixelConsentGranted = flag;
    if (window.oaiq) window.oaiq('consent', flag);
  }

  function loadOaiPixel() {
    if (!oaiPixelId || oaiPixelLoaded) return;
    oaiPixelLoaded = true;
    (function (w, d, s, u) {
      if (w.oaiq) return;
      const q = function () { q.q.push(arguments); };
      q.q = [];
      w.oaiq = q;
      const js = d.createElement(s);
      js.async = true;
      js.src = u;
      const first = d.getElementsByTagName(s)[0];
      first.parentNode.insertBefore(js, first);
    })(window, document, 'script', oaiSdkUrl);
    window.oaiq('consent', false);
    if (oaiPixelConsentGranted) window.oaiq('consent', true);
    window.oaiq('init', { pixelId: oaiPixelId });
    oaiPixelObserved = true;
  }

  function oaiMeasure(eventName, data, options) {
    if (!oaiPixelId || !oaiPixelConsentGranted || !window.oaiq) return;
    if (typeof window.oaiq !== 'function') return;
    if (!oaiPixelObserved) {
      // The SDK's queue is only safe to push onto after init has been
      // queued, which loadOaiPixel does.
      loadOaiPixel();
    }
    if (options) window.oaiq('measure', eventName, data, options);
    else window.oaiq('measure', eventName, data);
  }

  function loadPostHog(reduced) {
    if (!posthogKey) return;
    if (posthogLoaded) {
      if (reduced) return;
      if (window.posthog && window.posthog.opt_in_capturing) window.posthog.opt_in_capturing();
      // Upgrading from the consent-free reduced mode after an accept: turn on
      // the cross-session identity and session recording that the full
      // configuration relies on. A failure here must not break the page.
      if (posthogReduced) {
        posthogReduced = false;
        try {
          // Persistence and the cross-subdomain cookie are the two identity
          // keys the consent-free init disabled, and the only two worth
          // flipping on this page: without them this visit's identity is
          // never written down, so the next page here — and the console on
          // its own subdomain — both start from a fresh anonymous id, and
          // the visit that produced a signup can never join the account it
          // produced. This is the documented way to move persistence after
          // init. Everything else REDUCED_MODE disabled (autocapture, flags,
          // surveys) only takes effect from the next full-page load, which
          // re-inits with the accepted configuration.
          window.posthog.set_config({ disable_persistence: false, cross_subdomain_cookie: true });
          window.posthog.set_person_profiles('identified_only');
          if (window.posthog.sessionRecording && window.posthog.sessionRecording.startSessionRecording) {
            window.posthog.sessionRecording.startSessionRecording();
          }
        } catch (_) {}
      }
      return;
    }
    posthogLoaded = true;
    posthogReduced = Boolean(reduced);
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session identify set_config reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(posthogKey, {
      api_host: posthogHost,
      ui_host: posthogUiHost,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: !posthogReduced,
      cross_subdomain_cookie: !posthogReduced,
      // Spread last so the reduced settings win on every key they set.
      ...(posthogReduced ? REDUCED_MODE : {}),
    });
    window.posthog.opt_in_capturing();
    trackCurrentPageMilestone('posthog');
  }

  function closeBanner() {
    const banner = document.getElementById(bannerId);
    if (banner) banner.remove();
  }

  function acceptAnalytics() {
    setChoice(acceptedValue);
    closeBanner();
    loadAnalytics();
    upgradeAnalytics();
    loadPostHog();
    oaiConsent(true);
    loadOaiPixel();
  }

  // Re-configure GA4 with the full settings once someone accepts, so accepting
  // actually grants the full configuration rather than leaving the visitor in
  // the cookieless pre-consent mode forever. GA4 treats a second config for
  // the same measurement id as an update and starts writing cookies from here.
  function upgradeAnalytics() {
    if (!analyticsId || !analyticsLoaded || !gaReduced || !window.gtag) return;
    gaReduced = false;
    const config = { anonymize_ip: true };
    if (/(^|\.)zeroquarry\.com$/i.test(window.location.hostname)) {
      config.cookie_domain = 'zeroquarry.com';
    }
    window.gtag('config', analyticsId, config);
  }

  function declineAnalytics() {
    setChoice(declinedValue);
    closeBanner();
    disableAnalytics();
  }

  function createBanner() {
    if (document.getElementById(bannerId)) return;

    const banner = document.createElement('section');
    banner.id = bannerId;
    banner.className = 'cookie-consent';
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = [
      '<p class="cookie-consent__copy">By clicking "Accept All", you agree to the storing of cookies to enhance our navigation, usage analytics, and '
        + '<a class="cookie-consent__link" href="' + privacyHref() + '">marketing efforts</a>.</p>',
      '<div class="cookie-consent__actions">',
      '<button class="cookie-consent__button cookie-consent__button--ghost" type="button" data-cookie-consent="decline">Decline</button>',
      '<button class="cookie-consent__button cookie-consent__button--primary" type="button" data-cookie-consent="accept">Accept All</button>',
      '</div>',
    ].join('');

    banner.addEventListener('click', (event) => {
      const action = event.target && event.target.getAttribute('data-cookie-consent');
      if (action === 'accept') acceptAnalytics();
      if (action === 'decline') declineAnalytics();
    });

    document.body.appendChild(banner);
  }

  function privacyHref() {
    const src = script && script.getAttribute('src');
    if (!src || src.indexOf('/') === -1) return 'privacy.html';
    return src.slice(0, src.lastIndexOf('/') + 1) + 'privacy.html';
  }

  function init() {
    installMarketingTracking();
    const choice = getChoice();
    if (choice === acceptedValue) {
      loadAnalytics();
      loadPostHog();
      oaiConsent(true);
      loadOaiPixel();
      // After the loaders, not before: captureMarketingEvent drops an event
      // when neither analytics nor PostHog is loaded yet, which is exactly
      // what happened when this ran first.
      trackRequestScanMilestone();
      return;
    }
    if (choice === declinedValue) {
      disableAnalytics();
      return;
    }
    // No choice recorded yet. Count this pageview in the reduced mode — no
    // cookies, no localStorage, no recording, nothing that identifies anyone —
    // and still offer the full analytics option. GA4 runs in the same
    // cookieless, signal-free mode here, so traffic is countable before anyone
    // answers; accepting only upgrades it to the full configuration.
    loadAnalytics(true);
    loadPostHog(true);
    trackRequestScanMilestone();
    createBanner();
  }

  window.zeroQuarryCookieConsent = {
    accept: acceptAnalytics,
    decline: declineAnalytics,
    open: createBanner,
    reset: function () {
      if (window.oaiq) window.oaiq('consent', false);
      oaiPixelConsentGranted = false;
      try {
        window.localStorage.removeItem(storageKey);
      } catch (_) {}
      createBanner();
    },
  };

  disableAnalytics();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
