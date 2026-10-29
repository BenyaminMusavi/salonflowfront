import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// The map is lazy and needs WebGL: replace it with a stub that can "pick" and "fail".
vi.mock("./LocationPickerMap", () => ({
  default: ({ onPick, onFail }: { onPick: (lat: number, lng: number) => void; onFail: (r: string) => void }) => (
    <div>
      <button onClick={() => onPick(35.7219, 51.3347)}>stub-pick</button>
      <button onClick={() => onFail("style-error")}>stub-fail</button>
    </div>
  ),
}));

const setConfigured = async (configured: boolean) => {
  vi.resetModules();
  vi.doMock("@/shared/map/mapConfig", () => ({ isMapConfigured: configured }));
  return (await import("./BranchLocationField")).default;
};

afterEach(() => {
  vi.doUnmock("@/shared/map/mapConfig");
  vi.unstubAllGlobals();
});

describe("BranchLocationField — map configured", () => {
  it("fills the coordinates when the owner taps the map, and can clear them", async () => {
    const Field = await setConfigured(true);
    const onChange = vi.fn();
    const { rerender } = render(<Field latitude={null} longitude={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /انتخاب روی نقشه/ }));
    fireEvent.click(await screen.findByText("stub-pick"));
    expect(onChange).toHaveBeenLastCalledWith(35.7219, 51.3347);

    rerender(<Field latitude={35.7219} longitude={51.3347} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /پاک کردن موقعیت/ }));
    expect(onChange).toHaveBeenLastCalledWith(null, null);
  });

  it("falls back to manual entry when the map fails to load, without blocking the form", async () => {
    const Field = await setConfigured(true);
    render(<Field latitude={null} longitude={null} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /انتخاب روی نقشه/ }));
    fireEvent.click(await screen.findByText("stub-fail"));

    expect(await screen.findByText(/نقشه بارگذاری نشد/)).toBeTruthy();
    expect(screen.getByPlaceholderText("35.7219")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /انتخاب روی نقشه/ })).toBeNull();
  });
});

describe("BranchLocationField — no map configured", () => {
  it("offers manual entry and reports half-filled or invalid coordinates", async () => {
    const Field = await setConfigured(false);
    const onChange = vi.fn();
    const { rerender } = render(<Field latitude={null} longitude={null} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("35.7219"), { target: { value: "35.7" } });
    expect(onChange).toHaveBeenLastCalledWith(35.7, null);

    rerender(<Field latitude={35.7} longitude={null} onChange={onChange} />);
    expect(screen.getByText(/هر دو وارد کنید/)).toBeTruthy();

    rerender(<Field latitude={95} longitude={51} onChange={onChange} />);
    expect(screen.getByText(/عرض جغرافیایی باید بین/)).toBeTruthy();
  });

  it("keeps what the owner typed while it is not a number yet (no NaN rewrite) and reports it", async () => {
    const Field = await setConfigured(false);
    function Harness() {
      const [lat, setLat] = React.useState<number | null>(null);
      return <Field latitude={lat} longitude={null} onChange={(a) => setLat(a)} />;
    }
    render(<Harness />);
    const input = screen.getByPlaceholderText("35.7219") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "-" } });
    expect(input.value).toBe("-");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(input.value).toBe("abc");
    expect(screen.getAllByText(/نامعتبر|هر دو وارد کنید/).length).toBeGreaterThan(0);
  });

  it("shows a clear message when GPS permission is denied and keeps the manual inputs", async () => {
    const Field = await setConfigured(false);
    vi.stubGlobal("navigator", {
      ...navigator,
      geolocation: { getCurrentPosition: (_ok: unknown, fail: (e: { code: number }) => void) => fail({ code: 1 }) },
    });
    render(<Field latitude={null} longitude={null} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /موقعیت فعلی من/ }));

    expect(await screen.findByText(/دسترسی به موقعیت داده نشد/)).toBeTruthy();
    expect(screen.getByPlaceholderText("35.7219")).toBeTruthy();
  });

  it("uses the GPS position only after the explicit tap", async () => {
    const Field = await setConfigured(false);
    const getCurrentPosition = vi.fn((ok: (p: { coords: { latitude: number; longitude: number } }) => void) =>
      ok({ coords: { latitude: 35.72190012, longitude: 51.33470034 } })
    );
    vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition } });
    const onChange = vi.fn();
    render(<Field latitude={null} longitude={null} onChange={onChange} />);

    expect(getCurrentPosition).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /موقعیت فعلی من/ }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(35.7219, 51.3347));
  });
});
