import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NoShowCorrectionView from "./NoShowCorrectionView";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";

const GUID = "3f2a1b4c-1111-4222-8333-444455556666";
const LINE_A = "aaaaaaaa-1111-4222-8333-444455556666";
const LINE_B = "bbbbbbbb-1111-4222-8333-444455556666";

const mutateAsync = vi.fn();
let review: unknown = null;

vi.mock("@/services/domains/admin/hooks/useAdminNoShowCorrection", () => ({
  useQueryAdminNoShowReview: (id: string | null) => ({
    data: id && review ? { data: review } : undefined,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useMutateAdminRevertNoShow: () => ({ mutateAsync, isPending: false }),
}));

const baseReview = (over: object) => ({
  appointmentPublicId: GUID,
  salonId: 1,
  status: AppointmentStatus.NoShow,
  startTime: "2026-10-01T10:00:00Z",
  checkedInBefore: false,
  noShowRecordedAt: null,
  ownerCanUndo: false,
  cancelledLinesOverlap: false,
  depositPayments: [],
  lines: [
    { servicePublicId: LINE_A, startTime: "2026-10-01T10:00:00Z", endTime: "2026-10-01T11:00:00Z", durationMinutes: 60, price: 100000, status: 4, reopensAutomatically: false },
    { servicePublicId: LINE_B, startTime: "2026-10-01T11:00:00Z", endTime: "2026-10-01T12:00:00Z", durationMinutes: 60, price: 200000, status: 4, reopensAutomatically: false },
  ],
  ...over,
});

const lookup = () => {
  fireEvent.change(screen.getByPlaceholderText("شناسهٔ نوبت (Guid)"), { target: { value: GUID } });
  fireEvent.click(screen.getByRole("button", { name: "بررسی" }));
};

describe("NoShowCorrectionView", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("rejects a malformed id before calling the API", () => {
    review = null;
    render(<NoShowCorrectionView />);
    fireEvent.change(screen.getByPlaceholderText("شناسهٔ نوبت (Guid)"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "بررسی" }));
    expect(screen.getByText(/معتبر نیست/)).toBeTruthy();
  });

  it("never pre-selects services for a legacy row and requires a pick", () => {
    review = baseReview({ resolution: "explicitLinesRequired" });
    render(<NoShowCorrectionView />);
    lookup();
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(boxes).toHaveLength(2);
    expect(boxes.every((b) => !b.checked)).toBe(true);

    fireEvent.change(screen.getByRole("textbox", { name: /علت اصلاح/ }), { target: { value: "اشتباه ثبت شد" } });
    fireEvent.click(screen.getByRole("button", { name: /اصلاح و بازکردن نوبت/ }));
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("حداقل یک خدمت");
  });

  it("sends only the picked services for a legacy row", async () => {
    review = baseReview({ resolution: "explicitLinesRequired" });
    render(<NoShowCorrectionView />);
    lookup();
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    fireEvent.change(screen.getByRole("textbox", { name: /علت اصلاح/ }), { target: { value: "اشتباه ثبت شد" } });
    fireEvent.click(screen.getByRole("button", { name: /اصلاح و بازکردن نوبت/ }));
    await Promise.resolve();
    expect(mutateAsync).toHaveBeenCalledWith({
      appointmentPublicId: GUID,
      data: { reason: "اشتباه ثبت شد", servicePublicIds: [LINE_B] },
    });
  });

  it("sends no services for an automatic row and shows no checkboxes", async () => {
    review = baseReview({ resolution: "automatic" });
    render(<NoShowCorrectionView />);
    lookup();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    fireEvent.change(screen.getByRole("textbox", { name: /علت اصلاح/ }), { target: { value: "دلیل" } });
    fireEvent.click(screen.getByRole("button", { name: /اصلاح و بازکردن نوبت/ }));
    await Promise.resolve();
    expect(mutateAsync).toHaveBeenCalledWith({ appointmentPublicId: GUID, data: { reason: "دلیل" } });
  });

  it("shows the reason form and the action button for a real NoShow (status 4)", () => {
    expect(AppointmentStatus.NoShow).toBe(4);
    review = baseReview({ resolution: "automatic", status: AppointmentStatus.NoShow });
    render(<NoShowCorrectionView />);
    lookup();
    expect(screen.getByRole("textbox", { name: /علت اصلاح/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /اصلاح و بازکردن نوبت/ })).toBeTruthy();
  });

  it("does not show the form for CheckedIn (status 5), even if the resolution were not notNoShow", () => {
    expect(AppointmentStatus.CheckedIn).toBe(5);
    review = baseReview({ resolution: "automatic", status: AppointmentStatus.CheckedIn });
    render(<NoShowCorrectionView />);
    lookup();
    expect(screen.queryByRole("button", { name: /اصلاح و بازکردن نوبت/ })).toBeNull();
    expect(screen.queryByRole("textbox", { name: /علت اصلاح/ })).toBeNull();
  });

  it("offers no correction when the appointment is not a no-show", () => {
    review = baseReview({ resolution: "notNoShow", status: AppointmentStatus.Scheduled });
    render(<NoShowCorrectionView />);
    lookup();
    expect(screen.queryByRole("button", { name: /اصلاح و بازکردن نوبت/ })).toBeNull();
  });
});
