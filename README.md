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

## Parametri utili delle landing

- `?a=ferie`, `?a=tavola`, `?a=presa`: sceglie l'immagine d'apertura, da abbinare all'annuncio.
- Il form newsletter invia a Brevo (modulo "Landing Pensa meno – newsletter", doppio opt-in) e, se il pixel Meta è attivo e autorizzato, registra l'evento `Lead`.

## Pubblicazione

Ogni push sul branch `main` viene pubblicato automaticamente da Cloudflare Pages. Le pagine hanno `noindex` finché l'editore non approva i contenuti.
