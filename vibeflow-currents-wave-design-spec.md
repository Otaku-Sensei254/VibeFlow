# VibeFlow — Currents and Wave design spec

Status: agreed direction, not yet implemented. Reference for frontend build.

---

## 1. Currents — viewing page

Full-screen vertical video feed (own reel/short-form format).

**Top bar**
- "Following" and "Currents" tab switcher, left-aligned
- Active tab gets a thin gold underline (2px) instead of a top-of-screen progress bar
- Search icon, top-right

**Video area**
- Full-bleed vertical video, autoplay
- Subtle top-to-bottom and bottom-to-top gradient overlays for text legibility (no visible bars)

**Right action rail** (bottom-anchored, vertical stack)
- Creator avatar (initials-based, gold fill) — tap to view profile
- Like (heart) + count
- Comment (message) + count
- **Bottle** (gold icon) — lets a viewer send the creator a private bottle reply instead of a public comment. This is the Currents ↔ Bottles crossover hook.
- Share

**Caption block** (bottom-left)
- Creator @handle
- Caption text, max ~2 lines
- Sound attribution row (music icon + track name)

**Decision made:** no category filter chips at launch. Single unified feed only — categories are a post-traction feature, not a launch feature, to avoid splitting thin content further.

---

## 2. Currents — creation flow (MK2, agreed direction)

Camera-first, 3-step flow. MK1 (gallery-first) and MK3 (multi-clip stacking) kept as reference/fallback — see below.

**Step 1 — Record or upload**
- Opens directly into camera view, not gallery
- Hold-to-record capture ring (gold), centered bottom
- "Upload" / "Camera" pill toggle above the capture ring — Upload is the secondary path, not default
- Right-edge icon stack: flip camera, flash, adjustments, gallery shortcut
- Duration indicator top-center (e.g. "15s")

**Step 2 — Edit**
- Full preview of the captured/selected clip
- **Vertical tool rail on the right edge** (not centered, not top): sound, text, voice, sticker — thumb-reachable, one-handed
- Thin progress/trim bar at the bottom
- Gold pill "Continue" button, bottom-right, inline with the trim bar

**Step 3 — Cover, caption, share**
- **Slide-up bottom sheet** over a dimmed/blurred preview of the video (video stays visible behind the sheet)
- Cover thumbnail (tap to change) + caption input
- Hashtag and tag-people chips
- Two actions at the bottom: "Drafts" (secondary) and **"Let it flow"** (primary, gold) — branded share label instead of generic "Post"

**Backend note:** reuse the existing `category` field/enum from Posts if categories are added later — don't build a parallel taxonomy.

---

## Reference: MK1 and MK3 (not chosen, kept for later)

**MK1 — gallery-first, full-screen steps**
- Opens to device gallery grid (Post/Story/Current selector at bottom)
- Full-screen edit step: centered circular tool icons, gold "Next"
- Full-screen final step: cover edit, caption, hashtags, tag people, location, Save draft / Share
- Lowest engineering cost, most familiar pattern — good fallback if MK2's camera flow proves too heavy to ship first.

**MK3 — multi-clip stacking**
- Step 1: record/pick multiple short clips shown as a segment stack with a "+" to add more (like TikTok's multi-beat clips)
- Step 2: bottom dock of circular tool icons (sound, text, voice, next) instead of a side rail
- Step 3: tabbed "Details" / "Sharing" instead of one scroll
- Highest engineering cost (clip ordering, per-segment trim, stitching) — good future upgrade once Currents has traction and power users want more editing depth.

---

## 3. Wave — creation flow

Shorter, lighter version of the Currents MK2 flow. Ephemeral content should feel instant, not like a production — no multi-step flow.

- Camera-first, same capture ring pattern as Currents MK2
- "Gallery" / "Camera" pill toggle above the capture button
- Right-edge icon stack: flip camera, text, music, stickers
- No separate edit/share steps — tools are applied directly on the capture screen, then posted

---

## 4. Wave — viewing page

- **Segmented progress bar at the top** — this is where it belongs (unlike Currents): shows position in a sequence of waves, tap-to-advance
- Top-left: avatar (initials, gold fill), @handle, timestamp, overflow menu (dots) top-right
- Gradient overlays top and bottom for legibility
- Bottom bar: reply input field ("Send a reply"), heart (like), send

**Decision made:** Wave replies go straight to direct messages/DMs — not routed through Bottles. Keeping the two systems separate for now (Bottles = anonymous/public, Wave replies = named/private DM).

---

## Open items for next planning pass
- Backend schema for Currents (video storage, cover-frame extraction, draft persistence)
- Backend schema for Wave (ephemeral expiry, segmented "story ring" query for the feed)
- Whether Currents Bottle-reply reuses the existing Bottles conversation infrastructure or needs its own thread type
