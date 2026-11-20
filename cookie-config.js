/* Configurazione del banner cookie OAR per abbicuraditestesso.it
 * È l'unico file da modificare per questo sito. Viene caricato da ogni pagina
 * PRIMA di cookie-consent.js. Documentazione: README di cookie-consent.js.
 */
window.CookieConsentConfig = {
  siteName: 'Abbi Cura di Te Stesso',
  policyVersion: '2026-11-20',              // cambiala quando aggiorni la sezione cookie della privacy
  cookiePolicyUrl: '/privacy/#cookie',
  privacyPolicyUrl: '/privacy/',
  storage: {
    // la scelta vale per tutto il dominio e i sottodomini; sulle anteprime (*.pages.dev) resta sul singolo indirizzo
    domain: /(^|\.)abbicuraditestesso\.it$/.test(location.hostname) ? '.abbicuraditestesso.it' : ''
  },
  services: ['meta-pixel', 'ga4'],
  theme: {
    font: "'Source Sans 3', system-ui, sans-serif",
    background: '#FFFFFF',
    text: '#1B2338',
    muted: '#4A4F5C',
    border: '#C9C3B8',
    buttonBackground: '#1B2338',
    buttonText: '#F4F1EC',
    buttonHover: '#0E1424',
    toggleOn: '#1B2338',
    link: '#B4532F',
    focus: '#B4532F'
  }
};
