import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./ThemeContext";

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("ThemeContext", () => {
  it("toggles the theme and persists it to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button");
    const initial = button.textContent;
    await user.click(button);

    expect(button.textContent).not.toBe(initial);
    expect(localStorage.getItem("wp_theme")).toBe(button.textContent);
  });

  it("toggles the .dark class on the document root", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button"));

    const isDark = screen.getByRole("button").textContent === "dark";
    expect(document.documentElement.classList.contains("dark")).toBe(isDark);
  });
});
