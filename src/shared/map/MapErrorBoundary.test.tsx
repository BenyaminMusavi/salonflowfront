import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MapErrorBoundary from "./MapErrorBoundary";

function Boom(): never {
  throw new Error("ChunkLoadError: map chunk failed");
}

describe("MapErrorBoundary", () => {
  it("keeps a map chunk failure inside the map area and reports it once", () => {
    const onError = vi.fn();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <div>
        <p>فهرست سالن‌ها</p>
        <MapErrorBoundary fallback={<p>نقشه در دسترس نیست</p>} onError={onError}>
          <Boom />
        </MapErrorBoundary>
      </div>
    );

    expect(screen.getByText("نقشه در دسترس نیست")).toBeTruthy();
    expect(screen.getByText("فهرست سالن‌ها")).toBeTruthy();
    expect(onError).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("renders the map normally when nothing fails", () => {
    render(
      <MapErrorBoundary fallback={<p>fallback</p>}>
        <p>map</p>
      </MapErrorBoundary>
    );
    expect(screen.getByText("map")).toBeTruthy();
    expect(screen.queryByText("fallback")).toBeNull();
  });
});
