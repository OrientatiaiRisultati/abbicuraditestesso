/* tracking.js — eventi di conversione di abbicuraditestesso.it
 * Script normale (non bloccato): ogni evento parte SOLO se il visitatore ha dato il consenso
 * al servizio corrispondente nel banner OAR. Nessun dato personale viene inviato.
 *
 * Come si usa:
 *   - clic: aggiungi data-track="acquisto" (o un'altra chiave di EVENTS) a link e pulsanti;
 *   - da codice: oarTrack('lead') — es. dopo l'invio riuscito della newsletter.
 *
 * MODE: 'diretto' = GA4 e Pixel installati nel codice delle pagine (questo sito);
 *       'gtm'     = GA4 e Pixel gestiti in Google Tag Manager: gli eventi vanno nel dataLayer
 *                   come { event: 'oar_acquisto' | 'oar_lead' | 'oar_contatto', ... } e i tag in GTM li usano come attivatori.
 */
(function () {
  'use strict';

  var MODE = 'diretto';

  // chiave usata in data-track  ->  evento Meta Pixel  +  evento GA4
  var EVENTS = {
    acquisto: { meta: ['trackCustom', 'ClicAcquisto'], ga: 'click_acquisto' },   // clic verso il sito dell'editore
    lead:     { meta: ['track', 'Lead'],               ga: 'generate_lead' },    // iscrizione alla newsletter
    contatto: { meta: ['track', 'Contact'],            ga: 'contact' }           // clic sull'email
  };

  function send(key, params) {
    var ev = EVENTS[key];
    if (!ev || !window.CookieConsent) return;
    params = params || {};
    if (MODE === 'gtm') {
      // nessun consenso, nessun evento; in GTM il tag Meta va comunque condizionato a oar_marketing = true
      if (!CookieConsent.allowed('analytics') && !CookieConsent.allowed('marketing')) return;
      var msg = { event: 'oar_' + key };
      for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) msg['oar_' + k] = params[k];
      (window.dataLayer = window.dataLayer || []).push(msg);
      return;
    }
    try {
      if (ev.meta && typeof window.fbq === 'function' && CookieConsent.serviceAllowed('meta-pixel')) {
        window.fbq(ev.meta[0], ev.meta[1], params);
      }
      if (ev.ga && typeof window.gtag === 'function' && CookieConsent.serviceAllowed('ga4')) {
        window.gtag('event', ev.ga, params);
      }
    } catch (e) { /* il tracciamento non deve mai bloccare la pagina */ }
  }
  window.oarTrack = send;

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-track]') : null;
    if (!el || el.tagName === 'FORM') return;
    var p = {};
    if (el.href && /^https?:/.test(el.href)) {
      p.link_url = el.href.split('?')[0];
      try { p.destinazione = new URL(el.href).hostname; } catch (x) { /* ignora */ }
    }
    if (el.href && /^mailto:/.test(el.href)) p.method = 'email';
    var label = el.getAttribute('data-track-label');
    if (label) p.posizione = label;
    send(el.getAttribute('data-track'), p);
  }, true);
})();
