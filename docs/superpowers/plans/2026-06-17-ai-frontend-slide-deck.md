# AI-Frontend Slide Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, browser-based slide deck (17 slides) for the internal talk "Dùng AI để code frontend", with arrow-key navigation and smooth GSAP reveal animations.

**Architecture:** React + Vite SPA. A fixed 1920×1080 canvas (`Stage`) is `transform: scale()`-fit to the viewport (NOT mobile-first reflow). Each slide is its own component registered in a deck registry; a `useDeck` hook owns navigation (keyboard/swipe/hash/fullscreen). Animations use GSAP timelines that run once on slide-enter (stagger reveal, then sustain).

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, GSAP. Self-hosted fonts (Inter + Be Vietnam Pro).

## Global Constraints

- Canvas is fixed **1920×1080**; scale-to-fit + letterbox. No responsive reflow / no breakpoints.
- One arrow press = next **slide**. No within-slide click builds.
- **All UI/graphics authored via the `frontend-design` skill.** Graphics are hand-built SVG — no AI-generated images.
- Fonts **self-hosted** in `public/fonts/` (woff2). No Google Fonts CDN. Must render offline.
- Design tokens (verbatim): `--bg #ffffff` `--surface #f5f5f7` `--ink #1d1d1f` `--muted #6e6e73` `--accent #0071e3` `--danger #ff3b30` `--line #d2d2d7` `--radius 18px`.
- Fonts: display **Inter** (900/800, ls -0.03em), body **Be Vietnam Pro**. Counters use `tabular-nums`.
- Content language: Vietnamese. Respect `prefers-reduced-motion`.
- Re-verify any version number / price on a slide at build time (they churn weekly).

---

## PHASE 1 — Proof-of-look (scaffold + shell + HERO slide #14)

Goal of phase: a running deck with the design system, full navigation plumbing, self-hosted fonts, and the single hero slide (#14, the design-to-UI pipeline) fully animated. Stop here for a "đúng feel?" gate before building the other 16 slides.

### Task 1: Scaffold Vite + Tailwind + GSAP + tokens

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/styles/index.css`

**Interfaces:**
- Produces: a dev server (`npm run dev`) rendering a placeholder; `npm run build` emits `dist/`.

- [ ] **Step 1: Create the project with Vite React-TS template**

Run: `cd ~/Desktop/slide-deck && npm create vite@latest . -- --template react-ts` (accept overwrite into current dir; keep existing `docs/`, `.git`, `.gitignore`).

- [ ] **Step 2: Install deps**

Run: `npm install && npm install gsap && npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`

- [ ] **Step 3: Write `src/styles/tokens.css`**

```css
:root{
  --bg:#ffffff; --surface:#f5f5f7; --ink:#1d1d1f; --muted:#6e6e73;
  --accent:#0071e3; --accent-soft:#0071e312; --danger:#ff3b30;
  --line:#d2d2d7; --radius:18px;
}
```

- [ ] **Step 4: Configure Tailwind** (`tailwind.config.ts`)

Set `content: ["./index.html","./src/**/*.{ts,tsx}"]`. Extend theme colors to map tokens via `var(--...)` (e.g. `colors:{ bg:'var(--bg)', surface:'var(--surface)', ink:'var(--ink)', muted:'var(--muted)', accent:'var(--accent)', danger:'var(--danger)', line:'var(--line)' }`). Extend `fontFamily:{ display:['Inter','sans-serif'], body:['"Be Vietnam Pro"','sans-serif'] }`.

- [ ] **Step 5: Wire `src/styles/index.css`**

```css
@import "./tokens.css";
@tailwind base; @tailwind components; @tailwind utilities;
html,body,#root{height:100%;margin:0;background:#000;}
body{font-family:var(--font-body,"Be Vietnam Pro"),sans-serif;}
```
Import it in `src/main.tsx`.

- [ ] **Step 6: Verify dev + build**

Run: `npm run dev` → page loads with no console errors. Then `npm run build` → `dist/` created.
Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: scaffold Vite+Tailwind+GSAP with design tokens"
```

### Task 2: Self-host fonts

**Files:**
- Create: `public/fonts/` (woff2 files), `src/styles/fonts.css`
- Modify: `src/styles/index.css` (import fonts.css first)

**Interfaces:**
- Produces: `font-display: Inter`, `font-body: Be Vietnam Pro` available offline.

- [ ] **Step 1: Fetch woff2 files**

Download Inter (400,500,700,800,900) and Be Vietnam Pro (400,500,700) woff2 into `public/fonts/`. Source: the official font repos (Inter: rsms/inter; Be Vietnam Pro: Google Fonts repo `googlefonts/be-vietnam-pro`). If network blocked at build, ask user to drop the files in `public/fonts/` and continue.

- [ ] **Step 2: Write `src/styles/fonts.css`**

`@font-face` blocks pointing at `/fonts/*.woff2` for each weight, `font-display: swap`. Set `:root{ --font-display:"Inter"; --font-body:"Be Vietnam Pro"; }`.

- [ ] **Step 3: Import + verify**

Add `@import "./fonts.css";` at top of `index.css`. Run `npm run dev`, open devtools Network, throttle offline after first load → headings still render in Inter.
Expected: fonts load from `/fonts/`, not fonts.gstatic.com.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: self-host Inter + Be Vietnam Pro fonts"
```

### Task 3: `Stage` — scale-to-fit fixed canvas

**Files:**
- Create: `src/components/Stage.tsx`
- Test: `src/components/Stage.test.tsx` (optional unit), plus manual visual check

**Interfaces:**
- Produces: `<Stage>{children}</Stage>` — renders a 1920×1080 box centered + letterboxed, scaled by `min(vw/1920, vh/1080)`.

- [ ] **Step 1: Implement Stage**

```tsx
import { useEffect, useState, ReactNode } from "react";
const W = 1920, H = 1080;
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit(); window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, background:"#000", display:"grid", placeItems:"center", overflow:"hidden" }}>
      <div style={{ width:W, height:H, transform:`scale(${scale})`, transformOrigin:"center", background:"var(--bg)", position:"relative" }}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Visual verify**

Render `<Stage><div className="grid place-items-center h-full text-6xl font-display">1920×1080</div></Stage>` in App. Resize window → canvas stays 16:9, letterboxed, never distorts.
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: Stage scale-to-fit fixed 1920x1080 canvas"
```

### Task 4: `useDeck` hook — navigation state

**Files:**
- Create: `src/hooks/useDeck.ts`

**Interfaces:**
- Produces: `useDeck(total: number) => { index: number; go(n:number): void; next(): void; prev(): void; }`
- Behavior: clamps `0..total-1`; syncs `window.location.hash` as `#/<1-based>`; reads hash on mount; `←/Backspace`=prev, `→/Space`=next, `F`=fullscreen toggle; touch swipe left/right.

- [ ] **Step 1: Implement hook**

```ts
import { useEffect, useState, useCallback } from "react";
export function useDeck(total: number) {
  const fromHash = () => {
    const n = parseInt((location.hash.match(/^#\/(\d+)/)?.[1] ?? "1"), 10);
    return Math.min(Math.max(n - 1, 0), total - 1);
  };
  const [index, setIndex] = useState(fromHash);
  const go = useCallback((n: number) => setIndex(Math.min(Math.max(n, 0), total - 1)), [total]);
  const next = useCallback(() => go(indexRef.current + 1), [go]);
  const prev = useCallback(() => go(indexRef.current - 1), [go]);
  const indexRef = { current: index };
  useEffect(() => { history.replaceState(null, "", `#/${index + 1}`); }, [index]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setIndex(i => Math.min(i + 1, total - 1)); }
      else if (e.key === "ArrowLeft" || e.key === "Backspace") { e.preventDefault(); setIndex(i => Math.max(i - 1, 0)); }
      else if (e.key.toLowerCase() === "f") { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    };
    const onHash = () => setIndex(fromHash());
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("hashchange", onHash); };
  }, [total]);
  // touch swipe
  useEffect(() => {
    let x0 = 0;
    const ts = (e: TouchEvent) => (x0 = e.touches[0].clientX);
    const te = (e: TouchEvent) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) setIndex(i => Math.min(Math.max(i + (dx < 0 ? 1 : -1), 0), total - 1)); };
    window.addEventListener("touchstart", ts); window.addEventListener("touchend", te);
    return () => { window.removeEventListener("touchstart", ts); window.removeEventListener("touchend", te); };
  }, [total]);
  return { index, go, next, prev };
}
```
Note: implementer should clean up the `indexRef` shim — use a `useRef` mirror of `index` so `next/prev` read the latest value. Keep behavior identical.

- [ ] **Step 2: Manual verify** in a throwaway harness: arrows/space/backspace change index; URL hash updates; reload at `#/3` restores slide 3; `F` toggles fullscreen.
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: useDeck navigation hook (keyboard/swipe/hash/fullscreen)"
```

### Task 5: `Slide` shell + `Nav` + `Progress`

**Files:**
- Create: `src/components/Slide.tsx`, `src/components/Nav.tsx`, `src/components/Progress.tsx`

**Interfaces:**
- Consumes: nothing yet.
- Produces:
  - `<Slide kicker?:string active:boolean>{children}</Slide>` — full-bleed 1920×1080 layer; padding `7% 8%`; runs a GSAP enter timeline on `active` true: children with `[data-reveal]` stagger in (opacity 0→1, y 24→0). Respects `prefers-reduced-motion` (no motion, instant).
  - `<Nav onPrev onNext/>` — ◂ ▸ buttons bottom corners.
  - `<Progress index total/>` — bar + `06 / 17` bottom center.

- [ ] **Step 1: Implement `Slide.tsx`** with a `useEffect` keyed on `active` that builds `gsap.timeline()` selecting `[data-reveal]` within the slide ref and tweens `from({opacity:0,y:24,duration:0.5,stagger:0.08,ease:"power2.out"})`. Guard with `if (matchMedia('(prefers-reduced-motion: reduce)').matches) { gsap.set(els,{opacity:1,y:0}); return; }`. Kicker rendered as uppercase accent label.

- [ ] **Step 2: Implement `Nav.tsx`** (two buttons, `aria-label`, hover states from tokens) and `Progress.tsx` (a `--line` track with `--accent` fill `width = (index+1)/total`, and `{String(index+1).padStart(2,'0')} / {total}` text).

- [ ] **Step 3: Visual verify** by wrapping a dummy slide with three `[data-reveal]` blocks → they stagger in; Nav + Progress show.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Slide shell with GSAP reveal + Nav + Progress"
```

### Task 6: Deck registry + transition + wire App

**Files:**
- Create: `src/deck.tsx`, `src/slides/index.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Stage`, `useDeck`, `Slide`, `Nav`, `Progress`.
- Produces: `SLIDES: Array<{ id:string; Comp: React.FC<{active:boolean}> }>`; `App` renders the active slide inside `Stage` with cross-fade between slides (outgoing fade/slide-out, incoming handled by Slide enter timeline).

- [ ] **Step 1: Create `src/slides/index.ts`** exporting `SLIDES` array. For Phase 1 it contains ONLY the hero placeholder: `[{ id:'pipeline', Comp: Slide14 }]`. (Later phases push the rest in narrative order.)

- [ ] **Step 2: Implement `deck.tsx`** — render only the active slide (mount/unmount so enter timeline reruns), with a brief outgoing transition via CSS class or GSAP. Wire `Nav` to `next/prev`, `Progress` to `index/total`.

- [ ] **Step 3: Implement `App.tsx`**: `const {index,next,prev} = useDeck(SLIDES.length)`; render `<Stage>` + active `<Comp active />` + `<Nav>` + `<Progress>`.

- [ ] **Step 4: Verify** `npm run dev` → hero slide shows; arrows work (only 1 slide for now, but no crash at bounds).
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: deck registry + transitions + App wiring"
```

### Task 7: HERO slide #14 — `design-to-UI` pipeline (fully animated)

**Files:**
- Create: `src/slides/Slide14.tsx`, `src/graphics/PipelineFlow.tsx`

**Interfaces:**
- Consumes: `Slide` shell.
- Produces: `Slide14: React.FC<{active:boolean}>`.

**Content (verbatim intent):** Title "Pipeline `design-to-UI`". A horizontal 4-node flow: **① select-component** (quét design, chọn com base) → **② skill `mapping-combase`** (mọi component + ghi chú) → **③ build-com** (nếu thiếu thì build, convention sẵn) → **④ gate review** (xác nhận trước khi build UI). Each node is a glass card with an icon; connectors are SVG lines that **draw-on** (`stroke-dashoffset`) left→right, arrowheads appear after the line reaches a node. A "Figma URL" chip enters at the far left and a "UI đúng convention" chip at the far right.

- [ ] **Step 1: Build `PipelineFlow.tsx`** — an SVG (viewBox `0 0 1500 360`) with 4 nodes + 3 connector `<line>`s (`stroke-dasharray=len`, `stroke-dashoffset=len`) + arrow `<path>`s. Expose a `play(active:boolean)` via GSAP timeline ref that: (1) staggers nodes in, (2) animates each connector `strokeDashoffset → 0` sequentially, (3) fades arrowheads after each line. Use tokens for color (`--accent` lines, `--ink` text, `--surface` cards).

- [ ] **Step 2: Build `Slide14.tsx`** — `<Slide kicker="AI for Frontend · pipeline" active={active}>` containing the title (with inline-code styling on `design-to-UI`), the `PipelineFlow`, and a one-line caption "Paste URL Figma → ra UI chuẩn convention. Mỗi step có gate để review." Trigger `PipelineFlow.play()` when `active`.

- [ ] **Step 3: Visual verify** — open deck, slide 14: nodes land in sequence, connector lines draw L→R, arrowheads pop, chips enter. Smooth, no jank. Test `prefers-reduced-motion` → everything visible instantly.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: HERO slide 14 — animated design-to-UI pipeline"
```

### Task 8: PHASE 1 GATE — user review

- [ ] **Step 1:** Run `npm run dev`, open the deck, present slide 14. Ask user: "Đúng feel chưa? (màu/font/animation/scale)". Capture any adjustments to tokens or animation timing.
- [ ] **Step 2:** Apply tweaks, commit. Do NOT start Phase 2 until user approves the look.

---

## PHASE 2 — Remaining slides (batched)

Each slide task: create `src/slides/SlideNN.tsx` (+ a graphic in `src/graphics/` when it has a custom visual), register it in `src/slides/index.ts` in narrative position, visual-verify, commit. All reuse the `Slide` shell, `[data-reveal]` stagger, tokens, and the animation vocabulary (count-up, SVG draw-on, list-land). Reference content per slide is in the spec §6–§7 (`docs/superpowers/specs/2026-06-17-ai-frontend-slide-deck-design.md`).

Build in batches with a quick review between each batch.

### Task 9: Batch A — Slides 01–04
- 01 Mở màn/Host (title + Trung 99, ATX·Finpath; typing-cursor graphic).
- 02 Khán giả xài tool gì? (logo grid: Claude/Cursor/Codex/Gemini/Antigravity, land-in stagger).
- 03 Hành trình (timeline dots: Cursor ~1k$/tháng → chuyển Claude).
- 04 Cursor vs Claude Code (2-col: control/next-approve vs YOLO).
Each: create component, register, verify, commit. Commit msg `feat: slides 01-04`.

### Task 10: Batch B — Slides 05–08
- 05 Số lần prompt & tốc độ (bar count-up: Claude 1 ≈ Cursor 2–3; "Cursor nhả code nhanh").
- 06 Antigravity (browser-frame graphic; "điều khiển Chrome xịn nhưng tèo giữa chừng; 6/10"; note AG 2.0 = Plugins+Sidecars; use `--danger` for the crash caveat).
- 07 Mũ chồng mũ (stacked layers; "không tuyến tính, cần tư duy bào AI").
- 08 Harness map (radial/sơ đồ: context·token·memory·skill·hook·subagent·command·plugin·mcp).
Verify each, commit `feat: slides 05-08`.

### Task 11: Batch C — Slides 09–12
- 09 Skill & Hook (hook-trigger anim: "hook chặn push khi chưa verify"; gitnexus example; line "Skill = playbook tells agent how to sequence MCP tools").
- 10 Subagent & Plugin (folder-structure reveal; "song song tránh loãng context; plugin = bundle skills+hooks+mcp+subagent, chạy chéo Claude/Codex/Antigravity").
- 11 Tối ưu context (context-rot graphic: 200K trần ngon; 1M ~1/4 multi-needle fail; /compact, ép về 200K).
- 12 [MỚI] Context engineering (ceiling graphic; quote @javascriptmastery "the workflow has a ceiling… AI has no idea what you actually want").
Verify each, commit `feat: slides 09-12`.

### Task 12: Batch D — Slides 13–17 (excl. 14 already built)
- 13 AI for Frontend: 2 phần (split UI/UX vs logic business).
- 15 Free-style vs Design System (toggle/compare; frontend-design/Taste; "ép dùng com base + token, không inline style").
- 16 [MỚI] Figma MCP = source-of-truth (figma↔code↔git loop graphic; "bottleneck là SYNC chứ không phải generate"; round-trip Figma↔code).
- 17 Đóng / Workflow > Model (closing; "chọn agent theo task không theo leaderboard; test + tinh chỉnh"; thank-you).
Ensure registry order is 01..17 with 14 in place. Verify full run-through. Commit `feat: slides 13-17 + final ordering`.

### Task 13: PDF/print fallback + final polish

**Files:** Modify `src/styles/index.css` (add `@media print`), optionally `src/components/Stage.tsx`.

- [ ] **Step 1:** Add `@media print` rules: un-scale the stage, render each slide on its own A4-landscape page (`page-break-after: always`), force all `[data-reveal]` visible. Provide a `?print` query or a "Print to PDF" affordance that renders all slides stacked.
- [ ] **Step 2:** Verify: browser Print → PDF has 17 readable landscape pages.
- [ ] **Step 3:** Full deck pass: all 17 slides, arrows/swipe/hash/fullscreen, offline fonts, no console errors. Re-verify on-slide version numbers/prices against current sources.
- [ ] **Step 4:** `npm run build` → static `dist/`. Commit `feat: print/PDF fallback + final polish`.

---

## Self-Review (against spec)

- **Spec §2.1 fixed-canvas scale-to-fit** → Task 3 (Stage). ✓
- **§2.2 reveal model (1 press = 1 slide, stagger)** → Task 5 (Slide enter timeline), Task 4 (one-step nav). ✓
- **§2.3 React+Vite+Tailwind+GSAP, per-slide components, frontend-design** → Task 1 + all slide tasks. ✓
- **§2.4 self-host fonts / offline** → Task 2. ✓
- **§3 design system tokens/typography** → Task 1 (tokens), Task 2 (fonts). ✓
- **§4 deck shell: arrows/keys/swipe/fullscreen/hash/progress/PDF fallback** → Task 4 (nav/hash/fullscreen/swipe), Task 5 (progress), Task 13 (PDF). ✓
- **§5 animation vocabulary** → Task 5 (stagger), Task 7 (draw-on/SVG), Batches (count-up etc.). ✓
- **§6 17-slide outline** → Tasks 7, 9–12. ✓
- **§7 content corrections (nerf reframe, AG 2.0, 200K, skill≠mcp, new slides 12/16, re-verify numbers)** → Batches B/C/D + Task 13. ✓
- **§10 phased build, hero first, gates** → Phase 1 (Task 8 gate), Phase 2 batches. ✓
- **§11 success criteria** → covered by Task 13 final pass. ✓

No placeholders remain (slide content references point to spec §6–§7 with concrete intent, not "TODO"). Type names consistent: `Stage`, `useDeck(total)→{index,go,next,prev}`, `Slide{kicker,active}`, `SLIDES`, `PipelineFlow.play(active)`.
