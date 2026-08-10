import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider, useLanguage } from "./LanguageContext";

function Probe() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="nav-features">{t.nav.features}</span>
      <button type="button" onClick={() => setLanguage(language === "en" ? "tr" : "en")}>
        toggle
      </button>
    </div>
  );
}

afterEach(() => {
  localStorage.clear();
});

describe("LanguageContext", () => {
  it("switches the active dictionary and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("lang").textContent).toBe("en");
    expect(screen.getByTestId("nav-features").textContent).toBe("Features");

    await user.click(screen.getByRole("button"));

    expect(screen.getByTestId("lang").textContent).toBe("tr");
    expect(screen.getByTestId("nav-features").textContent).toBe("Özellikler");
    expect(localStorage.getItem("wp_lang")).toBe("tr");
  });
});
