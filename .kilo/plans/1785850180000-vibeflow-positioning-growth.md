# VibeFlow Growth — Finalize Onboarding Fix (Option A)

## Decision (resolved)
Onboarding stays **skippable**, but the "Skip" action now routes to `/currents` instead of `/feed`.

- Why /currents: `GET /currents` with default `tab="all"` is **global** (`current_controller.ex` l.11-16 → `posts.ex` `list_currents`, no follower filter), so it's non-empty even at 96 users. `/feed` (`list_feed_for_user`) is follower-graph-bound and empty for a skipper.
- Why not coerce: forcing ≥1 follow adds signup friction; at 96 users, conversion risk > churn risk, and `/currents` removes the empty-feed risk without friction.
- Completers (who follow suggestions) still → `/feed` (personalized). Only the skip path changes.

## Scope
Frontend repo only (`vibeflow2.0`). No backend changes needed to land this. Bonus low-effort items that reuse existing backend rewards are listed as Step 2–3.

## Tasks (ordered)

### Step 1 — Route onboarding-skip to /currents  (the fix)
File: `src/pages/OnboardingSuggestions.js` (l.37-39)
```diff
 const handleSkip = () => {
-  navigate("/feed", { replace: true });
+  navigate("/currents", { replace: true });
 };
```
Note: `Register.js` l.27 (`navigate("/onboarding")`) and `handleContinue` (`/feed`) are unchanged — completers still get a personalized feed after following.

### Step 2 — Unbury the invite loop (discovery, reuses existing 50-pt reward)
File: `src/components/Layout.js`
- Add an "Invite" entry to the **logged-in** `navLinks` array (l.72-76) so it's 1-click, always visible (not just the profile dropdown):
  ```js
  { to: "/invite", label: "Invite", icon: FiGift },
  ```
- `FiGift` is already imported (l.11).
- (Optional) show points balance next to it — requires exposing `points` on the AuthContext value; out of scope for this pass (backend `points` column already exists, just not surfaced in context).

### Step 3 — Daily-streak retention nudge (frontend-only, reuses `/users/ping`)
File: `src/context/AuthContext.js`
- In the existing daily `useEffect` (l.36-52): after fetching streak, if `localStorage.vibeflow_last_ping` !== today **and** `streak.current >= 3`, call `showToast({ title:"Daily ping", message:"Keep your streak alive 🔥", duration:10000 })` (import already present l.4) with an `onClick` that POSTs `/users/ping` (`api` already imported l.2).
- Add `pingUser` to the context value (l.192-197) so other components could trigger a ping later.
- This is additive and safe — no auth/backend change.

## Out of scope (do not do here)
- Invite reward changes (already 555 pt new-user / 50 pt inviter, verified in `accounts.ex` l.100-131).
- Personalization / For-You feed (backend ranking depth — `list_trending_posts` already ships; deeper recsys is a separate effort).
- Coercing onboarding (the rejected Option B).
- Opaque invite tokens (invite-code == username by design; spoofing acceptable at N=96).
- Streak nudge toast (Step 3) — dropped: auto-ping already runs on app-load (`AuthContext.js` l.36-52), `showToast` has no `onClick`, and in-app toasts can't drive cross-day opens; true D1 retention needs push notifications (no infra visible).

## Implemented (this pass)
- Step 1: `src/pages/OnboardingSuggestions.js` l.37-39 — `handleSkip` now → `/currents`.
- Step 2: `src/components/Layout.js` l.74 — added `{ to: "/invite", label: "Invite", icon: FiGift }` to logged-in `navLinks` (surfaces in desktop top nav + mobile drawer).
- Build verified: `CI=true npm run build` → Compiled successfully (no ESLint errors).

## Validation
- **Step 1**: register a brand-new account, click "Skip" on `/onboarding`, assert URL = `/currents` (showing the all-tab video feed). Completers (follow ≥1) still land on `/feed`.
- **Step 2**: refresh `/feed`; assert a top-nav + mobile-drawer "Invite" link appears for logged-in users.
- **Build gate**: run `CI=true npm run build` locally before pushing to `Matrix` — Vercel fails builds on any ESLint warning (this repo tripped on that exact failure: unused `useState` in `CurrentCommentSheet.js`, already fixed).


## Notes for the implementation agent
- `.env` has `REACT_APP_API_URL=/api/v1`; local dev proxy is `localhost:4001`. `/currents`, `/invite`, `/users/ping`, `/users/streak` are all live routes.
- `FiGift` and `showToast` and `api` are already imported in the files being edited — no new imports needed for Steps 1–2. Step 3 needs `showToast` usage inside the AuthContext `useEffect` (already imported at line 4).
- Run `npm run build` with `CI=true` before pushing to `Matrix` to catch ESLint-as-errors.
