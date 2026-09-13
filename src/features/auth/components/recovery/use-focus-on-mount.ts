"use client";

import { useEffect, useRef } from "react";

/**
 * Swapping a form out for a panel unmounts the button that was focused, which drops focus
 * to `<body>`: a screen reader announces nothing and a keyboard user has to tab from the
 * top of the page again to reach whatever the panel offers. Moving focus onto the panel
 * reads the outcome out and leaves the keyboard next to the remaining actions.
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return ref;
}
