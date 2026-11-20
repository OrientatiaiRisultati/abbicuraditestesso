/*!
 * cookie-consent.js v1.1.1
 * Banner dei cookie riutilizzabile, senza dipendenze.
 * Orientati ai Risultati — licenza MIT.
 *
 * COME SI USA (in breve, dettagli nel README):
 *   1. Nel <head>, PRIMA di qualsiasi script di tracciamento:
 *        <script>window.CookieConsentConfig = { ...configurazione del sito... };</script>
 *        <script src="/cookie-consent.js"></script>        <- senza async/defer
 *   2. Gli script facoltativi si scrivono così (non partono finché non c'è consenso):
 *        <script type="text/plain" data-consent="marketing" data-service="meta-pixel">...</script>
 *        <script type="text/plain" data-consent="analytics" data-src="https://..."></script>
 *   3. Gli iframe facoltativi (YouTube ecc.) usano data-src invece di src:
 *        <iframe data-src="https://www.youtube-nocookie.com/embed/ID" data-consent="marketing" data-service="youtube"></iframe>
 *   4. Link sempre disponibile per riaprire le preferenze:
 *        <a href="#preferenze-cookie" data-cc="preferences">Preferenze cookie</a>
 *
 * Categorie: necessary (sempre attiva), functional, analytics, marketing.
 * Una categoria compare nel pannello solo se ha almeno un servizio configurato.
 */
(function (window, document) {
  'use strict';

  if (window.CookieConsent && window.CookieConsent.version) return; // già caricato

  /* =====================================================================
   * 1. CONFIGURAZIONE PREDEFINITA
   *    Su ogni sito sovrascrivi solo ciò che serve con window.CookieConsentConfig
   *    (oppure modifica direttamente questo blocco, se preferisci un file per sito).
   * ===================================================================== */
  var DEFAULT_CONFIG = {
    siteName: '',

    // Cambia questa stringa quando aggiorni la cookie policy: il banner verrà riproposto.
    // Il banner viene riproposto anche automaticamente se cambi l'elenco dei servizi.
    policyVersion: '1',

    cookiePolicyUrl: '/cookie-policy',
    privacyPolicyUrl: '/privacy',

    // Dove salvare la scelta (cookie tecnico di prima parte).
    storage: {
      name: 'cc_consent',
      days: 182,          // circa 6 mesi, come da Linee guida del Garante
      domain: ''          // es. '.abbicuraditestesso.it' per condividere la scelta tra sottodomini
    },

    // Se l'utente revoca un consenso: cancella i cookie dei servizi revocati e ricarica la pagina.
    reloadOnRevoke: true,

    // Google Consent Mode v2: imposta i default "denied" e li aggiorna dopo la scelta.
    googleConsentMode: true,

    // Per Google Tag Manager: a ogni caricamento con consenso e a ogni scelta inserisce nel dataLayer
    // { event: 'oar_consent', oar_analytics: true/false, oar_marketing: ..., oar_functional: ..., oar_services: '...' }
    // In GTM si usa come attivatore "Evento personalizzato" (vedi README). false per disattivarlo.
    dataLayerEvent: 'oar_consent',

    // Aspetto
    position: 'bottom',      // 'bottom' (banner in basso, centrato) | 'center' (al centro dello schermo)
    floatingButton: false,   // pulsante fisso in basso a sinistra per riaprire le preferenze (utile nelle web app)
    theme: {
      font: 'inherit',
      fontSize: '16px',
      background: '#ffffff',
      text: '#1f2328',
      muted: '#4b5563',
      border: '#d1d5db',
      buttonBackground: '#1f2937',   // stesso stile per TUTTI i pulsanti di scelta (pari evidenza)
      buttonText: '#ffffff',
      buttonHover: '#374151',
      toggleOn: '#1f2937',
      toggleOff: '#6b7280',
      link: '#1d4ed8',
      focus: '#2563eb',
      overlay: 'rgba(17, 24, 39, 0.55)',
      radius: '12px',
      shadow: '0 10px 40px rgba(0,0,0,.18)'
    },

    // Testi. {services} = elenco dei servizi facoltativi configurati, {cookiePolicy} = link alla cookie policy.
    texts: {
      bannerTitle: 'Cookie',
      bannerText: 'Usiamo cookie tecnici, necessari al funzionamento del sito. Solo con il tuo consenso usiamo anche cookie di terze parti per statistiche e pubblicità ({services}). Chiudendo con la X rifiuti tutti i cookie facoltativi. {cookiePolicy}',
      cookiePolicyLink: 'Cookie policy',
      privacyPolicyLink: 'Privacy policy',
      reject: 'Rifiuta',
      acceptAll: 'Accetta tutto',
      customize: 'Personalizza',
      closeBanner: 'Chiudi e rifiuta i cookie facoltativi',
      panelTitle: 'Preferenze cookie',
      panelIntro: 'Scegli quali cookie facoltativi attivare. Quelli tecnici sono sempre attivi perché servono al funzionamento del sito. Puoi cambiare idea in qualsiasi momento dal link "Preferenze cookie".',
      rejectAll: 'Rifiuta tutto',
      save: 'Salva preferenze',
      close: 'Chiudi',
      alwaysOn: 'Sempre attivi',
      servicesLabel: 'Servizi e cookie',
      provider: 'Fornitore',
      purpose: 'Finalità',
      duration: 'Durata',
      cookies: 'Cookie',
      privacy: 'Informativa',
      placeholderText: 'Questo contenuto è fornito da {service}, che usa cookie di {category}. Per vederlo serve il tuo consenso.',
      placeholderAccept: 'Accetta e mostra',
      placeholderSettings: 'Preferenze cookie',
      floatingButton: 'Preferenze cookie'
    },

    categories: {
      necessary: {
        title: 'Cookie tecnici (necessari)',
        description: 'Servono al funzionamento del sito e a ricordare le tue scelte sui cookie. Non richiedono consenso e non possono essere disattivati.'
      },
      functional: {
        title: 'Funzionalità aggiuntive',
        description: 'Attivano contenuti e servizi di terze parti integrati nel sito, come mappe o chat. Senza consenso questi contenuti restano bloccati.'
      },
      analytics: {
        title: 'Statistica',
        description: 'Ci aiutano a capire come viene usato il sito (pagine visitate, provenienza delle visite) per migliorarlo. I dati sono raccolti da servizi di terze parti.'
      },
      marketing: {
        title: 'Marketing e profilazione pubblicitaria',
        description: 'Permettono a servizi di terze parti di misurare l\'efficacia delle nostre campagne pubblicitarie e di mostrarti annunci in linea con i tuoi interessi, anche su altri siti.'
      }
    },

    // Servizi: stringhe che richiamano un preset (vedi PRESETS) oppure oggetti completi.
    // Esempio: services: ['meta-pixel', 'ga4', 'youtube']
    services: [],

    // Prova del consenso (facoltativo): URL a cui inviare ogni scelta in POST (JSON).
    logEndpoint: '',
    // Callback facoltative
    onConsent: null,   // function (record, action) {}  -> a ogni scelta
    onChange: null     // function (record) {}          -> quando cambiano le categorie concesse
  };

  /* =====================================================================
   * 2. PRESET DEI SERVIZI PIÙ COMUNI
   *    Verifica sempre durate e cookie con una scansione reale del sito.
   *    "cookies" = cookie di prima parte da cancellare in caso di revoca (* = jolly).
   * ===================================================================== */
  var PRESETS = {
    'meta-pixel': {
      id: 'meta-pixel',
      name: 'Meta Pixel',
      provider: 'Meta Platforms Ireland Ltd.',
      category: 'marketing',
      purpose: 'Misurare le conversioni delle inserzioni su Facebook e Instagram, creare pubblico personalizzato e mostrare annunci mirati.',
      duration: '_fbp e _fbc: 3 mesi',
      privacyUrl: 'https://www.facebook.com/privacy/policy/',
      cookies: ['_fbp', '_fbc']
    },
    'ga4': {
      id: 'ga4',
      name: 'Google Analytics 4',
      provider: 'Google Ireland Ltd.',
      category: 'analytics',
      purpose: 'Statistiche sull\'uso del sito (pagine viste, sessioni, provenienza delle visite).',
      duration: '_ga e _ga_*: 2 anni',
      privacyUrl: 'https://policies.google.com/privacy',
      cookies: ['_ga', '_ga_*', '_gid', '_gat*']
    },
    'google-ads': {
      id: 'google-ads',
      name: 'Google Ads',
      provider: 'Google Ireland Ltd.',
      category: 'marketing',
      purpose: 'Misurare le conversioni delle campagne Google Ads e fare remarketing.',
      duration: '_gcl_au: 3 mesi',
      privacyUrl: 'https://policies.google.com/privacy',
      cookies: ['_gcl_*']
    },
    'youtube': {
      id: 'youtube',
      name: 'YouTube',
      provider: 'Google Ireland Ltd.',
      category: 'marketing',
      purpose: 'Mostrare i video incorporati. YouTube può usare cookie e tecnologie simili per statistiche e pubblicità.',
      duration: 'Da fine sessione fino a 8 mesi (cookie impostati sul dominio di YouTube)',
      privacyUrl: 'https://policies.google.com/privacy',
      cookies: []
    },
    'microsoft-clarity': {
      id: 'microsoft-clarity',
      name: 'Microsoft Clarity',
      provider: 'Microsoft Ireland Operations Ltd.',
      category: 'analytics',
      purpose: 'Mappe di calore e registrazioni anonime delle sessioni per migliorare il sito.',
      duration: '_clck: 1 anno; _clsk: 1 giorno',
      privacyUrl: 'https://privacy.microsoft.com/it-it/privacystatement',
      cookies: ['_clck', '_clsk']
    }
  };

  // Il cookie con cui ricordiamo la scelta: aggiunto in automatico tra i tecnici.
  function selfService(cfg) {
    return {
      id: '_cookie-consent',
      name: 'Preferenze cookie',
      provider: cfg.siteName || 'Questo sito',
      category: 'necessary',
      purpose: 'Ricorda le tue scelte sui cookie, così il banner non ti viene riproposto a ogni visita.',
      duration: Math.round(cfg.storage.days / 30) + ' mesi',
      cookies: [cfg.storage.name],
      privacyUrl: ''
    };
  }

  var CATEGORY_ORDER = ['necessary', 'functional', 'analytics', 'marketing'];

  // Corrispondenza categorie -> segnali di Google Consent Mode v2
  var GCM_MAP = {
    functional: ['functionality_storage', 'personalization_storage'],
    analytics: ['analytics_storage'],
    marketing: ['ad_storage', 'ad_user_data', 'ad_personalization']
  };

  /* =====================================================================
   * 3. UTILITÀ
   * ===================================================================== */
  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

  function merge(base, extra) {
    var out = {}, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    if (!isObj(extra)) return out;
    for (k in extra) {
      if (!Object.prototype.hasOwnProperty.call(extra, k)) continue;
      out[k] = (isObj(base[k]) && isObj(extra[k])) ? merge(base[k], extra[k]) : extra[k];
    }
    return out;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fill(tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; });
  }

  function hash(str) { // djb2, basta per capire se l'elenco servizi è cambiato
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function splitList(v) { return String(v || '').split(/[\s,|]+/).filter(Boolean); }

  /* ---------- cookie ---------- */
  function readCookie(name) {
    var parts = document.cookie ? document.cookie.split('; ') : [];
    for (var i = 0; i < parts.length; i++) {
      var idx = parts[i].indexOf('=');
      if (parts[i].slice(0, idx) === name) return parts[i].slice(idx + 1);
    }
    return null;
  }

  function writeCookie(name, value, days, domain) {
    var c = name + '=' + value + '; Max-Age=' + Math.round(days * 86400) + '; Path=/; SameSite=Lax';
    if (domain) c += '; Domain=' + domain;
    if (location.protocol === 'https:') c += '; Secure';
    document.cookie = c;
  }

  // Cancella un cookie su tutte le combinazioni di dominio possibili (host, .host, domini padre)
  function expireCookie(name) {
    var host = location.hostname, parts = host.split('.'), domains = ['', host, '.' + host];
    for (var i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    var paths = ['/', location.pathname];
    domains.forEach(function (d) {
      paths.forEach(function (p) {
        document.cookie = name + '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=' + p + (d ? '; Domain=' + d : '');
      });
    });
  }

  function patternToRegex(p) {
    return new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  }

  function deleteCookies(patterns) {
    if (!patterns.length) return;
    var regs = patterns.map(patternToRegex);
    (document.cookie ? document.cookie.split('; ') : []).forEach(function (pair) {
      var name = pair.split('=')[0];
      if (regs.some(function (r) { return r.test(name); })) expireCookie(name);
    });
  }

  /* =====================================================================
   * 4. STATO
   * ===================================================================== */
  var cfg = null;          // configurazione risolta
  var services = [];       // servizi risolti
  var revision = '';       // impronta dell'elenco servizi
  var consent = null;      // scelta valida corrente (o null)
  var listeners = [];
  var ui = { root: null, banner: null, panel: null, overlay: null, lastFocus: null, fab: null };
  var observer = null;
  var initialized = false;

  function resolveServices(list) {
    var out = [];
    (list || []).forEach(function (s) {
      var svc = typeof s === 'string' ? PRESETS[s] : (isObj(s) && s.preset ? merge(PRESETS[s.preset] || {}, s) : s);
      if (!svc) { warn('servizio sconosciuto: ' + s); return; }
      if (!svc.id) svc = merge(svc, { id: String(svc.name || 'servizio').toLowerCase().replace(/\W+/g, '-') });
      out.push(svc);
    });
    return out;
  }

  function warn(msg) { if (window.console) console.warn('[cookie-consent] ' + msg); }

  function activeCategories() {
    // categorie facoltative che hanno almeno un servizio
    return CATEGORY_ORDER.filter(function (c) {
      return c !== 'necessary' && cfg.categories[c] && services.some(function (s) { return s.category === c; });
    });
  }

  function readConsent() {
    var raw = readCookie(cfg.storage.name);
    if (!raw) return null;
    try {
      var rec = JSON.parse(decodeURIComponent(raw));
      if (!rec || rec.policyVersion !== String(cfg.policyVersion) || rec.revision !== revision) return null;
      var age = Date.now() - new Date(rec.timestamp).getTime();
      if (!(age >= 0) || age > cfg.storage.days * 86400000) return null;
      return rec;
    } catch (e) { return null; }
  }

  function allowed(category) {
    if (category === 'necessary') return true;
    return !!(consent && consent.categories && consent.categories[category]);
  }

  function serviceAllowed(id) {
    return !!(consent && consent.services && consent.services.indexOf(id) !== -1);
  }

  function elementAllowed(el) {
    var cats = splitList(el.getAttribute('data-consent'));
    for (var i = 0; i < cats.length; i++) if (allowed(cats[i])) return true;
    var svc = el.getAttribute('data-service');
    return !!(svc && serviceAllowed(svc));
  }

  /* =====================================================================
   * 5. GOOGLE CONSENT MODE v2
   * ===================================================================== */
  function gtagStub() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
  }

  function gcmState() {
    var state = { security_storage: 'granted' };
    Object.keys(GCM_MAP).forEach(function (cat) {
      GCM_MAP[cat].forEach(function (k) { state[k] = allowed(cat) ? 'granted' : 'denied'; });
    });
    return state;
  }

  function gcmDefault() {
    if (!cfg.googleConsentMode) return;
    gtagStub();
    var d = gcmState(); // con consenso già salvato parte direttamente dallo stato giusto
    d.wait_for_update = 500;
    window.gtag('consent', 'default', d);
    window.gtag('set', 'ads_data_redaction', true);
  }

  // Comunica la scelta a Google Tag Manager (o a qualunque script che legga il dataLayer)
  function pushDataLayer() {
    if (!cfg.dataLayerEvent || !consent) return;
    window.dataLayer = window.dataLayer || [];
    var ev = { event: cfg.dataLayerEvent, oar_services: (consent.services || []).join(',') };
    ['functional', 'analytics', 'marketing'].forEach(function (c) { ev['oar_' + c] = allowed(c); });
    window.dataLayer.push(ev);
  }

  function gcmUpdate() {
    if (!cfg.googleConsentMode) return;
    gtagStub();
    window.gtag('consent', 'update', gcmState());
  }

  /* =====================================================================
   * 6. ATTIVAZIONE DI SCRIPT E IFRAME
   * ===================================================================== */
  function activateScript(old) {
    var s = document.createElement('script');
    for (var i = 0; i < old.attributes.length; i++) {
      var a = old.attributes[i];
      if (a.name === 'type' || a.name === 'data-src' || a.name === 'data-type') continue;
      s.setAttribute(a.name, a.value);
    }
    s.type = old.getAttribute('data-type') || 'text/javascript';
    var src = old.getAttribute('data-src') || old.getAttribute('src');
    if (src) { s.src = src; s.async = old.hasAttribute('async'); } // senza async: rispetta l'ordine
    else s.text = old.text;
    s.setAttribute('data-cc-done', '1');
    old.parentNode.replaceChild(s, old);
  }

  function serviceOf(el) {
    var id = el.getAttribute('data-service');
    var found = null;
    if (id) services.forEach(function (s) { if (s.id === id) found = s; });
    return found;
  }

  function activateEmbed(el) {
    var src = el.getAttribute('data-src');
    if (src) el.setAttribute('src', src);
    el.removeAttribute('data-src');
    el.setAttribute('data-cc-done', '1');
    if (el.__ccPlaceholder) { el.__ccPlaceholder.parentNode && el.__ccPlaceholder.parentNode.removeChild(el.__ccPlaceholder); el.__ccPlaceholder = null; }
    el.style.display = el.__ccDisplay || '';
  }

  function placeholderFor(el) {
    if (el.__ccPlaceholder || el.tagName !== 'IFRAME') return;
    var svc = serviceOf(el);
    var cat = splitList(el.getAttribute('data-consent'))[0] || 'marketing';
    var catTitle = (cfg.categories[cat] && cfg.categories[cat].title) || cat;
    var t = cfg.texts;
    var ph = document.createElement('div');
    ph.className = 'cc-placeholder';
    var w = el.getAttribute('width'), h = el.getAttribute('height');
    if (w && h && !/%/.test(w + h)) ph.style.aspectRatio = w + ' / ' + h;
    ph.innerHTML =
      '<div class="cc-ph-inner">' +
        '<p>' + esc(fill(t.placeholderText, { service: svc ? svc.name : (el.getAttribute('title') || 'un servizio esterno'), category: catTitle.toLowerCase() })) + '</p>' +
        '<div class="cc-ph-actions">' +
          '<button type="button" class="cc-btn" data-cc-accept-embed>' + esc(t.placeholderAccept) + '</button>' +
          '<button type="button" class="cc-link-btn" data-cc="preferences">' + esc(t.placeholderSettings) + '</button>' +
        '</div>' +
      '</div>';
    ph.querySelector('[data-cc-accept-embed]').addEventListener('click', function () {
      // consenso limitato a QUESTO servizio (o alla categoria, se il servizio non è indicato)
      if (svc) grantService(svc.id); else setConsent(withCategory(cat), 'embed');
    });
    el.__ccDisplay = el.style.display;
    el.style.display = 'none';
    el.parentNode.insertBefore(ph, el);
    el.__ccPlaceholder = ph;
    ensureStyles();
  }

  function scan(root) {
    root = root || document;
    if (!cfg) return;
    var list = root.querySelectorAll ? root.querySelectorAll('[data-consent]:not([data-cc-done])') : [];
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.tagName === 'SCRIPT') {
        if (el.type !== 'text/plain') continue; // script già "normale": non lo tocchiamo
        if (elementAllowed(el)) activateScript(el);
      } else if (el.hasAttribute('data-src')) {
        if (elementAllowed(el)) activateEmbed(el);
        else placeholderFor(el);
      }
    }
  }

  function observe() {
    if (observer || !window.MutationObserver) return;
    // Utile nelle web app: gli elementi aggiunti dopo il caricamento vengono gestiti in automatico.
    observer = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        for (var j = 0; j < muts[i].addedNodes.length; j++) {
          var n = muts[i].addedNodes[j];
          if (n.nodeType !== 1 || (ui.root && ui.root.contains(n))) continue;
          if (n.hasAttribute('data-consent')) scan(n.parentNode || document);
          else if (n.querySelector && n.querySelector('[data-consent]')) scan(n);
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Cancella i cookie di prima parte dei servizi che ora NON sono consentiti.
  // Serve anche a ogni caricamento: uno script già partito (es. GA4) può riscrivere
  // i suoi cookie negli istanti prima del ricaricamento che segue una revoca.
  function cleanupDenied() {
    var patterns = [];
    services.forEach(function (s) {
      if (s.category === 'necessary') return;
      if (!allowed(s.category) && !serviceAllowed(s.id)) patterns = patterns.concat(s.cookies || []);
    });
    deleteCookies(patterns);
  }

  /* =====================================================================
   * 7. SALVATAGGIO, REVOCA, LOG
   * ===================================================================== */
  function emptyChoice() {
    var c = {};
    activeCategories().forEach(function (k) { c[k] = false; });
    return c;
  }

  function withCategory(cat) {
    var c = consent ? merge(emptyChoice(), consent.categories) : emptyChoice();
    c[cat] = true;
    return { categories: c, services: consent ? consent.services.slice() : [] };
  }

  function grantService(id) {
    var base = consent ? { categories: merge(emptyChoice(), consent.categories), services: consent.services.slice() }
                       : { categories: emptyChoice(), services: [] };
    if (base.services.indexOf(id) === -1) base.services.push(id);
    setConsent(base, 'embed');
  }

  function setConsent(choice, action) {
    var prev = consent;
    var cats = merge(emptyChoice(), choice.categories || {});
    var rec = {
      id: (prev && prev.id) || uuid(),
      timestamp: new Date().toISOString(),
      policyVersion: String(cfg.policyVersion),
      revision: revision,
      action: action,
      categories: cats,
      services: (choice.services || []).slice()
    };

    // Che cosa è stato revocato rispetto a prima?
    var revokedCats = [], revokedSvcs = [];
    if (prev) {
      Object.keys(prev.categories || {}).forEach(function (k) { if (prev.categories[k] && !cats[k]) revokedCats.push(k); });
      (prev.services || []).forEach(function (s) { if (rec.services.indexOf(s) === -1) revokedSvcs.push(s); });
    }

    consent = rec;
    writeCookie(cfg.storage.name, encodeURIComponent(JSON.stringify(rec)), cfg.storage.days, cfg.storage.domain);

    gcmUpdate();
    pushDataLayer();
    hideBanner(); hidePanel(); showFab();

    // Notifiche e prova del consenso
    var detail = JSON.parse(JSON.stringify(rec));
    try { if (typeof cfg.onConsent === 'function') cfg.onConsent(detail, action); } catch (e) { warn(e); }
    dispatch('cookieconsent:consent', detail);
    sendLog(detail);

    var changed = !prev || JSON.stringify(prev.categories) !== JSON.stringify(rec.categories) ||
                  JSON.stringify(prev.services) !== JSON.stringify(rec.services);
    if (changed) {
      try { if (typeof cfg.onChange === 'function') cfg.onChange(detail); } catch (e2) { warn(e2); }
      listeners.forEach(function (fn) { try { fn(detail); } catch (e3) { warn(e3); } });
      dispatch('cookieconsent:change', detail);
    }

    if (revokedCats.length || revokedSvcs.length) {
      var patterns = [];
      services.forEach(function (s) {
        var revokedNow = (revokedCats.indexOf(s.category) !== -1 && !serviceAllowed(s.id)) ||
                         (revokedSvcs.indexOf(s.id) !== -1 && !allowed(s.category));
        if (revokedNow) patterns = patterns.concat(s.cookies || []);
      });
      deleteCookies(patterns);
      if (cfg.reloadOnRevoke) { setTimeout(function () { cleanupDenied(); location.reload(); }, 50); return; }
    }

    scan(document); // attiva ciò che ora è consentito
  }

  function dispatch(name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) { /* browser molto vecchi */ }
  }

  function sendLog(rec) {
    if (!cfg.logEndpoint) return;
    var payload = JSON.stringify({
      consentId: rec.id,
      timestamp: rec.timestamp,
      action: rec.action,
      categories: rec.categories,
      services: rec.services,
      policyVersion: rec.policyVersion,
      revision: rec.revision,
      url: location.href,
      userAgent: navigator.userAgent
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(cfg.logEndpoint, new Blob([payload], { type: 'application/json' }))) return;
    } catch (e) { /* passa a fetch */ }
    try {
      fetch(cfg.logEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true, credentials: 'omit' });
    } catch (e2) { warn('log non inviato'); }
  }

  function acceptAll() {
    var c = {};
    activeCategories().forEach(function (k) { c[k] = true; });
    setConsent({ categories: c, services: [] }, 'accept_all');
  }

  function rejectAll(action) {
    setConsent({ categories: emptyChoice(), services: [] }, action || 'reject_all');
  }

  /* =====================================================================
   * 8. INTERFACCIA
   * ===================================================================== */
  var stylesInjected = false;
  function ensureStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var th = cfg.theme;
    var css =
      '#cc-root,.cc-placeholder{--cc-font:' + th.font + ';--cc-fs:' + th.fontSize + ';--cc-bg:' + th.background + ';--cc-text:' + th.text +
      ';--cc-muted:' + th.muted + ';--cc-border:' + th.border + ';--cc-btn-bg:' + th.buttonBackground + ';--cc-btn-text:' + th.buttonText +
      ';--cc-btn-hover:' + th.buttonHover + ';--cc-on:' + th.toggleOn + ';--cc-off:' + th.toggleOff + ';--cc-link:' + th.link +
      ';--cc-focus:' + th.focus + ';--cc-overlay:' + th.overlay + ';--cc-radius:' + th.radius + ';--cc-shadow:' + th.shadow + '}' +
      '#cc-root,#cc-root *,.cc-placeholder,.cc-placeholder *{box-sizing:border-box}' +
      '#cc-root{font-family:var(--cc-font);font-size:var(--cc-fs);line-height:1.5;color:var(--cc-text)}' +
      '#cc-root h2,#cc-root h3,#cc-root h4,#cc-root p,#cc-root button,#cc-root dl{font-family:var(--cc-font);letter-spacing:normal;text-transform:none}' +
      '#cc-root [hidden]{display:none!important}' +
      '.cc-banner{position:fixed;z-index:2147483600;left:50%;transform:translateX(-50%);bottom:16px;width:calc(100% - 32px);max-width:720px;' +
        'background:var(--cc-bg);color:var(--cc-text);border:1px solid var(--cc-border);border-radius:var(--cc-radius);box-shadow:var(--cc-shadow);padding:20px 22px}' +
      '.cc-banner.cc-center{bottom:auto;top:50%;transform:translate(-50%,-50%)}' +
      '.cc-banner h2,.cc-panel h2{font-size:1.125em;font-weight:700;margin:0 0 8px;padding-right:40px;color:var(--cc-text)}' +
      '.cc-banner p{margin:0 0 16px;color:var(--cc-text)}' +
      '#cc-root a,.cc-placeholder a{color:var(--cc-link);text-decoration:underline}' +
      '.cc-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '.cc-actions .cc-btn{flex:1 1 0;min-width:140px}' +
      '.cc-btn{font:inherit;font-weight:600;font-size:1em;cursor:pointer;border:2px solid var(--cc-btn-bg);background:var(--cc-btn-bg);color:var(--cc-btn-text);' +
        'border-radius:calc(var(--cc-radius) * .66);padding:11px 18px;min-height:46px;line-height:1.2;text-align:center}' +
      '.cc-btn:hover{background:var(--cc-btn-hover);border-color:var(--cc-btn-hover)}' +
      '.cc-x{position:absolute;top:10px;right:10px;width:40px;height:40px;border:0;background:transparent;color:var(--cc-text);cursor:pointer;border-radius:8px;' +
        'display:flex;align-items:center;justify-content:center;padding:0}' +
      '.cc-x:hover{background:rgba(0,0,0,.06)}' +
      '.cc-x svg{width:20px;height:20px}' +
      '#cc-root :focus-visible,.cc-placeholder :focus-visible{outline:3px solid var(--cc-focus);outline-offset:2px}' +
      '.cc-overlay{position:fixed;inset:0;z-index:2147483610;background:var(--cc-overlay)}' +
      '.cc-panel{position:fixed;z-index:2147483620;left:50%;top:50%;transform:translate(-50%,-50%);width:calc(100% - 24px);max-width:680px;max-height:calc(100% - 24px);' +
        'display:flex;flex-direction:column;background:var(--cc-bg);color:var(--cc-text);border-radius:var(--cc-radius);box-shadow:var(--cc-shadow)}' +
      '.cc-panel-head{position:relative;padding:20px 22px 12px;border-bottom:1px solid var(--cc-border)}' +
      '.cc-panel-head p{margin:0;color:var(--cc-muted);font-size:.9375em}' +
      '.cc-panel-body{overflow-y:auto;padding:4px 22px;flex:1 1 auto;overscroll-behavior:contain}' +
      '.cc-cat{padding:16px 0;border-bottom:1px solid var(--cc-border)}' +
      '.cc-cat:last-child{border-bottom:0}' +
      '.cc-cat-head{display:flex;align-items:center;justify-content:space-between;gap:16px}' +
      '.cc-cat-head h3{margin:0;font-size:1em;font-weight:700}' +
      '.cc-cat > p{margin:6px 0 8px;color:var(--cc-muted);font-size:.9375em}' +
      '.cc-always{font-size:.875em;font-weight:600;color:var(--cc-muted);white-space:nowrap}' +
      '.cc-switch{position:relative;display:inline-flex;align-items:center;cursor:pointer;flex:none}' +
      '.cc-switch input{appearance:none;-webkit-appearance:none;margin:0;width:48px;height:28px;border-radius:999px;background:var(--cc-off);cursor:pointer;position:relative;transition:background .15s}' +
      '.cc-switch input::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .15s}' +
      '.cc-switch input:checked{background:var(--cc-on)}' +
      '.cc-switch input:checked::after{transform:translateX(20px)}' +
      '.cc-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}' +
      '.cc-cat details summary{cursor:pointer;font-size:.9375em;font-weight:600;padding:4px 0;color:var(--cc-text)}' +
      '.cc-svc{margin:8px 0 0;padding:12px 14px;border:1px solid var(--cc-border);border-radius:calc(var(--cc-radius) * .66);font-size:.875em}' +
      '.cc-svc h4{margin:0 0 6px;font-size:1em}' +
      '.cc-svc dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:3px 12px}' +
      '.cc-svc dt{font-weight:600;color:var(--cc-muted)}' +
      '.cc-svc dd{margin:0}' +
      '.cc-panel-foot{padding:14px 22px 18px;border-top:1px solid var(--cc-border)}' +
      '.cc-links{margin:10px 0 0;font-size:.875em;text-align:center;color:var(--cc-muted)}' +
      '.cc-fab{position:fixed;z-index:2147483500;left:16px;bottom:16px;width:48px;height:48px;border-radius:50%;border:1px solid var(--cc-border);' +
        'background:var(--cc-bg);color:var(--cc-text);box-shadow:var(--cc-shadow);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}' +
      '.cc-fab svg{width:24px;height:24px}' +
      '.cc-placeholder{font-family:var(--cc-font);font-size:var(--cc-fs);line-height:1.5;display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:16/9;' +
        'background:#f3f4f6;color:#1f2328;border:1px solid var(--cc-border);border-radius:var(--cc-radius);padding:20px;text-align:center}' +
      '.cc-ph-inner{max-width:460px}' +
      '.cc-ph-inner p{margin:0 0 14px}' +
      '.cc-ph-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center}' +
      '.cc-link-btn{font:inherit;background:none;border:0;padding:8px;color:var(--cc-link);text-decoration:underline;cursor:pointer}' +
      '@media (max-width:560px){.cc-banner{bottom:8px;width:calc(100% - 16px);padding:18px 16px}.cc-actions{flex-direction:column}.cc-actions .cc-btn{width:100%;flex:none}' +
        '.cc-panel{width:100%;max-width:none;height:100%;max-height:none;border-radius:0}}' +
      '@media (prefers-reduced-motion:reduce){.cc-switch input,.cc-switch input::after{transition:none}}' +
      '@media print{#cc-root{display:none}}';
    var st = document.createElement('style');
    st.id = 'cc-style';
    st.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(st);
  }

  var ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>';
  var ICON_COOKIE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3.5-3A3 3 0 0 1 14 5.5 3 3 0 0 1 12 3z"/><circle cx="8.5" cy="10" r="1.2" fill="currentColor"/><circle cx="10" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/></svg>';

  function policyLink(label) {
    return cfg.cookiePolicyUrl ? '<a href="' + esc(cfg.cookiePolicyUrl) + '">' + esc(label) + '</a>' : '';
  }

  function buildRoot() {
    if (ui.root) return;
    ensureStyles();
    ui.root = document.createElement('div');
    ui.root.id = 'cc-root';
    // all'inizio del body: il banner è il primo elemento raggiunto con il tasto Tab
    document.body.insertBefore(ui.root, document.body.firstChild);
  }

  function showBanner() {
    buildRoot();
    if (!ui.banner) {
      var t = cfg.texts;
      var names = services.filter(function (s) { return s.category !== 'necessary'; }).map(function (s) { return esc(s.name); });
      var text = fill(t.bannerText, {
        services: names.join(', '),
        cookiePolicy: policyLink(t.cookiePolicyLink),
        site: esc(cfg.siteName)
      }).replace(/\s*\(\)/, '');
      var b = document.createElement('div');
      b.className = 'cc-banner' + (cfg.position === 'center' ? ' cc-center' : '');
      b.setAttribute('role', 'dialog');
      b.setAttribute('aria-modal', 'false'); // non blocca il sito: niente cookie wall
      b.setAttribute('aria-labelledby', 'cc-banner-title');
      b.setAttribute('aria-describedby', 'cc-banner-text');
      b.innerHTML =
        '<button type="button" class="cc-x" data-cc-action="close" aria-label="' + esc(t.closeBanner) + '" title="' + esc(t.closeBanner) + '">' + ICON_X + '</button>' +
        '<h2 id="cc-banner-title">' + esc(t.bannerTitle) + '</h2>' +
        '<p id="cc-banner-text">' + text + '</p>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn" data-cc-action="reject">' + esc(t.reject) + '</button>' +
          '<button type="button" class="cc-btn" data-cc-action="customize">' + esc(t.customize) + '</button>' +
          '<button type="button" class="cc-btn" data-cc-action="accept">' + esc(t.acceptAll) + '</button>' +
        '</div>';
      b.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('[data-cc-action]') : null;
        if (!btn) return;
        var a = btn.getAttribute('data-cc-action');
        if (a === 'close') rejectAll('close_x');
        else if (a === 'reject') rejectAll('reject');
        else if (a === 'accept') acceptAll();
        else if (a === 'customize') showPanel();
      });
      ui.root.appendChild(b);
      ui.banner = b;
    }
    ui.banner.hidden = false;
    hideFab();
  }

  function hideBanner() {
    if (!ui.banner) return;
    var hadFocus = ui.banner.contains(document.activeElement);
    ui.root.removeChild(ui.banner);
    ui.banner = null;
    if (hadFocus && document.body) { // il focus non deve "perdersi"
      document.body.setAttribute('tabindex', '-1');
      document.body.focus({ preventScroll: true });
      document.body.removeAttribute('tabindex');
    }
  }

  function serviceCard(s) {
    var t = cfg.texts;
    var rows = '';
    if (s.provider) rows += '<dt>' + esc(t.provider) + '</dt><dd>' + esc(s.provider) + '</dd>';
    if (s.purpose) rows += '<dt>' + esc(t.purpose) + '</dt><dd>' + esc(s.purpose) + '</dd>';
    if (s.duration) rows += '<dt>' + esc(t.duration) + '</dt><dd>' + esc(s.duration) + '</dd>';
    if (s.cookies && s.cookies.length) rows += '<dt>' + esc(t.cookies) + '</dt><dd>' + esc(s.cookies.join(', ')) + '</dd>';
    if (s.privacyUrl) rows += '<dt>' + esc(t.privacy) + '</dt><dd><a href="' + esc(s.privacyUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(t.privacy + ' ' + s.name) + '</a></dd>';
    return '<div class="cc-svc"><h4>' + esc(s.name) + '</h4><dl>' + rows + '</dl></div>';
  }

  function showPanel() {
    buildRoot();
    ui.lastFocus = document.activeElement;
    if (ui.banner) ui.banner.hidden = true;
    hidePanel(true);
    var t = cfg.texts;
    var cats = ['necessary'].concat(activeCategories());
    var body = cats.map(function (c) {
      var def = cfg.categories[c];
      var list = services.filter(function (s) { return s.category === c; });
      if (c === 'necessary') list = [selfService(cfg)].concat(list);
      var control = c === 'necessary'
        ? '<span class="cc-always">' + esc(t.alwaysOn) + '</span>'
        : '<label class="cc-switch"><input type="checkbox" role="switch" data-cc-cat="' + c + '"' + (allowed(c) ? ' checked' : '') +
          ' aria-describedby="cc-desc-' + c + '"><span class="cc-sr">' + esc(def.title) + '</span></label>';
      return '<section class="cc-cat" aria-labelledby="cc-cat-' + c + '">' +
        '<div class="cc-cat-head"><h3 id="cc-cat-' + c + '">' + esc(def.title) + '</h3>' + control + '</div>' +
        '<p id="cc-desc-' + c + '">' + esc(def.description) + '</p>' +
        (list.length ? '<details><summary>' + esc(t.servicesLabel) + ' (' + list.length + ')</summary>' + list.map(serviceCard).join('') + '</details>' : '') +
        '</section>';
    }).join('');

    var links = [policyLink(t.cookiePolicyLink)];
    if (cfg.privacyPolicyUrl) links.push('<a href="' + esc(cfg.privacyPolicyUrl) + '">' + esc(t.privacyPolicyLink) + '</a>');

    ui.overlay = document.createElement('div');
    ui.overlay.className = 'cc-overlay';
    ui.panel = document.createElement('div');
    ui.panel.className = 'cc-panel';
    ui.panel.setAttribute('role', 'dialog');
    ui.panel.setAttribute('aria-modal', 'true');
    ui.panel.setAttribute('aria-labelledby', 'cc-panel-title');
    ui.panel.setAttribute('aria-describedby', 'cc-panel-intro');
    ui.panel.innerHTML =
      '<div class="cc-panel-head">' +
        '<button type="button" class="cc-x" data-cc-action="close-panel" aria-label="' + esc(t.close) + '" title="' + esc(t.close) + '">' + ICON_X + '</button>' +
        '<h2 id="cc-panel-title" tabindex="-1">' + esc(t.panelTitle) + '</h2>' +
        '<p id="cc-panel-intro">' + esc(t.panelIntro) + '</p>' +
      '</div>' +
      '<div class="cc-panel-body">' + body + '</div>' +
      '<div class="cc-panel-foot">' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn" data-cc-action="reject-all">' + esc(t.rejectAll) + '</button>' +
          '<button type="button" class="cc-btn" data-cc-action="save">' + esc(t.save) + '</button>' +
          '<button type="button" class="cc-btn" data-cc-action="accept-all">' + esc(t.acceptAll) + '</button>' +
        '</div>' +
        '<p class="cc-links">' + links.filter(Boolean).join(' · ') + '</p>' +
      '</div>';

    ui.panel.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-cc-action]') : null;
      if (!btn) return;
      var a = btn.getAttribute('data-cc-action');
      if (a === 'close-panel') closePanel();
      else if (a === 'reject-all') rejectAll('reject_all');
      else if (a === 'accept-all') acceptAll();
      else if (a === 'save') {
        var c = emptyChoice();
        var boxes = ui.panel.querySelectorAll('[data-cc-cat]');
        for (var i = 0; i < boxes.length; i++) c[boxes[i].getAttribute('data-cc-cat')] = boxes[i].checked;
        // i consensi dati dai singoli contenuti (es. un video) restano solo se la categoria non è stata spenta
        var keep = consent ? consent.services.filter(function (id) {
          var s = serviceOf({ getAttribute: function () { return id; } });
          return s && c[s.category] !== false ? true : false;
        }) : [];
        setConsent({ categories: c, services: keep }, 'save');
      }
    });
    ui.panel.addEventListener('keydown', trapKeys);
    ui.overlay.addEventListener('click', closePanel);
    ui.root.appendChild(ui.overlay);
    ui.root.appendChild(ui.panel);
    document.documentElement.style.overflow = 'hidden';
    ui.panel.querySelector('#cc-panel-title').focus();
  }

  function focusables(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll('button,[href],input:not([disabled]),summary,[tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; }
    );
  }

  function trapKeys(e) {
    if (e.key === 'Escape') { e.preventDefault(); closePanel(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(ui.panel);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !ui.panel.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  // Chiudere il pannello senza salvare non è una scelta: se non c'è ancora consenso torna il banner.
  function closePanel() {
    hidePanel();
    if (!consent) {
      showBanner();
      var btn = ui.banner && ui.banner.querySelector('[data-cc-action="customize"]');
      if (btn) btn.focus();
    }
  }

  function hidePanel(silent) {
    if (!ui.panel) return;
    ui.root.removeChild(ui.panel);
    ui.root.removeChild(ui.overlay);
    ui.panel = ui.overlay = null;
    document.documentElement.style.overflow = '';
    if (!silent && ui.lastFocus && ui.lastFocus.focus && document.contains(ui.lastFocus)) ui.lastFocus.focus();
  }

  function showFab() {
    if (!cfg.floatingButton || ui.fab) return;
    buildRoot();
    ui.fab = document.createElement('button');
    ui.fab.type = 'button';
    ui.fab.className = 'cc-fab';
    ui.fab.setAttribute('aria-label', cfg.texts.floatingButton);
    ui.fab.title = cfg.texts.floatingButton;
    ui.fab.innerHTML = ICON_COOKIE;
    ui.fab.addEventListener('click', showPanel);
    ui.root.appendChild(ui.fab);
  }

  function hideFab() {
    if (ui.fab) { ui.root.removeChild(ui.fab); ui.fab = null; }
  }

  /* =====================================================================
   * 9. AVVIO
   * ===================================================================== */
  function init(userConfig) {
    if (initialized) { warn('già inizializzato'); return api; }
    initialized = true;
    cfg = merge(DEFAULT_CONFIG, userConfig || window.CookieConsentConfig || {});
    services = resolveServices(cfg.services);
    revision = hash(JSON.stringify(services.map(function (s) { return [s.id, s.category]; })));
    consent = readConsent();

    // Subito (prima di qualunque tag Google): default "denied"
    gcmDefault();

    // Link "Preferenze cookie" ovunque nella pagina
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-cc="preferences"],a[href="#preferenze-cookie"]') : null;
      if (!el) return;
      e.preventDefault();
      showPanel();
    });

    function ready() {
      cleanupDenied();  // via i cookie rimasti di servizi non consentiti (revoche, scadenze, versioni precedenti)
      pushDataLayer(); // consenso già salvato: GTM lo riceve a ogni pagina
      scan(document);
      observe();
      if (!consent) {
        if (activeCategories().length) showBanner();
        // nessun servizio facoltativo: nessun banner necessario
      } else {
        showFab();
      }
      dispatch('cookieconsent:ready', consent ? JSON.parse(JSON.stringify(consent)) : null);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
    else ready();
    return api;
  }

  var api = {
    version: '1.1.1',
    presets: PRESETS,
    init: init,
    /** Mostra il banner di primo livello */
    show: function () { showBanner(); },
    /** Apre il pannello delle preferenze (da usare per il link nel footer) */
    showPreferences: function () { showPanel(); },
    acceptAll: function () { acceptAll(); },
    rejectAll: function () { rejectAll('api'); },
    /** true se la categoria ('analytics', 'marketing', ...) è consentita */
    allowed: function (category) { return allowed(category); },
    /** true se il servizio è consentito (per categoria o per consenso singolo) */
    serviceAllowed: function (id) {
      var s = serviceOf({ getAttribute: function () { return id; } });
      return serviceAllowed(id) || !!(s && allowed(s.category));
    },
    grantService: function (id) { grantService(id); },
    /** Copia della scelta salvata (o null) */
    getConsent: function () { return consent ? JSON.parse(JSON.stringify(consent)) : null; },
    /** Registra una funzione chiamata quando cambia il consenso */
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    /** Riesamina la pagina (es. dopo aver inserito HTML a mano in una web app) */
    scan: function (root) { scan(root || document); },
    /** Cancella la scelta e ripropone il banner (utile nei test) */
    reset: function () {
      writeCookie(cfg.storage.name, '', -1, cfg.storage.domain);
      expireCookie(cfg.storage.name);
      location.reload();
    }
  };

  window.CookieConsent = api;

  // Avvio automatico, a meno che lo script abbia l'attributo data-manual
  var me = document.currentScript;
  if (!(me && me.hasAttribute('data-manual'))) init();
})(window, document);
