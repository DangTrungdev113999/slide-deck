# Design Language — slide deck "Dùng AI để code frontend"

Read this BEFORE building any slide. The canonical reference implementations are:
`src/slides/Slide14.tsx`, `src/graphics/PipelineFlow.tsx`, `src/components/Atmosphere.tsx`,
`src/components/SlideFrame.tsx`. Match their quality. This is a frontend-design-grade deck —
NOT generic boxes. If a slide looks like a default Bootstrap layout, it's wrong.

## Canvas
- Fixed **1920×1080**. Everything is authored in px at that scale (Stage scales to fit).
- Slides are `React.FC<{active:boolean}>`. Build the slide body inside `<SlideFrame index kicker active>`.
- The hero (#14) is bespoke (doesn't use SlideFrame) — use it as the visual bar, not as the API.

## Tokens (src/styles/tokens.css) — use the CSS vars, never raw hex
`--bg #fff · --surface #f5f5f7 · --ink #1d1d1f · --ink-soft #3a3a3e · --muted #6e6e73`
`--accent #0071e3 · --accent-700 #0058b0 · --danger #ff3b30 · --line #d2d2d7 · --line-soft #e6e6ea`
Shadows: `--shadow-sm/-md/-lg`, `--glow-accent`. Radius `--radius` (18) or 20–24 for cards.

## Typography (BIG — the #1 past mistake was tiny text)
- Display font = Inter (`var(--font-display)`), body = Be Vietnam Pro (`var(--font-body)`, full VN diacritics).
- Use the `TYPE` presets exported from SlideFrame: `TYPE.eyebrow` (22px), `TYPE.h1` (104px), `TYPE.h2` (72px), `TYPE.lead` (26px).
- Headline per slide ≥ 72px. Body/lead ≥ 24px. List items ≥ 22px. Card titles ≥ 22px. Nothing below ~15px.
- `tabular-nums` for any animated number. Accent color for the ONE focal word per headline.

## Layout
- Top bar comes from SlideFrame (kicker + NN/17). Then your body fills the rest.
- ONE focal point per slide. Asymmetry > dead-center. Use the lower ~55% for the motion-graphic, upper for headline.
- Generous but intentional whitespace — never leave a huge empty band with a tiny element floating in it.

## Motion — every slide MUST have a real, looping motion-graphic (not just the entrance reveal)
The entrance reveal (data-reveal stagger) is free via SlideFrame. ON TOP of that, each slide gets a
bespoke graphic with a SUSTAIN loop so the slide stays alive. Pattern (copy from PipelineFlow):
```
useEffect(() => {
  if (!active || !ref.current) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = gsap.context((self) => {
    if (reduced) { /* set everything to final visible state */ return; }
    // intro tl (draw-on / pop), then .add(() => { ...repeat:-1 loops... })
  }, ref);
  return () => ctx.revert();   // <-- StrictMode-safe, REQUIRED
}, [active]);
```
- ALWAYS `gsap.context(... , ref)` + `ctx.revert()` cleanup. Never bare `gsap.from()` (freezes at opacity 0 under StrictMode).
- Reduced-motion branch must leave everything VISIBLE.

### Motion vocabulary (pick the metaphor that fits the slide's meaning)
- number / % / growth → **count-up** (animate value 0→target, snap) + a bar/ring filling.
- N items / steps → **land-in stagger** + a traveling highlight that visits each.
- comparison / vs → two sides enter from opposite edges, a divider draws between.
- pipeline / flow / journey → a **comet runs a gradient rail**, nodes glow as it passes (see PipelineFlow).
- map / system → nodes pop, connectors draw, a pulse radiates from center.
- speed → a **bar race** (one bar shoots ahead).
- ranking → rows stack, the winner row flips to accent.
- Always add a subtle sustain: breathe (±0.6% scale), drifting glow, a looping pulse on the focal element.

### SVG draw-on
`stroke-dasharray = len; stroke-dashoffset = len → 0`. Get len via `el.getTotalLength()`. Gradient strokes for accent lines.

## Cards (when used)
`background: linear-gradient(180deg,#fff,#f7f8fb); border:1px solid var(--line); border-radius:22; box-shadow:var(--shadow-md); padding:24px`. Number badge = filled accent rounded square, offset top-left. Title 22–24px/800, sub 16px/muted.

## Graphics
- Hand-built SVG / DOM. **No AI-generated images, no emoji as the main graphic** (small glyph accents OK).
- Use the Atmosphere component is already in SlideFrame — don't add a second background.

## Do NOT
- tiny text · centered-everything · flat white with no depth · static diagrams with no loop ·
  bare gsap.from · raw hex · em-dashes in UI copy · more than one focal point.

---

# REDESIGN SPEC v2 (2026-06-18) — HARD CONSTRAINTS

This section governs the full restyle. Every per-slide agent MUST execute **within** this
locked system. You still invoke `/frontend-design:frontend-design` for craft, but you do NOT
introduce a new font, a new color outside tokens, or a different aesthetic per slide. The deck
is ONE cohesive Clean Light Keynote. Cohesion beats novelty here.

## Type minimums (NON-NEGOTIABLE — "chữ nhỏ" was rejected twice)
- h1 ≥ **104px**, h2 ≥ **72px**, lead ≥ **26px**, body/paragraph ≥ **24px**.
- Any text inside a graphic (labels, captions, numbers) ≥ **20px**.
- Diagram node labels ≥ **22px** / weight 700. Tooltip body ≥ **20px**.
- **Nothing below 18px anywhere.** The old 15–17px copy is banned.
- Tool/brand names that ARE the content (Cursor, Codex, Claude Code) → ≥ **30px**, weight 800.

## No dead space
- Never a large empty band with a small element floating. The motion-graphic must occupy the
  lower 50–62% edge-to-edge (or fill the focal zone). If a slide feels empty, the graphic is too
  small or too sparse — add beats/elements, don't add whitespace.

## Node-type legend — SHARED by all 3 workflow diagrams (slide 13/14/15)
Encode node identity IDENTICALLY everywhere. This is the fix for "không phân biệt skill vs agent".
Exported as constants from `src/graphics/WorkflowDiagram.tsx`:

| type | shape | fill / border | accent | icon glyph |
|------|-------|---------------|--------|-----------|
| `agent`  | rounded-rect, solid | accent fill `#0071e3`, white text | white | ◳ parallel/robot mark |
| `skill`  | rounded-rect, outline | white fill, `--accent` 2px border, accent text | accent | `/` command slash |
| `gate`   | diamond / chamfer | amber `#b8860b`-tone on white, amber border | amber | ✓ check |
| `manual` | rounded-rect, dashed border | `--surface` fill, `--ink` text, `--line` dashed | muted | ✋ hand / person |
| `output` | pill | `--ink` fill, white text | white | ★ |

- A **parallel fan-out** (e.g. 3× tv-analyst) renders as N stacked agent nodes sharing one
  in-edge and one out-edge, with a small "×N · song song" tag.
- A **gate retry-loop** renders a curved back-edge labeled "retry ≤N".
- Legend chip row (small) shown once per diagram slide so the audience can decode colors.

## Diagram interaction (slide 13/14/15)
- **Auto-cycle:** on `active`, highlight nodes in flow order, ~1.1s each, showing that node's
  task in a caption/tooltip. Loops. This is what the audience sees without touching anything.
- **Hover:** hovering a node shows its tooltip AND **pauses** auto-cycle; mouse-leave resumes.
  Hover wins over auto-cycle.
- StrictMode-safe (`gsap.context` + `ctx.revert`); reduced-motion → all nodes visible, no cycle.

## Per-slide brief (concept · fill · motion)
1. **host** — drop kicker "MỞ MÀN". Graphic: terminal typing a prompt → bursts into a wireframe
   UI being assembled block-by-block (more beats, richer). Fills lower-right generously.
2. **poll** — drop lead "Vote nhanh…". 5 tool cards WITH brand-accurate inline-SVG logos
   (Claude, Cursor, Codex/OpenAI, Gemini, Antigravity); tool name ≥30px. Spotlight sweep + a
   live bar/tally feel. Cards bigger, centered band filled.
3. **journey** — Cursor→Claude timeline, evolution feel; rail draws, milestones pop, $1.000 count-up, comet sustain.
4. **cursor-vs-claude (MERGED 4+5)** — left/right vs comparison TOP, and the "1 prompt vs 2–3
   prompt" **bar race** integrated BELOW or beside. Big text, NOT cramped. One coherent layout.
5. **antigravity** — keep terminal-driving-browser UI; sequence: running… running… → **crash/tèo**
   (red glitch) → reset loop; 6/10 stability ring count-up.
6. **non-linear** — make the meaning legible: exponential curve vs dashed linear, clear axis hints
   + milestone labels, comet rides the exp curve. Annotate so a viewer instantly gets "không tuyến tính".
7. **harness** — radial: Agent center + 9 readable spokes (context/token/memory/skill/hook/
   subagent/command/plugin/MCP), labels ≥22px, glow orbit sustain. Cleaner, prettier, legible.
8. **skill-hook** — restyle for cohesion; bigger text, fill space, real loop.
9. **subagent-plugin** — restyle for cohesion; parallel lanes + bundle, bigger text.
10. **context** — restyle; context bar 200K healthy/rot, token count-up, bigger labels.
11. **frontend-split** — restyle; UI/UX vs Logic split, bigger labels, real loop.
12. **freestyle-vs-ds** — restyle; blobs vs token-grid, bigger text.
13. **pipeline (design→UI)** — WorkflowDiagram. Nodes: select-component → mapping-combase →
    build-com → GATE review → OUTPUT. Output panel = a Figma frame and the rendered UI side-by-side
    looking identical ("same same"). Hover tooltips + auto-cycle.
14. **demo ai-chart** — WorkflowDiagram of `/ai-chart:clone-drawing-tool` (see plan: fan-out 3×
    tv-analyst at BRD, 3× ai-chart-architect at TAD, gates QG1/2/3, tv-verifier loop).
15. **demo gen-video** — WorkflowDiagram of `/gen-video-tai-chinh` (N× scene-coder parallel,
    determinism gate, self-review gate loop, telegram-publisher). Ends "Cảm ơn · Q&A".
