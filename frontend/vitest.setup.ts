import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia — ThemeContext's prefers-color-scheme
// fallback needs it to exist, even if the tests always take the
// localStorage branch.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

