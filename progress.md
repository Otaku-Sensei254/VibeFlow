# VibeFlow Progress

## Done

### Profile & Settings
- Extracted `USERNAME_STYLES` / `DARK_USERNAME_STYLES` to `src/constants/usernameStyles.js` with a `"none"` entry
- Fixed neon-green glow default bug in `UserProfile.js`: `u.username_style || "neon-green"` → `u.username_style ? styleMap[...] : styleMap["none"]`
- Added avatar upload to `Settings.js`: file input + preview + upload via `POST /uploads/media`
- Added glow style picker to `Settings.js`: visual grid of 7 options, gated behind `profile-glow` inventory check
- Glow picker shows purchase prompt if not owned, fetches from `GET /store/items`
- **Avatar frame ring** in `WaveViewer.js`: reads `current.user?.frame` from API, applies ring shadow

### Posts & Feed
- **Fixed post creation "?" bug**: `CreatePost.js` passes full post via `navigate("/feed", { state: { newPost } })`; `Feed.js` reads and prepends it
- Repost behaviour improved

### Chat
- **Fixed send DM in `WaveViewer.js`**: uses `current.user?.username` instead of static URL `username` param
- **Message button on UserProfile** auto-creates/finds conversation via `POST /chat/start/:username` then navigates to `/chat/:uuid` (loading spinner while resolving)
- **Toast notifications for new messages**: `AuthContext.js` shows toast with username, message preview, and "Open chat" link on `new_sidebar_message`
  - Skips if sender is the current user
  - Skips if already viewing that conversation
  - Duration 8s
- **Desktop footer hidden on chat pages**: `/chat` paths excluded from footer

### Notifications
- **Follow-back button** for follow-type notifications with loading spinner
- **Navigation on tap**: clicking navigates to profile, post, or chat based on type
- **Rich notification JSON**: backend returns `post_uuid`, `post_title`, `conversation_uuid`
- Backend preloads `:conversation` in `list_user_notifications`
- Real-time channel payload (`new_notification`) already includes `post.uuid` and `post.title`

### Cosmetics & Store
- Backend ownership validation in `user_controller.ex`: rejects `username_style` with 403 if user lacks `profile-glow`
- Added `frame` field to wave `user_json` via `Store.get_active_cosmetics/1`

### Share Modal
- Added contacts (followers/following) to share modal: 3-tab layout (All/Followers/Following) + search
- Loaded via `Promise.allSettled` so one failing endpoint doesn't break the other

### Performance & Cleanup
- **Removed console.logs from `realtime.js`**: all `console.warn`/`console.log`/`console.error` stripped
- **Fixed duplicate channel listeners**: `joinChannel` returns early when channel already exists
- **Fixed `user?.id` stale closure**: used `useRef` in `AuthContext.js` to avoid ESLint CI failure
- **Global image fallback**: `App.js` catches all `<img>` load errors for Cloudinary URLs and replaces with placeholder — stops 401 console noise
- **Backend uploads saved locally**: both `media_controller.ex` and `upload_controller.ex` save to `priv/static/uploads/` and return `/uploads/...` URLs instead of uploading to Cloudinary

### Deployments
- Frontend pushed to `Matrix` branch on GitHub (auto-deploys via Vercel)
- Backend pushed to `zchat2.0` branch on GitHub + Gigalixir deploy

## Fixed Bugs
- Neon-green default glow on all users
- Post creation showing "?" instead of title
- Like wave toggle always returning `false`
- Send DM using wrong username param
- Toast showing for sender / when already in the conversation
- Toast not respecting `duration` field (hardcoded 5s)
- Duplicate event listeners causing double toasts
- `start_conversation` 500 from unhandled match error + missing association preload
- Cloudinary 401 errors from old URLs
- Console.logs leaking sensitive info (socket URL, channel names)
- Backend `create_direct_conversation` missing `{:error, _}` branch
- Toast overflowing left on small screens

## Beefs with VibeFlow/Lingot
- No inline solutions that bypass backend ownership validation
- Route for wave viewer: `/waves/view/:username` — the `username` param is the wave creator, but wave chaining advances past that user, so `handleSendDM` must use `current.user?.username`
