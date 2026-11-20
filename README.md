# abbicuraditestesso.it

Sito statico di **Abbi Cura di Te Stesso**, pubblicato con Cloudflare Pages.

## Struttura

| Percorso | Contenuto |
|---|---|
| `/` | Home (provvisoria) |
| `/privacy/` | Privacy policy |
| `/pensa-meno/` | Landing "Pensa meno. Vivi di più." → reindirizza a `/pensa-meno/v1/` mantenendo i parametri |
| `/pensa-meno/v1/`, `/v2/`, `/v3/` | Tre versioni della landing (palette corallo, salvia, prugna) |
| `/pensa-meno/img/` | Immagini della landing (creatività, copertina, screenshot dei commenti) |
| `_redirects` | Reindirizzi dei vecchi percorsi |
| `cookie-config.js` | Configurazione del banner cookie (servizi, link alle policy, colori) |
| `cookie-consent.js` | Banner cookie OAR (componente: non modificarlo per questo sito) |
| `tracking.js` | Eventi di conversione (ClicAcquisto, Lead, Contact), solo con consenso |

## Parametri utili delle landing

- `?a=ferie`, `?a=tavola`, `?a=presa`: sceglie l'immagine d'apertura, da abbinare all'annuncio.
- Il form newsletter invia a Brevo (modulo "Landing Pensa meno – newsletter", doppio opt-in) e, se il pixel Meta è attivo e autorizzato, registra l'evento `Lead`.

## Cookie, GA4 e Meta Pixel

- Ogni pagina carica `cookie-config.js` e `cookie-consent.js` nel `<head>`, **prima** dei tag di tracciamento.
- GA4 e Meta Pixel sono nel `<head>` di ogni pagina come `type="text/plain"`: partono solo dopo il consenso (Statistica / Marketing).
- **Gli ID sono fittizi** finché non abbiamo quelli veri: sostituire `G-DEMO123456` (2 volte per pagina) e `000000000000000` in tutte le pagine (`index.html`, `privacy/`, `pensa-meno/v1-v3/`).
- Eventi (`tracking.js`): clic sui link all'editore → Meta `ClicAcquisto` + GA4 `click_acquisto` (con `posizione`); iscrizione newsletter → `Lead` + `generate_lead`; clic sull'email → `Contact` + `contact`.
- Se cambiano i servizi: aggiornare `services` e `policyVersion` in `cookie-config.js` e la sezione 9 della privacy.

## Pubblicazione

Ogni push sul branch `main` viene pubblicato automaticamente da Cloudflare Pages. Le pagine hanno `noindex` finché l'editore non approva i contenuti.
