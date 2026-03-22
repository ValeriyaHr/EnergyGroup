# AGENTS Guide (EnergyGroup)

## Project Layout
- Static multi-page site built with Vite + Handlebars partials.
- UA pages are in project root (`index.html`, `products.html`, `library.html`, ...).
- EN pages mirror structure under `en/` (`en/index.html`, `en/products.html`, ...).
- Reusable partials are in `components/` (UA: `header.html`, EN: `en_header.html`, etc.).

## Build and Dev
- Install deps: `npm install`
- Local dev: `npm run dev`
- Production build: `npm run build`
- Local preview: `npm run preview`

## Templating Conventions
- Pages include partials via `{{> ...}}` (Handlebars syntax).
- Keep UA and EN pages structurally aligned when adding shared features.
- Be careful with relative paths:
  - UA root pages use `./js/...`, `./css/...`
  - EN pages under `en/` use `../js/...`, `../css/...`

## Engineering Request Modal Pattern
- Trigger attribute: `data-eng-request-open`
- Close attribute: `data-eng-request-close`
- Modal root id: `#engReqModal`
- Script: `js/engineering-request-modal.js`
- Style: `css/engineering-request-modal.css`
- Partials:
  - UA modal markup: `components/request_modal.html`
  - EN modal markup: `components/en_request_modal.html`

### Required wiring rule
If a page contains any `data-eng-request-open`, ensure all are present on that page:
1. Modal CSS (`engineering-request-modal.css`)
2. Modal JS (`engineering-request-modal.js`)
3. Modal markup (`{{> request_modal}}` or `{{> en_request_modal}}`, or equivalent inline `#engReqModal`)

## JS Event Handling Rule
- Prefer delegated listeners in JS modules over inline `onclick` in HTML.
- For engineering modal, do **not** use `openModal('engReqModal')`; use `data-eng-request-open`.

## Validation Tip
- After UI wiring changes, run `npm run build` to verify pages compile and assets are emitted.
