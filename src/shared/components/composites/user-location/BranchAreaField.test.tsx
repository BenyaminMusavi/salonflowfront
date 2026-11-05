import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

vi.mock("./LocationPickerSheet", () => ({
  default: ({ open, onPick }: { open: boolean; onPick: (c: unknown, d: unknown) => void }) =>
    open ? (
      <button
        type="button"
        onClick={() =>
          onPick(
            { publicId: "c-teh", name: "تهران", provincePublicId: "p", provinceName: "تهران", latitude: 35.69, longitude: 51.39, hasDistricts: true },
            { publicId: "d-1", name: "نارمک", latitude: 35.73, longitude: 51.5 }
          )
        }
      >
        pick-narmak
      </button>
    ) : null,
}));

import BranchAreaField, { type IBranchAreaValue } from "./BranchAreaField";

function Harness({ initial, onValue }: { initial: IBranchAreaValue; onValue: (v: IBranchAreaValue) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <BranchAreaField
      value={value}
      onChange={(v) => {
        setValue(v);
        onValue(v);
      }}
    />
  );
}

const legacy: IBranchAreaValue = { city: "تهران", cityPublicId: null, districtPublicId: null, districtName: null };

describe("BranchAreaField", () => {
  it("an older text-only branch keeps its text and can be linked from the list", () => {
    const onValue = vi.fn();
    render(<Harness initial={legacy} onValue={onValue} />);
    expect((screen.getByLabelText("شهر") as HTMLInputElement).value).toBe("تهران");

    fireEvent.click(screen.getByRole("button", { name: /انتخاب شهر و محله از فهرست/ }));
    fireEvent.click(screen.getByRole("button", { name: "pick-narmak" }));

    expect(onValue).toHaveBeenLastCalledWith({ city: "تهران", cityPublicId: "c-teh", districtPublicId: "d-1", districtName: "نارمک" });
    expect(screen.getByText("محله‌ی نارمک، تهران")).toBeTruthy();
  });

  it("typing a different city drops the link (no stale district is ever sent)", () => {
    const onValue = vi.fn();
    render(<Harness initial={{ city: "تهران", cityPublicId: "c-teh", districtPublicId: "d-1", districtName: "نارمک" }} onValue={onValue} />);

    fireEvent.change(screen.getByLabelText("شهر"), { target: { value: "کرج" } });

    expect(onValue).toHaveBeenLastCalledWith({ city: "کرج", cityPublicId: null, districtPublicId: null, districtName: null });
  });
});
