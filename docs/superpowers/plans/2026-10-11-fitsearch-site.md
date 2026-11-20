# FitSearch site: implementation plan (essentials)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (chosen: Native, inline). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the FitSearch one-page site (Etiquetas identity + "Fica ou não fica" provador) exactly as specified.

**Architecture:** Static HTML/CSS/JS with `defer` classic scripts under `window.FS`. Pure logic goes in `js/motor.js` (Node-testable), data in `js/dados.js`, safe storage in `js/armazenamento.js`, and one UI module per area in `js/ui/`. GSAP 3.13.0 (core, Flip, ScrollTrigger) comes from cdnjs.

**Tech Stack:** HTML, CSS (custom properties, container units), vanilla JS (ES2017), GSAP 3.13.0, Google Fonts (Syne, Geist, Geist Mono), Node 24 `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-11-fitsearch-redesign-design.md`

## Global Constraints
- Site copy in pt-BR, informal "você". Code identifiers in Portuguese (as in Saber Sabor).
- Opens from `file://`: no ES modules, no fetch of local files.
- Tokens exactly as in the spec palette; neon `#D7FF3B` is never text on a light background; muted text is `#635F57`.
- Fonts: Syne 800 (titles), Geist (text), Geist Mono (labels). No serif display faces, no Anton.
- User text is rendered with `textContent` only.
- Every localStorage access is wrapped in try/catch; keys are `fitsearch.etiqueta` and `fitsearch.paraQuem`.
- `prefers-reduced-motion`: all motion instant.
- No horizontal page scroll from 375 px up. No git.

## Review Focus
1. A query made only of stop words, spaces or symbols ("look pra", "   ", `<b>`) behaves as an empty query, with no crash and no markup injection. Test: `interpretar` returns no terms; `resultados` equals the no-query result.
2. An audience missing some aesthetic (e.g. masculino with no Romântico look) still gets a full round. The no-repeat repair must terminate even when only one aesthetic remains. Test in `montarRodada`.
3. A saved label naming an unknown aesthetic id, or holding bad percentages, is discarded. Test in `armazenamento`.
4. Double-clicking "Fica", or dragging while a card is flying, counts one choice only. UI guard (`ocupado` flag); verified in the browser.
5. "Desfazer" with no history is disabled, and it never undoes past step 0. UI guard; verified in the browser.

---

### Task 1: Engine (`motor.js`) with tests

**Files:** Create `js/motor.js`, `testes/motor.test.js` (uses a small fixture catalog inside the test file).

**Interfaces (Produces, on `FS.motor` and `module.exports`):**
- `normalizar(t: string) → string`: lowercase, no accents, trailing `s` removed per word, single spaces.
- `interpretar(busca: string, dados) → { termos: string[], dic: [{ termo, tipo: 'estilo'|'ocasiao', id }] }`. Drops stop words and tries 2-word phrases first.
- `compativel(look, paraQuem) → boolean`
- `filtrar(looks, estado) → looks`, where `estado = { busca, estilos: string[], paraQuem, ocasiao }`
- `pontuarBusca(look, interp) → number`: +2 per term in name, pieces or palavras; +3 dic→estilo; +1 dic→estilo2; +2 dic→occasion.
- `porcentagemVoce(look, etiqueta|null) → number`
- `ordemPadrao(looks, idsEstilos) → looks` (round-robin)
- `resultados(dados, estado, etiqueta) → [{ look, pontos, pct }]`
- `sugerir(texto, dados, paraQuem) → [{ tipo, rotulo, valor, total }]` (≤5)
- `sugerirRemocoes(dados, estado, etiqueta) → [{ filtro, rotulo, total }]` (≤2)
- `montarRodada(looks, paraQuem, idsEstilos, aleatorio = Math.random, tamanho = 12) → looks`
- `calcularEtiqueta(pontos, idsEstilos) → { composicao: [{ estilo, pct }], pontos } | null`
- `motivos(look, { etiqueta, interp, ocasiao }, dados) → string[]` (≤3)
- `parecidos(look, looks, paraQuem, max = 4) → looks`
- `linkShopping(peca) → string`

- [ ] **Step 1: Write the failing tests.** Key assertions:
  - `normalizar('Calças Jeans') === 'calca jean'`
  - `interpretar('look pra entrevista').dic` contains `{ tipo: 'ocasiao', id: 'trabalho' }`
  - `interpretar('anos 2000').dic[0].id === 'y2k'`
  - `interpretar('look pra').termos.length === 0`
  - `filtrar` with `paraQuem: 'masculino'` keeps masculino + unissex
  - aesthetics are OR'd; an occasion is required when set
  - `pontuarBusca` returns 2 for a piece match, 3 for estilo, 1 for estilo2, 2 for an occasion
  - `porcentagemVoce` gives 100 for the top aesthetic's main look; Minimal 62 / Dark 28 with a Dark main + Minimal secondary gives `round((28 + 31) / 62 · 100) = 95`; 0 without a label
  - `resultados` with a query omits looks scoring 0
  - `ordemPadrao` alternates aesthetics
  - `sugerir('ca', …)` is ≤5 items, prefix matches first, with counts that respect `paraQuem`
  - `sugerirRemocoes` names the filter that restores the most looks
  - `montarRodada` returns 12 looks, covers every aesthetic available for the audience, has no consecutive same `estilo` when possible, is deterministic with a seeded `aleatorio`, and terminates with a single-aesthetic pool
  - `calcularEtiqueta({ a: 3, b: 1.5, c: 1, d: 0.5 })` returns 3 items whose pct total 100 (largest remainder); ties follow `idsEstilos` order; all zeros gives `null`
  - `motivos` mentions "62% da sua etiqueta"; with no context it falls back to the description
  - `parecidos` excludes self and is ≤4
  - `linkShopping({ nome: 'Sobretudo reto', corNome: 'off-white' })` ends with `q=Sobretudo%20reto%20off-white`
- [ ] **Step 2:** Run `node --test testes/`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `js/motor.js` with the UMD-style footer: `module.exports` in Node, `window.FS.motor` in the browser.
- [ ] **Step 4:** Run `node --test testes/`. Expected: all pass.

### Task 2: Storage (`armazenamento.js`) with tests

**Files:** Create `js/armazenamento.js`, `testes/armazenamento.test.js`.

**Interfaces:** `FS.armazenamento.criar(storage?) → { lerEtiqueta(idsValidos) → etiqueta|null, salvarEtiqueta(etq), apagarEtiqueta(), lerParaQuem() → 'todos'|'feminino'|'masculino', salvarParaQuem(v) }`

- [ ] **Step 1: Failing tests:**
  - round trip
  - corrupted JSON gives `null`
  - an unknown aesthetic id gives `null`
  - pct values not totaling 100 ± 1 give `null`
  - a storage object whose methods throw gives `null`/`'todos'` with no exception
  - an invalid `paraQuem` gives `'todos'`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.

### Task 3: Catalog (`dados.js`) with checks

**Files:** Create `js/dados.js`, `testes/catalogo.test.js`, `testes/fotos.js` (photo HTTP checker; not part of `node --test`).

**Interfaces:** `FS.dados = { estilos[9], ocasioes[6], looks[36], dicionario: { termo: { tipo, id } }, paradas: string[], piadas: string[] }`, with fields exactly as in the spec's data model.

- [ ] **Step 1:** Source Unsplash photos: 4 per aesthetic, with at least 1 feminino and 1 masculino each. Check each candidate visually on a contact sheet.
- [ ] **Step 2: Failing `catalogo.test.js`:**
  - 9 aesthetics with the spec's ids and colors
  - 4 or more looks each, including at least 1 feminino and 1 masculino
  - 3–5 pieces per look, with `preco[0] < preco[1]`
  - every id reference resolves
  - unique look ids
  - every dictionary target exists
- [ ] **Step 3:** Write `dados.js`.
- [ ] **Step 4:** Run `node --test testes/` (PASS) and `node testes/fotos.js` (all 200).

### Task 4: Page shell, tokens, header and footer

**Files:** Create `index.html`, `css/tokens.css`, `css/base.css`, `img/favicon.svg`, `js/ui/util.js`, `js/main.js`.

- [ ] The HTML skeleton has every section from the spec (hero, ribbon, rack, A–Z, how it works, footer), plus the `<dialog id="provador">` and `<dialog id="gaveta">` shells, with a skip link.
- [ ] Tokens are copied from the spec: base type, focus ring, `.visualmente-oculto`, and the label primitives (`.ponto` stitch, `.entalhe` notch, strip variants).
- [ ] `util.js` provides `el(tag, attrs, ...children)` (textContent-safe), `urlFoto(id, w, h)` and `srcsetFoto(id, ratio)`.
- [ ] Verify: open via http preview, no console errors, fonts load, no horizontal scroll at 375 px.

### Task 5: Hero (curtain, search, label)

**Files:** Create `js/ui/cortina.js`, `js/ui/busca.js`, `js/ui/etiqueta.js`, `css/componentes.css`, `css/secoes.css` (hero part).

- [ ] `etiqueta.js`: `FS.etiqueta.render(etq, { titulo, barras, piada }) → HTMLElement`.
- [ ] `cortina.js`: 11 strips with the pointer/touch physics from the approved mockup, the idle sweep, and a pause via IntersectionObserver and `visibilitychange`; it stays still with reduced motion.
- [ ] `busca.js`:
  - an ARIA combobox with suggestions from `motor.sugerir`; arrows, Enter, Esc and `/`
  - applying a suggestion calls `FS.app.aplicar({ tipo, valor })`
  - Enter or "Buscar" scrolls to the rack
- [ ] The hero shows "Sua etiqueta" plus "refazer provador →" and "apagar minha etiqueta" when a label exists, and the main button text switches.
- [ ] Verify in the browser: suggestions, the strips react, the label appears after a stored label is set.

### Task 6: Rack, ribbon, A–Z and how it works

**Files:** Create `js/ui/arara.js`, `js/ui/faixa.js`, `js/ui/estilos.js`; extend `css/secoes.css`.

- [ ] `main.js` owns the state `{ busca, estilos, paraQuem, ocasiao, modoEstilo }` and exposes `FS.app.{ estado, definir(parcial), aplicar(sugestao), etiqueta }`. Every change calls `arara.render()`.
- [ ] `arara.js`:
  - heading text per spec; chips with `aria-pressed`; Para quem; Ocasião
  - cards with the tag and the % badge
  - GSAP Flip reflow with hang-in and shrink-out
  - empty state with `sugerirRemocoes` buttons and a joke
- [ ] `faixa.js`: duplicated track marquee with pause on hover and focus; each item is a button that filters.
- [ ] `estilos.js`: 9 label rows, "N looks →", and ScrollTrigger slide-in.
- [ ] Verify: filters combine, the count updates, the empty state's remove buttons work, the ribbon and A–Z filter and scroll.

### Task 7: Look drawer

**Files:** Create `js/ui/gaveta.js`; drawer styles go in `css/componentes.css`.

- [ ] `FS.gaveta.abrir(look, origemEl)`: photo, chip, name, meta, `motivos`, pieces with "Procurar essa peça ↗" (`linkShopping`, target `_blank`, `rel="noopener noreferrer"`), and `parecidos` (clicking one swaps the content). Esc, ✕ or the backdrop closes it, and focus returns to `origemEl`. It's a bottom sheet under 768 px.
- [ ] Verify: open/close by keyboard, the Shopping URL, swapping to a similar look.

### Task 8: Provador

**Files:** Create `js/ui/provador.js`, `css/provador.css`.

- [ ] `FS.provador.abrir()`:
  - Step 0 asks Para quem, which sets the app's `paraQuem` and saves it.
  - The round comes from `montarRodada`.
  - Each look floods the background with its aesthetic color (Dark uses `corTexto` creme).
  - Giant NÃO/FICA fill with the drag.
  - Drag (40% threshold), the buttons and ←/→ all work; "Desfazer" uses a history stack and is disabled when empty.
  - "Look N de 12" with stitched dashes; the corner label updates live.
  - An `ocupado` guard covers the fly-out.
- [ ] The result uses `calcularEtiqueta`: stitched label with the SVG stitch and count-up, the summary sentence, and "Ver looks do meu estilo" (sets `estilos` to the top 3, `modoEstilo`, clears the query and occasion, closes, scrolls) plus "Refazer provador". With zero "Fica", show the spec copy and a new round.
- [ ] Verify: a full round by drag, keys and buttons; undo; zero "Fica"; the label persists after a reload; badges appear.

### Task 9: Motion and responsive polish

**Files:** Create `js/ui/movimento.js`; adjust CSS.

- [ ] The ≤1.2 s opening (strip drop, headline rise, mark stitch), ScrollTrigger reveals, provador opening (strips fall, then flood), and drawer slide. Everything is gated by `FS.movimento.reduzido`.
- [ ] Breakpoints 375/768/1024/1280:
  - hero stacks
  - rack 2/3/4 columns
  - nav under 600 px shows logo + Provador only
  - provador words above and below the card on mobile
- [ ] Verify at 375 px and 1280 px, with reduced motion emulated.

### Task 10: Final verification
- [ ] `node --test testes/` passes; `node testes/fotos.js` returns all 200.
- [ ] The full browser checklist from the spec's Verification section, keyboard only included, with a clean console.
