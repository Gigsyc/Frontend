"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DEFAULT_STATE, parseDiscoverParams, serializeDiscoverParams, type DiscoverState } from "./filters";

/**
 * Discover filters live in the URL. `resetCount` bumps on clear so uncontrolled inputs (the debounced
 * search box) can remount instead of fighting the router.
 */
export function useDiscoverFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [resetCount, setResetCount] = useState(0);

  const state = useMemo(() => parseDiscoverParams(searchParams), [searchParams]);

  const replace = useCallback(
    (next: DiscoverState) => {
      const qs = serializeDiscoverParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const update = useCallback((patch: Partial<DiscoverState>) => replace({ ...state, ...patch }), [replace, state]);

  const clear = useCallback(() => {
    replace(DEFAULT_STATE);
    setResetCount((c) => c + 1);
  }, [replace]);

  return { state, update, clear, resetCount };
}
