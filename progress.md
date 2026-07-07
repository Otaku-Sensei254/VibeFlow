# VibeFlow Progress

## 2026-06-30

### Completed
- Verified badge image (`/images/vibeflow_verified2.png`) displayed next to usernames in PostCard, PostDetail (post author + comments)
- Real-time save/unsave broadcasts added in `posts.ex` and relay channel for both `relay:feed` and `relay:post:{uuid}`
- Real-time repost + save event listeners in PostCard.js and PostDetail.js (counts update live)
- Unfollow DELETE endpoint in UserController and router
- `is_following` field in post detail API response
- PostDetail.js redesigned with unified single-column layout (inline comments, follow button, desktop card + mobile optimizations)
- Color palette: `tide` (teal), `flow` (cyan), `coral` (rose), `sun` (gold). Bulk-replaced across all React components. Signature gradient: `from-tide-500 via-flow-500 to-coral-500`
- Tailwind config with custom water-themed colors
- Show/hide password toggle (FiEye/FiEyeOff) in Login and Register forms
- React app moved to `/home/dtech/VCF/Failsafe/Blog/VibeFlow/VibeFlow-React/vibeflow2.0`
- Fixed 6 ESLint warnings blocking Vercel build (unused imports, missing useEffect deps)
- `index.html` and `manifest.json` updated: logo = `No4.png`, theme color = `#0d9488`
- **Live notification + chat unread counters**: `notificationCount` and `chatUnreadCount` in AuthContext; fetched on mount via `/notifications` and `/chat/unread-count`; real-time updates via `relay:user` channel events (`new_notification`, `update_notifications`, `new_sidebar_message`, `update_sidebar`); badge overlays on bell and chat icons in desktop nav, mobile bottom nav, and slide-out menu; Notifications.js and Chat.js sync counts on load/mark-read

## 2026-07-08

### Completed
- **TrailC landing page design** — Dark hero (`bg-zinc-950`) with letter-by-letter VIBEFLOW reveal, blinking cursor, rotating marquee tagline, mouse-following glow orb, grid texture background, floating emoji icons
- **Split layout** — Left: VibeFlow headline + CTAs + social proof avatars. Right: dark-theme mockup feed cards
- **Feature stat row** — 4 compact badges (Global, Real-Time, Chat, Community) below the hero
- **Nav hidden on landing** — Top navbar, bottom mobile nav, and footer all hidden on `/` via Layout conditional checks
- **CTA links to /feed** — "join the current" button now goes to `/feed` instead of `/register`
- **Auth redirect from /** — Logged-in users hitting `/` are instantly redirected to `/feed` with `replace: true`
- **App logo in navbar** — Replaced styled "V" letter with actual `No4.png` logo image
- **Fixed Vercel build** — Resolved `items` unused-variable warning in WaveStore.js by stripping destructured read

### Key Decisions
- React app: `/home/dtech/VCF/Failsafe/Blog/VibeFlow/VibeFlow-React/vibeflow2.0`
- Backend: `/home/dtech/VCF/Failsafe/Blog/VibeFlow/ZCHAT/vibeflow/`
- Vercel treats ESLint warnings as errors — zero warnings required
- Notification/chat counts live in AuthContext for cross-page persistence
- Replaced indigo/purple/pink with tide/flow/coral for water-theme consistency
- Landing page uses distinct `zinc-950` dark tone vs app's `gray-900` for a premium "gateway" feel; rest of app stays on existing palette
- Landing page is full-screen with no nav/footer chrome — clean arrival experience before entering the app
