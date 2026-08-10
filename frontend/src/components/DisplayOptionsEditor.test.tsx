import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DisplayOptionsEditor } from "./DisplayOptionsEditor";
import { defaultDisplayOptions } from "@/lib/widgetDraft";

describe("DisplayOptionsEditor", () => {
  it("calls onChange with the new position when a position button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DisplayOptionsEditor value={defaultDisplayOptions} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /center/i }));

    expect(onChange).toHaveBeenCalledWith({ ...defaultDisplayOptions, position: "center" });
  });

  it("calls onChange with the new theme when the dark toggle is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DisplayOptionsEditor value={defaultDisplayOptions} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /dark/i }));

    expect(onChange).toHaveBeenCalledWith({ ...defaultDisplayOptions, theme: "dark" });
  });

  it("does not mutate the value it was given", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const value = { ...defaultDisplayOptions };
    render(<DisplayOptionsEditor value={value} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /soft/i }));

    expect(value.shadow).toBe(defaultDisplayOptions.shadow);
  });
});
