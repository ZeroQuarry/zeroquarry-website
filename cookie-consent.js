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
  const cohortFormName = 'founding-security-cohort';
  const cohortSubmissionMarker = 'zq_founding_cohort_submission_pending';
  const partnerFormName = 'security-partner-pilot';
  const partnerSubmissionMarker = 'zq_security_partner_submission_pending';
  let analyticsLoaded = false;
  let posthogLoaded = false;
  let marketingTrackingInstalled = false;

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

  function loadAnalytics() {
    if (!analyticsId || analyticsLoaded) return;
    analyticsLoaded = true;
    window['ga-disable-' + analyticsId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    const config = { anonymize_ip: true };
    if (/(^|\.)zeroquarry\.com$/i.test(window.location.hostname)) {
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

  function setCohortSubmissionMarker() {
    try {
      window.sessionStorage.setItem(cohortSubmissionMarker, '1');
    } catch (_) {}
  }

  function hasCohortSubmissionMarker() {
    try {
      return window.sessionStorage.getItem(cohortSubmissionMarker) === '1';
    } catch (_) {
      return false;
    }
  }

  function consumeCohortSubmissionMarker(provider) {
    const providerKey = cohortSubmissionMarker + '_' + provider;
    try {
      if (window.sessionStorage.getItem(providerKey) === '1') return false;
      window.sessionStorage.setItem(providerKey, '1');
      return true;
    } catch (_) {
      return true;
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
    if (window.location.pathname === '/founding-security-cohort/thanks/'
      && hasCohortSubmissionMarker()
      && consumeCohortSubmissionMarker(provider)) {
      const properties = {
        campaign_name: 'founding-security-cohort-2026',
        source_path: window.location.pathname,
        currency: 'USD',
        value: 1000,
      };
      if (provider === 'google' && window.gtag) {
        window.gtag('event', 'generate_lead', properties);
      }
      if (provider === 'posthog' && window.posthog && window.posthog.capture) {
        window.posthog.capture('cohort_application_received', properties);
      }
    }

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

  function installMarketingTracking() {
    if (marketingTrackingInstalled) return;
    marketingTrackingInstalled = true;
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
      captureMarketingEvent('marketing_cta_clicked', {
        cta_text: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
        source_path: window.location.pathname,
        destination_url: destination.origin + destination.pathname,
      });
    });
    installTrackedForm({
      formName: cohortFormName,
      campaignName: 'founding-security-cohort-2026',
      startedEvent: 'cohort_application_started',
      submittedEvent: 'cohort_application_submitted',
      setSubmissionMarker: setCohortSubmissionMarker,
      value: 1000,
    });
    installTrackedForm({
      formName: partnerFormName,
      campaignName: 'security-partner-pilot-2026',
      startedEvent: 'partner_pilot_proposal_started',
      submittedEvent: 'partner_pilot_proposal_submitted',
      setSubmissionMarker: setPartnerSubmissionMarker,
    });
  }

  function loadPostHog() {
    if (!posthogKey) return;
    if (posthogLoaded) {
      if (window.posthog && window.posthog.opt_in_capturing) window.posthog.opt_in_capturing();
      return;
    }
    posthogLoaded = true;
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session identify reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(posthogKey, {
      api_host: posthogHost,
      ui_host: posthogUiHost,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      cross_subdomain_cookie: true,
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
    loadPostHog();
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
      '<div class="cookie-consent__copy">',
      '<h2>Analytics cookies</h2>',
      '<p>We use Google Analytics and PostHog to understand website traffic and the journey into our product. You can decline and we will not load analytics tracking.</p>',
      '</div>',
      '<div class="cookie-consent__actions">',
      '<button class="cookie-consent__button cookie-consent__button--ghost" type="button" data-cookie-consent="decline">Decline</button>',
      '<button class="cookie-consent__button cookie-consent__button--primary" type="button" data-cookie-consent="accept">Accept analytics</button>',
      '<a class="cookie-consent__link" href="' + privacyHref() + '">Privacy policy</a>',
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
      return;
    }
    if (choice === declinedValue) {
      disableAnalytics();
      return;
    }
    createBanner();
  }

  window.zeroQuarryCookieConsent = {
    accept: acceptAnalytics,
    decline: declineAnalytics,
    open: createBanner,
    reset: function () {
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
