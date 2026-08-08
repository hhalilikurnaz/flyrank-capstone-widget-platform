import type { GeoProvider } from "../types";

// Deterministic providers used by tests to exercise the fallback chain
// without depending on real network calls (see DESIGN.md: "mock the geo
// providers in tests").
export const alwaysUpProvider: GeoProvider = {
  name: "mock-always-up",
  async lookup() {
    return { country: "Turkiye", city: "Istanbul" };
  },
};

export const alwaysDownProvider: GeoProvider = {
  name: "mock-always-down",
  async lookup() {
    throw new Error("mock provider is down");
  },
};

export function makeToggleableProvider(name: string) {
  let up = true;
  const provider: GeoProvider = {
    name,
    async lookup() {
      if (!up) throw new Error(`${name} is down`);
      return { country: "Turkiye", city: "Istanbul" };
    },
  };
  return {
    provider,
    setUp: (value: boolean) => {
      up = value;
    },
  };
}
