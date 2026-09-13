/** Shared motion tokens — one easing, one stagger, so every list in the product moves the same way. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Props for a staggered list item on first load. Capped at 8 items so long lists don't feel slow. */
export function staggerItem(index: number) {
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: EASE, delay: Math.min(index, 8) * 0.03 },
  };
}
