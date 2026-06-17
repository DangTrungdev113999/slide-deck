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
