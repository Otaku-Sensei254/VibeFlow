# Fix Vercel Build Failure — Unused `useState` Import

## Root Cause

The Vercel production build failed at the ESLint stage. Summary of the chain:

1. Vercel sets `CI=true` by default in the build environment.
2. With `CI=true`, `react-scripts build` (Create React App v5) runs ESLint during the build and treats **all warnings as errors** (`--max-warnings=0`).
3. The build log shows the single failure:

   ```
   src/components/comments/CurrentCommentSheet.js
     Line 1:10:  'useState' is defined but never used  no-unused-vars
   ```

4. `useState` is imported on line 1 of `CurrentCommentSheet.js` but is never referenced anywhere else in the file (confirmed via search — only 1 occurrence, the import itself).

This is not a logic/syntax problem in the React code; it is a strict ESLint `no-unused-vars` violation surfacing only because CI mode escalates the warning to a hard error.

## Fix

Remove `useState` from the import in `src/components/comments/CurrentCommentSheet.js` line 1.

- **Before:** `import { useState, useEffect } from "react";`
- **After:** `import { useEffect } from "react";`

## Verification

After editing:

```sh
npm run build
```

Expected: build succeeds (no ESLint failures).

## Non-Goals / Notes

- All the `npm warn deprecated` lines in the build log are just warnings, not failures — they do not block the build.
- No other ESLint errors or warnings were reported for this file or any other file in this build run, so this single change should resolve the failure.
