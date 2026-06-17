# Spec: Slide deck "Dùng AI để code frontend"

**Date:** 2026-06-17
**Author:** Trung 99 (ATX · Finpath) + Claude
**Status:** Approved design → ready for plan

## 1. Mục tiêu

Một website trình chiếu slide (single-page web app) để present nội bộ công ty về chủ đề
"Dùng AI để code frontend". Bắt mắt, animation mượt, điều hướng bằng mũi tên trái/phải.
Deploy được ra static để chia link cho mọi người tự xem.

Nguồn nội dung: kịch bản nháp (Google Doc) + fact-check/freshness từ `/last30days` (2026-06-17).

## 2. Quyết định kiến trúc (đọc kỹ — #1 ảnh hưởng toàn bộ build)

### 2.1 Fixed-canvas scale-to-fit — KHÔNG mobile-first responsive
- Thiết kế trên canvas cố định **1920×1080 (16:9)**.
- Toàn deck bọc trong `.stage` 1920×1080, dùng `transform: scale(s)` với
  `s = min(vw/1920, vh/1080)`, căn giữa + letterbox (viền đen/nền 2 bên).
- Một layout chạy y hệt trên máy chiếu, laptop, và điện thoại mở link.
- **Override memory "mobile-first responsive"**: deck KHÔNG reflow theo breakpoint.
  Lý do: reflow-responsive sẽ vỡ layout theo từng độ phân giải máy chiếu thực tế.

### 2.2 Reveal model
- **1 lần nhấn mũi tên = chuyển 1 slide** (không phải PowerPoint within-slide builds).
- Khi slide vào: các phần tử/graphic **reveal tuần tự (stagger)** một lần, rồi giữ ("sustain").
- Không có bước click-step bullet trong 1 slide.

### 2.3 Tech stack
- **React + Vite + TypeScript + Tailwind** → `vite build` ra static.
- **GSAP timeline** cho animation (khớp mô hình reveal-sync của pipeline gen-video).
  Skill `gsap-skills` có sẵn để tham khảo.
- Mỗi slide = 1 component riêng (dễ hold context, dễ sửa độc lập).
- **Mọi UI/graphic code qua skill `frontend-design`** (yêu cầu bắt buộc của user).

### 2.4 Offline robustness
- **Self-host font** Inter + Be Vietnam Pro (woff2 trong `public/fonts/`), KHÔNG dùng
  Google Fonts CDN — phòng wifi phòng họp yếu làm vỡ heading.
- Không phụ thuộc network lúc present. Tất cả asset local.

## 3. Design system — "Clean Light Keynote"

### 3.1 Tokens (`src/styles/tokens.css`)
```
--bg: #ffffff;      --surface: #f5f5f7;
--ink: #1d1d1f;     --muted: #6e6e73;
--accent: #0071e3;  --accent-soft: #0071e312;
--danger: #ff3b30;  --line: #d2d2d7;
--radius: 18px;
```
- Một accent xanh; `--danger` đỏ chỉ dùng cảnh báo (vd "nerf myth", "tèo giữa chừng").
- Sáng, nhiều whitespace kiểu Apple Keynote. Một focal point mỗi slide.

### 3.2 Typography
- Display = **Inter** (900/800, `letter-spacing -0.03em`).
- Body = **Be Vietnam Pro** (400/500/700) — render dấu tiếng Việt tốt.
- Kicker/label: uppercase, `letter-spacing 0.14em`, weight 700, màu `--accent` hoặc `--muted`.
- Số đếm: `font-variant-numeric: tabular-nums`.

### 3.3 Atmosphere
- Nền trắng, vài graphic nhẹ nhàng; bóng mềm `0 20px 50px -28px rgba(0,0,0,.12)`.
- Card surface bo góc, viền `--line` mảnh.

## 4. Deck shell (presentation plumbing — task hạng nhất)

- **Điều hướng:** mũi tên ◂ ▸ trên màn + phím `←/→` (và `Space` = next) + swipe trên touch.
- **Fullscreen toggle** (phím `F`).
- **Deep-link slide index** qua hash `#/6` — reload/jump về đúng slide (cứu khi present vấp).
- **Progress bar** + số trang `06 / 17` góc dưới.
- **PDF/static fallback:** trang có chế độ print (`@media print` mỗi slide 1 trang A4 landscape) để export PDF dự phòng khi laptop/browser trục trặc giữa talk.
- Transition giữa slide: slide cũ fade/slide-out, slide mới slide-in + stagger reveal (~500ms, ease mềm). Tôn trọng `prefers-reduced-motion`.

## 5. Animation vocabulary (port từ pipeline gen-video → web)

Lấy từ báo cáo subagent đọc `content-video-plugin`:
- **Count-up** số (bar/ring), clamp + `tabular-nums`. GSAP `snap` innerText.
- **SVG draw-on**: animate `stroke-dashoffset` về 0 cho mũi tên, flow line, vòng tròn ring.
- **List-land / stagger**: N phần tử vào lần lượt theo index (`--i`), không random → deterministic.
- **Spring entrance preset**: card/title mượt (damping ~18, ít nảy); badge/pill nảy nhẹ.
- **Sustain / breathe**: sau reveal, micro-motion ±0.8% scale giữ slide sống; glow nhẹ focal.
- Graphic vẽ bằng **SVG thủ công** (không ảnh AI generate), code qua `frontend-design`.

## 6. Slide outline (17 slide)

| # | Slide | Ý chính | Graphic |
|---|---|---|---|
| 01 | Mở màn / Host | Tiêu đề + Trung 99, ATX·Finpath | con trỏ gõ chữ |
| 02 | Khán giả xài tool gì? | Poll: Claude/Cursor/Codex/Gemini/Antigravity | logo grid |
| 03 | Hành trình của tôi | Đốt 1k$/tháng Cursor → chuyển Claude | timeline dots |
| 04 | Cursor vs Claude Code | Control mạnh (next/approve) vs YOLO | 2 cột so sánh |
| 05 | Số lần prompt & tốc độ | Claude 1 lần ≈ Cursor 2–3; Cursor nhả nhanh | bar count-up |
| 06 | Antigravity | Điều khiển Chrome xịn nhưng tèo giữa chừng; 6/10 (AG 2.0) | browser frame + glitch |
| 07 | Ngành "mũ chồng mũ" | Không tuyến tính; cần tư duy bào AI, không bám 1 tool | layers stack |
| 08 | Harness = tay chân Agent | context·token·memory·skill·hook·subagent·command·plugin·mcp | sơ đồ map |
| 09 | Skill & Hook | Đóng gói rule; hook chặn push khi chưa verify (gitnexus) | hook trigger anim |
| 10 | Subagent & Plugin | Song song tránh loãng context; plugin = bundle | cấu trúc thư mục |
| 11 | Tối ưu context | 200K trần ngon; 1M ≠ free (rot ~1/4 fail); /compact, ép 200K | context-rot graphic |
| 12 | **[MỚI] Context engineering** | Trần kỹ năng mới: quản context > prompt | ceiling graphic |
| 13 | AI for Frontend: 2 phần | UI/UX vs logic business | split |
| 14 | **★ Pipeline `design-to-UI`** (HERO) | select-component → mapping-combase → build-com → gate | flow diagram động |
| 15 | Free-style vs Design System | frontend-design/Taste; ép dùng com base + token | toggle/compare |
| 16 | **[MỚI] Figma MCP = source-of-truth** | Không phải máy generate; bottleneck là SYNC | figma↔code↔git loop |
| 17 | Đóng / Workflow > Model | Chọn agent theo task, không theo leaderboard; test+tinh chỉnh | closing |

**Slide HERO = #14** (build trước làm proof-of-look).

## 7. Nội dung — chỉnh so với kịch bản nháp (từ last30days, 2026-06-17)

- Slide 06: thêm "Antigravity 2.0 (~19/05): Plugins + Sidecars".
- Slide 09–10: "skill ≠ mcp" — Skill là playbook chỉ Claude *sequence* các MCP tool; MCP là plumbing.
- Slide 11: số liệu sắc hơn — 1M token ~1/4 multi-needle retrieval fail; nhiều dev ép về 200K.
- Thêm slide 12 (context engineering) + 16 (Figma MCP sync).
- **Lưu ý "nerf":** nếu muốn nhắc Anthropic — khung lại thành "có 3 bug Mar–Apr, đã fix; không cố tình bóp" (post-mortem 23/04), thay vì "âm mưu bóp vì chi phí".
- **Re-verify lúc build:** mọi con số version (Fable 5, Composer 2.5 date, giá token…) đổi theo tuần — check lại trước khi đưa lên slide.

## 8. Cấu trúc thư mục
```
slide-deck/
  index.html
  public/fonts/            # Inter + Be Vietnam Pro woff2 (self-hosted)
  src/
    styles/tokens.css
    components/Stage.tsx    # scale-to-fit canvas 1920x1080
    components/Slide.tsx    # wrapper: kicker, layout, sustain
    components/Nav.tsx, Progress.tsx
    hooks/useDeck.ts        # keyboard/swipe/hash/fullscreen state
    graphics/               # SVG động: PipelineFlow, HarnessMap, ContextRot, FigmaLoop…
    slides/Slide01..Slide17.tsx
    deck.tsx                # registry + transition
    main.tsx
  vite.config.ts, tailwind.config.ts, tsconfig.json, package.json
```

## 9. Phạm vi & non-goals
- KHÔNG mobile-first reflow (mục 2.1).
- KHÔNG ảnh AI generate — graphic là SVG thủ công.
- KHÔNG within-slide click builds.
- KHÔNG speaker-notes view / remote control (YAGNI cho v1).
- Nội dung tiếng Việt (giọng nói chuyện như kịch bản).

## 10. Build theo phase (de-risk)
- **Phase 1 — Proof-of-look:** scaffold Vite + tokens + Stage scale-to-fit + Slide shell +
  Nav/Progress/hash/fullscreen + self-host fonts + **slide #14 (HERO) animated đầy đủ**.
  → Lấy thumbs-up "đúng feel" trước.
- **Phase 2+:** các slide còn lại theo batch (vd 01–04, 05–08, …), tái dùng animation vocabulary.
- Mỗi phase có gate review với user (đúng tinh thần "cứ làm đi rồi chỉnh").

## 11. Success criteria
- Mở link → mũi tên ←/→ chạy mượt 17 slide, scale đúng mọi màn.
- Heading hiển thị đúng font kể cả offline.
- Hero slide #14 có flow diagram vẽ động đẹp, reveal đồng bộ.
- Export được PDF fallback.
- Build static `dist/` chia link được.
