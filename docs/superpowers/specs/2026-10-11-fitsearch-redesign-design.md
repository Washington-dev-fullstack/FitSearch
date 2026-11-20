# FitSearch: redesign of VLOM.CUST (spec)

Date: 2026-10-11 · Original stays untouched in `../VLOMCUST/`. Approved mockups are in `../VLOMCUST/.superpowers/brainstorm/521-1791729332/content/`: `hibridos.html` (H3 identity + H2 quiz) and `estrutura.html` (page structure).

## Goal
Turn the old VLOM.CUST streetwear recommender into **FitSearch**: a clothing search engine plus a visual style-discovery quiz for people who feel lost in fashion. It covers many aesthetics and recommends complete looks, for everyone, with an optional gender filter. Success means a beautiful, immersive site with a strong, concept-driven identity (the bar is the Saber Sabor redesign) that helps someone go from "I don't know my style" to "these looks are me" in a few minutes.

The concept: **finding your style is like trying clothes on.** You try styles on in the *provador* (fitting room), say "Fica" (keep) or "Não é pra mim" (not for me), and leave with your style written on a garment **composition label**.

The site stays in Portuguese (pt-BR) and is a static front end only (HTML/CSS/JS + GSAP, no backend).

## Identity (approved: "Etiquetas", H3)
Everything is built from **woven clothing labels**: strips with stitching (dashed inset lines), V-notched ends ("entalhe") and small mono type.

### Palette (tokens)
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--algodao` | `#E9E5DC` | page background (raw cotton) | — |
| `--etiqueta` | `#F8F5EE` | label surfaces, cards, drawer | — |
| `--tinta` | `#141414` | main text, black labels | 14.7:1 on algodão |
| `--tinta-suave` | `#4A4741` | secondary text | 7.4:1 on algodão |
| `--tinta-apagada` | `#635F57` | captions, meta | 5.0:1 on algodão, 5.8:1 on etiqueta |
| `--linho` | `#BDB6A8` | strip variant (ink text only) | ink 9.1:1 |
| `--creme` | `#EDE9E0` | text on black labels | 15.2:1 on tinta |
| `--neon` | `#D7FF3B` | the one accent | ink on neon 16:1 · neon on ink 16:1 |

Rule: neon is **never text on a light background**. It's used as a background with ink text, or as text on ink. One accent per surface.

### Typography
- **Syne 800** for titles (tight tracking, -0.035em to -0.045em).
- **Geist** for body text.
- **Geist Mono**, uppercase and tracked, on labels, chips, meta and buttons.
- **Banned:** serif display faces (Fraunces, Playfair, Bodoni, Instrument Serif and similar), Anton (the old site's font), and Inter, Montserrat or Poppins as titles.

### Logo and favicon
A small black woven label with a V-notch, stitching and a neon "?", next to "fitsearch" in Syne 800 lowercase. The favicon is the label with the "?" alone (SVG).

### Signature devices
- Label strips in 4 variants: black, cream, linho, neon.
- Stitching: dashed inset outline.
- V-notched ends on chips and tags.
- Highlighted words set as neon labels (e.g. "<mark>o seu.</mark>").
- Care-instruction jokes as the recurring voice (see Voice).

### Photos
Unsplash, linked from their CDN (not downloaded). Natural, uncropped full looks; credit "fotos: Unsplash" in the footer.

## Structure (approved)
One long page (approach A), plus two layers that open over it.

1. **Top bar**
   - Label logo and the links Buscar · Provador · Estilos.
   - Under 600 px: logo and a "Provador" button only.
2. **Hero**
   - Copy: kicker "Provador de estilos", headline "Experimente estilos até achar <mark>o seu.</mark>", a short sub line.
   - **Stitched search bar** with suggestions.
   - Main button: "Entrar no provador".
   - On the right, the **label-strip curtain** (11 strips) hanging from a rail, with a look photo behind it.
   - After the quiz, the **"Sua etiqueta"** label appears overlapping the curtain, with "refazer provador →" and "apagar minha etiqueta". The main button then becomes "Ver looks do meu estilo".
3. **Label ribbon**: a black woven ribbon, tilted about -1.6°, scrolling the aesthetics. Tapping one filters the rack.
4. **The rack (results)**
   - Heading: kicker "A arara", then a title with the count.
   - "Para quem" segmented control: Todos · Feminino · Masculino.
   - Aesthetic chips (woven labels, multi-select, "Todos os estilos" first).
   - Ocasião pills.
   - Grid of look cards: photo, hanging aesthetic tag, name, pieces in mono. The "% você" badge appears only when a label exists.
5. **Estilos de A a Z**
   - Title "Aprenda a língua da moda".
   - The 9 aesthetics as wide woven labels: name, three-word description, key pieces, "N looks →".
   - A label stretches open on hover. The link filters the rack.
6. **Como funciona**: three steps stitched into **one** long label (not three identical cards).
   - 01 "Busque ou entre no provador"
   - 02 "Diga se fica ou não fica"
   - 03 "Leve sua etiqueta"
7. **Footer**
   - Dark, with the slogan "Moda não vem com manual. Seu estilo vem com <mark>etiqueta.</mark>"
   - Logo, the three links, "© 2026 FitSearch · fotos: Unsplash".
   - No dead links.

Layers:
- **A · Provador**: a full-screen takeover (see rules).
- **B · Provador result**: shown inside the takeover.
- **C · Look drawer**: from the right on desktop, a bottom sheet on mobile.

## Content (approved)
### Aesthetics (9)
| id | Name | Three words | Key pieces | Quiz flood | Flood text |
|---|---|---|---|---|---|
| `minimal` | Minimal | poucas peças, cortes limpos | camisa, alfaiataria, tênis branco | `#E4DCCB` | tinta |
| `old-money` | Old Money | clássico, discreto, tecidos nobres | blazer, tricô, mocassim | `#BFD8B0` | tinta |
| `streetwear` | Streetwear | largo, urbano, gráfico | moletom, cargo, tênis | `#FF9A57` | tinta |
| `y2k` | Y2K | anos 2000, brilho, ousado | cropped, baby tee, conjunto | `#FF8AC0` | tinta |
| `boho` | Boho | livre, terroso, fluido | bata, saia midi, sandália | `#E9A67A` | tinta |
| `dark` | Dark | preto, couro, silhueta marcada | jaqueta, coturno, camadas | `#3A3735` | creme (10.9:1) |
| `romantico` | Romântico | delicado, floral, babados | vestido, blusa de babado, laço | `#C9B8FF` | tinta |
| `preppy` | Preppy | colegial, xadrez, arrumado | cardigã, camisa polo, saia plissada | `#A9D4FF` | tinta |
| `vintage` | Vintage | retrô, anos 70 a 90, garimpo | jaqueta de couro, poá, jeans | `#F2C14E` | tinta |

Each flood with ink text is at least 8.4:1. Every aesthetic also has a 1–2 sentence description, one "por onde começar" tip, and search synonyms.

### Catalog
- **36 looks, 4 per aesthetic.**
- Each aesthetic has at least 1 `feminino` and 1 `masculino` look; `unissex` looks appear for everyone.
- Every photo is checked (HTTP 200 and that the content actually fits the aesthetic) before it goes in.

### Data model (`js/dados.js`)
```js
estilo = { id, nome, curta, descricao, comecar, pecasChave: [], cor, corTexto, sinonimos: [] }
look = {
  id, nome, foto /* Unsplash photo id */, alt,
  estilo, estilo2 /* id or null */, para /* 'feminino' | 'masculino' | 'unissex' */,
  ocasioes: [], palavras: [],
  pecas: [{ nome, categoria, cor /* hex */, corNome, preco: [min, max] /* R$, estimate */ }] // 3 to 5
}
ocasiao = { id, nome, sinonimos: [] }
```
- **Occasions:**
  - `dia-a-dia` Dia a dia
  - `trabalho` Trabalho
  - `faculdade` Faculdade
  - `festa` Festa
  - `encontro` Encontro
  - `viagem` Viagem
- **Dictionary:** maps everyday words to an aesthetic or occasion. Examples:
  - entrevista, escritório → trabalho
  - balada, show → festa
  - date, jantar → encontro
  - aula → faculdade
  - praia, férias → viagem
  - anos 2000 → y2k
  - elegante, clássico, quiet luxury → old-money
  - gótico, preto → dark
  - hippie → boho
  - anos 70/80/90, retrô → vintage
  - delicado, floral → romantico
  - colegial, xadrez → preppy
  - básico, clean → minimal
  - largo, skate → streetwear
- **Stop words:** pra, para, de, do, da, um, uma, look, roupa, com, e, o, a.
- **Prices** are labeled "faixa estimada". FitSearch doesn't sell anything.

### "Procurar essa peça"
Each piece in the drawer links to `https://www.google.com/search?tbm=shop&q=` + `encodeURIComponent(nome + ' ' + corNome)`. It opens in a new tab with `rel="noopener noreferrer"` and is marked with ↗.

### Voice
- Informal Portuguese, using "você".
- Care-instruction jokes on labels, strips and empty states: "lavar à mão · não seguir tendências", "usar sem moderação", "secar à sombra de quem duvida", "não passar · só vestir".

## Interaction rules (approved)
### Rack: search and filters
- **State:** `{ busca, estilos: Set, paraQuem, ocasiao }`. Everything responds instantly; there is no submit. Enter or "Buscar" scrolls to the rack.
- **Hard filters:**
  - aesthetic: OR among the selected aesthetics; empty means all
  - `paraQuem`: `feminino` shows feminino + unissex, `masculino` shows masculino + unissex, `todos` shows all
  - `ocasiao`: single select; the look must include it
- **Text search (scored):**
  - Normalize: lowercase, strip accents, strip a trailing "s" for plurals. Dictionary keys, synonyms, look names, pieces and `palavras` all go through the same `normalizar` function, so both sides always match (e.g. "jeans" becomes "jean" everywhere).
  - Tokenize, drop stop words, and also try 2-word phrases against the dictionary.
  - Score per look:
    - +2 for each token found in the name, pieces or `palavras`
    - +3 when a dictionary term maps to the look's `estilo` (+1 for `estilo2`)
    - +2 when a dictionary term maps to one of its occasions
  - With a query, only looks with score > 0 are shown, sorted by score.
- **Order:**
  - With a query: score, then % você (if a label exists), then default order.
  - Without a query and with a label: % você.
  - Otherwise: default order, round-robin by aesthetic in catalog order, so the rack always shows variety.
- **% você:** `min(100, round((pct[estilo] + 0.5 · pct[estilo2]) / pct[top] · 100))`, where `pct` is the saved label and `top` is its largest share. The badge is hidden when the value is 0.
- **Suggestions**
  - Shown from 2 characters, up to 5 items.
  - Sources, in this type order: aesthetics (name + synonyms), occasions, unique piece names, look names.
  - Prefix matches come before substring matches.
  - Each item shows its type and look count (respecting `paraQuem`).
  - Arrows move, Enter applies, Esc closes, and `/` focuses the search from anywhere.
  - Applying a suggestion:
    - aesthetic → selects that chip and clears the query
    - occasion → sets the occasion
    - piece → becomes the query
    - look → opens its drawer
- **Heading text:**
  - "N looks na arara" (no query, no label filter)
  - "N looks para "‹busca›""
  - "N looks do seu estilo" (after "Ver looks do meu estilo")
- **Empty state:** "Nada na arara com esses filtros", a care joke, and up to 2 buttons that remove the filter that would bring back the most looks: "Tirar ‹filtro› (traz N looks)". Candidates: the query, the aesthetic group, the occasion, Para quem.
- Ribbon and A-to-Z links set `estilos = {that one}`, clear the query and scroll to the rack.

### Provador (quiz)
- **Opens from:** the hero button, the "Provador" nav link, or "refazer" on the label.
- It's a full-screen `<dialog>`: the page behind doesn't scroll, focus stays inside, and Esc or "✕ Sair" closes it (progress is discarded).
- **Step 0:** "Para quem são os looks?" with Todos · Feminino · Masculino. The answer also sets the rack's `paraQuem`.
- **Round of 12 looks** from the audience-filtered catalog:
  - One random look per aesthetic (by main `estilo`) where available.
  - Filled with random others up to 12, with no duplicates.
  - Shuffled, then repaired so no two consecutive looks share a main aesthetic.
  - If fewer than 12 looks are available, use them all.
  - The random source is injectable for tests.
- **No aesthetic names** are shown during the round. The background floods with each look's aesthetic color.
- **Controls:**
  - drag the card left or right (past 40% of the card width it counts)
  - the buttons "← Não é pra mim" and "Fica →"
  - the ← → keys
  - "← Desfazer" reverses the last choice
  - Progress shows "Look N de 12" with stitched dashes.
- **Scoring:** Fica adds +1 to `estilo` and +0.5 to `estilo2`; Não adds 0. The corner label updates live.
- **Result:**
  - Aesthetics with points > 0, sorted by points (ties broken by catalog order of aesthetics), keeping the top 3.
  - Percentages are renormalized over those 3 and rounded by largest remainder so they total 100. One or two aesthetics are fine.
  - With zero "Fica": "Nada ficou? Normal, estilo leva tempo." plus "Tentar com outros looks", which starts a new round.
- **Result screen:**
  - The label stitches itself on; title "Seu estilo tem etiqueta."; a sentence such as "Você é principalmente Minimal, com um pé no Dark e um toque de Street."
  - Buttons "Ver looks do meu estilo" and "Refazer provador".
  - "Ver looks do meu estilo" closes the takeover, sets `estilos` to the top 3, clears the query and occasion, sorts by % você and scrolls to the rack.

### Look drawer
- Opens from a card. Esc, ✕ or a backdrop click closes it, and focus returns to the card.
- **Contents:**
  - photo
  - aesthetic chip, name, and meta (occasions · para)
  - **"Por que combina com você"**: up to 3 sentences, from the label ("Minimal é 62% da sua etiqueta"), the query ("Você buscou "cargo" e o look tem calça cargo"; "…que tem tudo a ver com Y2K") and the occasion filter. With none of those, it falls back to the aesthetic's description.
  - **"Peças do look"**: color dot, name, price range, and "Procurar essa peça ↗"
  - **"Looks parecidos"**: up to 4, same main aesthetic first, then shared secondary, compatible with `paraQuem`, excluding itself. Clicking one swaps the drawer's content.

### Memory (localStorage, all access wrapped in try/catch)
- `fitsearch.etiqueta` → `{ versao: 1, composicao: [{ estilo, pct }], pontos: {}, data }`
- `fitsearch.paraQuem` → `'todos' | 'feminino' | 'masculino'`
- Searches and other filters are not saved.
- "Apagar minha etiqueta" removes the label and its badges.
- Corrupted or unavailable storage means the site behaves as a first visit.

### Accessibility
- All actions are keyboard reachable, with visible focus (an ink or neon outline).
- The rack heading is `aria-live="polite"`.
- The search is a combobox with a listbox.
- Chips are toggle buttons with `aria-pressed`.
- The provador and drawer are `<dialog>`s with labels.
- Vertical strip text is decorative (`aria-hidden`) and never carries information.
- Card images have descriptive `alt` text.
- Tap targets are at least 44 px on mobile.

## Motion (approved, GSAP 3.13.0: core + Flip + ScrollTrigger)
- **Opening (≤ 1.2 s, no fake loading screen):** strips drop from the rail with a stagger and a small bounce; headline lines rise; the "o seu." mark draws in from the left and its stitching appears.
- **Hero curtain:**
  - On each `requestAnimationFrame`, each strip rotates and shifts away from the pointer with Gaussian falloff (max about 17°).
  - When idle, a slow "invisible hand" sweeps across.
  - On touch, the strips follow the finger.
  - The loop pauses when the hero is off screen (IntersectionObserver) or the tab is hidden.
- **Ribbon:** an infinite marquee that pauses on hover or focus.
- **Rack:**
  - Flip on every result change (about 0.5 s).
  - Entering cards swing in from the top, as if hung (rotate from -6°, origin top); leaving cards shrink and fade.
  - Hover lifts the card and swings its tag.
- **ScrollTrigger (once):** A-to-Z labels slide in from the side with a stagger; the "how it works" label unrolls.
- **Provador:**
  - Opens with strips falling over the viewport, then the color flood.
  - Cards follow the drag with rotation (dx/16 degrees) and fly out on release.
  - The background color transitions over 0.6 s; the giant outlined "NÃO" or "FICA" fills in proportion to the drag.
  - Label bars grow.
  - The result label gets an SVG stitch drawn around it (stroke-dashoffset) and its percentages count up.
- **Drawer:** slides in over 0.45 s; the backdrop fades.
- **`prefers-reduced-motion`:** everything is instant. No sway, no marquee, no Flip; the color changes without a transition.

## Architecture
```
fitsearch/
  index.html
  css/   tokens.css · base.css · componentes.css · secoes.css · provador.css
  js/    dados.js · motor.js · armazenamento.js · main.js
  js/ui/ util.js · movimento.js · cortina.js · busca.js · arara.js · faixa.js
         estilos.js · gaveta.js · provador.js · etiqueta.js
  img/   favicon.svg
  testes/ motor.test.js · armazenamento.test.js · catalogo.test.js
  docs/superpowers/specs/2026-10-11-fitsearch-redesign-design.md
```
- **Loading:** classic scripts with `defer` and a `window.FS` namespace, so the site works from `file://`. GSAP 3.13.0 comes from cdnjs. Google Fonts loads Syne, Geist and Geist Mono.
- **`motor.js` is pure functions only, exportable to Node:**
  - `normalizar`, `filtrar`, `pontuarBusca`, `ordenar`, `porcentagemVoce`, `sugerir`, `sugerirRemocoes`
  - `montarRodada`, `calcularEtiqueta`, `motivos`, `parecidos`, `linkShopping`
- **`armazenamento.js`** loads and saves the label and `paraQuem` safely.
- **`etiqueta.js`** renders the composition label everywhere it appears (hero, provador corner, result).
- **User text** (the search query) is only ever rendered with `textContent` or `createElement`, never as HTML.
- **Images:** `https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w={w}&h={h}&q=70`, with `srcset` at 400w/800w, `loading="lazy"` below the fold, and explicit `width` and `height`.
- **Responsive (mobile-first: 375 → 768 → 1024 → 1280+):**
  - The hero stacks: text first, then a shorter curtain.
  - The rack is 2 columns on mobile, 3 on tablet and 4 on desktop.
  - The drawer becomes a bottom sheet on mobile.
  - In the provador on mobile, "NÃO" and "FICA" sit above and below the card.
  - There is never horizontal page scroll.
- **No git** (following the Saber Sabor precedent).

## Verification
- **`node --test testes/`:**
  - `motor`: normalization and plurals, the dictionary and 2-word phrases, hard filters, scoring and order, % você, suggestions (types, order, counts), removal suggestions, the round (aesthetic coverage, no consecutive repeats, audience filter, small catalogs), the label (largest-remainder total of 100, ties, 1–2 aesthetics, zero "Fica"), reasons, similar looks, and Shopping link encoding.
  - `armazenamento`: save, load and clear; corrupted JSON; a storage object that throws.
  - `catalogo`: 9 aesthetics; 4 or more looks each; at least 1 feminino and 1 masculino per aesthetic; 3–5 pieces per look; every `estilo`, `estilo2` and occasion id exists; valid price ranges.
- **Photo check script:** every catalog photo URL returns HTTP 200.
- **In the browser:**
  - The console has no errors.
  - Search → suggestions → rack → drawer → Shopping link.
  - Ribbon and A-to-Z filtering; the empty state and its removal buttons.
  - A full provador round by drag, keys and buttons, including undo and zero "Fica".
  - Result → rack filtered and sorted; the label persists after a reload; "apagar" removes it.
  - Pass at 375 px, with reduced motion, and keyboard only.
  - No horizontal scroll; images load.

## Out of scope
No backend, accounts or server storage. No real products, stores or checkout (only the Google Shopping search link). No shareable URLs or hash routing. No gyroscope or device-motion effects. No dark-mode variant: the identity is light, and the dark surfaces are part of it. No git.
