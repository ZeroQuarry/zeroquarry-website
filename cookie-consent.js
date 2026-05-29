(function () {
  const script = document.currentScript;
  const analyticsId = script && script.dataset.analyticsId;
  const storageKey = 'zeroquarry_cookie_consent';
  const acceptedValue = 'accepted';
  const declinedValue = 'declined';
  const bannerId = 'cookie-consent-banner';
  let analyticsLoaded = false;

  function getChoice() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (_) {
      return null;
    }
  }

  function setChoice(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (_) {}
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
      .filter((name) => /^_ga/.test(name) || name === '_gid' || name === '_gat' || /^_gac_/.test(name))
      .forEach(deleteCookie);
  }

  function disableAnalytics() {
    if (analyticsId) {
      window['ga-disable-' + analyticsId] = true;
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
    window.gtag('config', analyticsId, { anonymize_ip: true });

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(analyticsId);
    document.head.appendChild(gaScript);
  }

  function closeBanner() {
    const banner = document.getElementById(bannerId);
    if (banner) banner.remove();
  }

  function acceptAnalytics() {
    setChoice(acceptedValue);
    closeBanner();
    loadAnalytics();
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
      '<p>We use Google Analytics to understand website traffic. You can decline and we will not load analytics tracking.</p>',
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
    const choice = getChoice();
    if (choice === acceptedValue) {
      loadAnalytics();
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
