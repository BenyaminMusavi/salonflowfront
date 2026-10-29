import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import GenderAudienceBadge from "./GenderAudienceBadge";

describe("GenderAudienceBadge", () => {
  it("shows an icon and a text label for each real audience", () => {
    const { container, rerender } = render(<GenderAudienceBadge audience={2} />);
    expect(screen.getByText("بانوان")).toBeTruthy();
    expect(container.querySelector("svg")).not.toBeNull();

    rerender(<GenderAudienceBadge audience={1} />);
    expect(screen.getByText("آقایان")).toBeTruthy();

    rerender(<GenderAudienceBadge audience={3} />);
    expect(screen.getByText("بانوان و آقایان")).toBeTruthy();
  });

  it("renders nothing when the audience is unknown instead of guessing", () => {
    const { container } = render(<GenderAudienceBadge audience={null} />);
    expect(container.firstChild).toBeNull();
  });
});
