export function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-28" />
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700/50 rounded-full w-20" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-1/2" />
      </div>
      <div className="h-40 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-3" />
      <div className="flex gap-4">
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/80 overflow-hidden animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-1/3" />
        <div className="h-px bg-gray-100 dark:bg-gray-700/50" />
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

export function StorePowerUpSkeleton() {
  return (
    <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-zinc-800/80 p-5 animate-pulse">
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-1/4" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-2/3" />
        </div>
        <div className="shrink-0 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-14" />
        </div>
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3" />
      </div>
      <div className="flex gap-3 mt-4">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1" />
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1" />
      </div>
    </div>
  );
}
