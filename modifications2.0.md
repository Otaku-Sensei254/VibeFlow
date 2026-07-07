# Modifications 2.0 — VibeFlow React App

## Backend (Phoenix / Gigalixir)

### Chat — Reply Support
- Added `reply_to_id` column + `belongs_to :reply_to` association on `Message` schema
- `create_message` endpoint accepts `reply_to_id`
- `message_json` serializes nested `reply_to` data
- Deployed on Gigalixir at `https://vibeflow.gigalixirapp.com`

### Chat — Per-Conversation Skins
- `update_skin` endpoint for setting `message_skin` / `other_user_message_skin` per user per conversation
- `conversation_json` includes skin fields
- `skin_changed` broadcast via `handle_out` with `intercept`

### CORS
- Enabled via `cors_plug` with regex `~r"^https://[\w-]+\.vercel\.app$"`

### Roles — API Serialization
- `roles` field added to `user_json` (auth_controller) and `profile_json` (user_controller)
- Preloaded with `Vibeflow.Repo.preload(user, :roles)`
- `clean_roles` helper handles `%Ecto.Association.NotLoaded{}` gracefully
- `user_json` in user_controller handles NotLoaded for `post.user` association

### Admin API
- `VibeflowWeb.Api.V1.AdminController` with endpoints: stats, users (search/sort), roles toggle, verifications (approve/reject), roles CRUD, permissions
- All behind `:api_auth` plug
- `Permission` schema has `slug` + `description` (no `name` field)

### Creator Hub API
- Serializes posts/ripplers with `post_json`/`user_json` instead of raw Ecto structs
- `view_count` added to `post_json`

### Routes — Ordering Fix
- Static `/users/*` routes (`/users/saved-posts`, `/users/verification-status`, etc.) moved before dynamic `/users/:username` to fix 404s

### Points — Simplification
- Removed double-dip ripple bonus points
- Liking awards flat 2 pts (liker) + 3 pts (author) regardless of ripple status
- Removed `@ripple_points` and `@post_author_ripple_points` constants

### User Profile — Post Order
- Posts on user profile ordered newest-first (`order_by: [desc: :inserted_at]`)

---

## React Frontend

### Chat — Skin Modal
- Gear icon → `ChatSettingsModal` with 5 skin cards
- `PUT /chat/conversations/:uuid/skin`
- Per-author skin: `myMessageSkin` + `otherUserMessageSkin`
- `skin_changed` listener updates skin in real time
- `MessageBubble` receives correct skin per message author

### Chat — Read Receipts
- `mark_read` fires on every incoming `new_message`

### Chat — Textarea
- Multi-line with auto-resize
- Enter sends, Shift+Enter newlines
- `scrollbar-hide`

### Chat — Reply UI
- Floating hover action bar on bubble: Reply icon + More icon (Edit, Delete, Star in dropdown)
- Reply bar renders above input
- `reply_to_id` sent with next message
- Matches LiveView UX pattern

### Chat — Edit Message
- Inline `<textarea>` + `FiCheck` save button
- Real-time sync via `message_updated` channel event

### Chat — Duplicate Send Guard
- `sendingRef` pattern prevents double sends
- Duplicate ID check in `setMessages`

### Chat — Date Separators
- "Today", "Yesterday", weekday, or full date pill between messages

### Toast System
- `src/utils/toast.js` dispatches `CustomEvent("app:toast")`
- `NotificationToast.js` listens for `app:toast`, renders success/error toasts with optional `<Link>`
- Works across page navigations without React context

### Background Upload (Posts & Waves)
- `showToast()` global helper via custom DOM event
- CreatePost and CreateWave navigate immediately, then toast on completion with post/wave link
- CreatePost media upload: file picker (`accept="image/*,video/*"`), preview grid with remove, uploads to R2, includes URLs in `media_files` payload
- CreateWave preview capped at `h-[55vh]` so "Add sound" and "Share Wave" always visible on mobile

### User Profile — Role Badges & Dashboard Nav
- Role badges next to username (maps over `u.roles`)
- Dashboard nav buttons in actions area (admin/moderator/sales)
- Admin link uses React `<Link to="/admin/dashboard">`

### Admin Pages (React)
- `AdminDashboard` — stats cards, category perf bars, trending tags
- `AdminUsers` — search/sort, role toggle buttons via `POST /admin/users/:id/toggle_role/:role_id`
- `AdminVerifications` — pending/all filter, approve/reject
- `AdminRoles` — create form with permission checkboxes, existing roles list
- `AdminLayout` with `AdminSidebar` — responsive fixed sidebar, mobile slide-out with hamburger + backdrop
- `AdminRoute` guard — checks `user.roles.some(r => r.name === "admin")`, redirects to `/feed`
- Error handling: visible error messages (red box) instead of silent fails
- Recolored with app palette (tide/flow/coral/sun) across all pages + sidebar

### Creator Hub Page
- Route: `/creator-hub` and `/users/:username/creator-hub`
- Matches LiveView layout
- Metric cards (Views/Likes/Comments/Reach/Rippled)
- Post Trail 2-column grid with ripple trail
- App palette styling

### Real-Time Points
- `points_awarded` handler in `AuthContext` `relay:user` channel callbacks
- Updates `user.points` in state + localStorage
- Shows success toast with `+X pts`
- Functional updater `setUser(prev => ...)` avoids stale closures

### Wave Stories — Feed Display
- Always visible (no longer hidden when no other users have waves)
- "You" button: dashed `border-flow-400`, faded avatar (`opacity-60`), blue plus icon overlay, links to `/waves/new`
- Vertical divider between "You" and other users
- Empty state: "No waves yet — create one!"
- Other user avatars: gradient border for unseen, gray border for seen

---

## Vercel / Deploy
- `.npmrc` with `legacy-peer-deats=true`
- `CI=true` build passes
- React repo: `git@github.com:Otaku-Sensei254/VibeFlow.git` (branch `Matrix`)
- SSH key: `vibeflowtech@gmail.com`

## Environment
- `REACT_APP_API_URL` → `https://vibeflow.gigalixirapp.com/api/v1`
- `REACT_APP_WS_URL` → `wss://vibeflow.gigalixirapp.com/socket`
- Local dev: CRA proxy in `package.json` (`"proxy": "http://localhost:4001"`), `.env` with `REACT_APP_API_URL=/api/v1`
