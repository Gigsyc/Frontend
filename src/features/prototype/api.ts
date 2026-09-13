import { store } from "@/lib/mock/store";

/** Demo-only controls surfaced in Settings pages. Not part of the product. */
export const prototypeApi = {
  resetDemoData: () => store.reset(),
  getChaos: () => store.chaos,
  setChaos: (on: boolean) => { store.chaos = on; },
};
