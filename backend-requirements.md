# Backend (Phoenix) Requirements for Phase 1 Frontend Changes

## 1. Stats Brief Endpoint
- **Route**: `GET /api/v1/stats/brief`
- **Response**: `{ user_count: Int, post_count: Int, online_now: Int }`
- **Used by**: Home.js landing page (dynamic "X creators" + "Y online now")
- **Notes**: Online now can be derived from presence state

## 2. User Ping / Streak Endpoints
- **Route**: `POST /api/v1/users/ping`
- **Auth**: Required
- **Action**: Updates `last_active_at` on user to now(). Backend streak logic:
  - If last_active_at was yesterday → increment `streak_count`
  - If last_active_at was today → no change
  - If last_active_at is older → reset streak_count to 1
- **Response**: `{ ok: true }`

- **Route**: `GET /api/v1/users/streak`
- **Auth**: Required  
- **Response**: `{ current_streak: Int, longest_streak: Int }`

## 3. Onboarding Follow Suggestions
- **Route**: `GET /api/v1/users/suggestions?limit=8`
- **Auth**: Required (or optional — returns users sorted by follower count, excluding current user)
- **Response**: `{ users: [{ id, username, avatar_url, bio }] }`

- **Route**: `POST /api/v1/users/batch-follow`
- **Auth**: Required
- **Body**: `{ usernames: ["user1", "user2"] }`
- **Response**: `{ ok: true }`

## 4. Referral / Invite System
- **Schema change**: Add `invite_code` (string, unique, indexed) and `referred_by_id` (nullable FK to users) to User model
- **On register**: Generate unique `invite_code` for new user. If `invite_code` param present in registration body, set `referred_by_id` to the user who owns that code

- **Route**: `POST /api/v1/invite/claim`
- **Auth**: Required
- **Body**: `{ code: "username" }`
- **Action**: Award 50 pts to inviter + 50 pts to claimer (one-time only)
- **Response**: `{ ok: true, points_awarded: 50 }`

- **Route**: `GET /api/v1/users/profile/:username`
- **Notes**: Already exists? Used by InviteLanding page to show inviter info

## 5. Points Expansion
- **New point award events** (via existing `points_awarded` channel or added to existing actions):
  - First post of the day: +10 pts (check if user has any post today)
  - First comment of the day: +5 pts
  - Daily active (on `/users/ping` if streak_day > 0): +3 pts
  - Complete profile (has bio AND avatar_url): +20 pts (one-time, check flag)
  - Invite friend (when referred user registers): +50 pts
  - 3-day streak: bonus +15 pts (award on day 3)
  - 7-day streak: bonus +50 pts
  - 30-day streak: bonus +300 pts

## 6. Bottles (Ephemeral Anonymous Messages)
- **Schema**: `Bottle` — `id`, `content` (string, max 280), `inserted_at`, `expires_at` (inserted_at + 24h), `reply_count` (integer, default 0), `user_id` (nullable FK to users)
- **Migration**: Add `bottles` table

- **Route**: `GET /api/v1/bottles`
- **Auth**: Optional (public read for display)
- **Response**: `{ bottles: [{ id, content, expires_at, reply_count }] }`
- **Filter**: Only return bottles where `expires_at > now()`, ordered by `inserted_at DESC`, paginated

- **Route**: `POST /api/v1/bottles`
- **Auth**: Required
- **Body**: `{ content: "string" }`
- **Action**: Create bottle, set `expires_at = inserted_at + 24h`
- **Response**: `{ bottle: { id, content, expires_at } }`

- **Route**: `POST /api/v1/bottles/:id/reply`
- **Auth**: Required
- **Body**: `{ content: "string" }`
- **Action**: Increment bottle's `reply_count`, create a message in a "bottle" type conversation (or just increment counter + store reply for now)
- **Response**: `{ ok: true }`

- **Cron**: Delete bottles where `expires_at < now()` (run every hour)

- **Frontend fallback**: Bottles page shows empty state UI gracefully if endpoints 404/500

## Notes
- All frontend changes handle 404/500 errors gracefully — the app won't break if endpoints don't exist yet
- Frontend shows user-friendly empty/fallback states for all new features
- The invite system uses `invite_code = username` as a simple convention (no separate code generation needed)
