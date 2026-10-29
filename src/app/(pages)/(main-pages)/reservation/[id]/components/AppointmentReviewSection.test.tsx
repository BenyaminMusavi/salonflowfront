import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AppointmentStatus, ReviewModerationStatus } from "@/services/common/enums/domain-enums";

type TQuery = { data?: { data: unknown } | ""; isLoading: boolean; isError: boolean; refetch: () => void };
let query: TQuery;
let lastQueriedId: number | undefined;
const createReview = vi.fn();
const editReview = vi.fn();

vi.mock("@/services/domains/reviews/hooks/useQueryReviewById", () => ({
  useQueryMyReviewForAppointment: (id: number | undefined) => {
    lastQueriedId = id;
    return query;
  },
}));
vi.mock("@/services/domains/reviews/hooks/useMutateReviews", () => ({
  useMutateCreateReview: () => ({ mutateAsync: createReview, isPending: false }),
  useMutateEditReview: () => ({ mutateAsync: editReview, isPending: false }),
}));

import AppointmentReviewSection from "./AppointmentReviewSection";

const review = (moderationStatus: number, extra: Record<string, unknown> = {}) => ({
  data: { id: 77, rating: 4, comment: "خوب بود", moderationStatus, ...extra },
});

beforeEach(() => {
  vi.clearAllMocks();
  lastQueriedId = undefined;
  query = { data: "", isLoading: false, isError: false, refetch: vi.fn() };
  createReview.mockResolvedValue({});
  editReview.mockResolvedValue({});
});

const stars = (n: number) => screen.getByRole("button", { name: `${n} ستاره` });

describe("AppointmentReviewSection", () => {
  it("shows nothing until the appointment is completed, and does not even ask for the review", () => {
    const { container } = render(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Scheduled} />);

    expect(container.firstChild).toBeNull();
    expect(lastQueriedId).toBeUndefined();
  });

  it("lets the customer review a completed appointment — with the NUMERIC appointment id, never the Guid", async () => {
    render(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Completed} />);

    fireEvent.click(stars(5));
    fireEvent.change(screen.getByPlaceholderText("نظر شما (اختیاری)"), { target: { value: "  عالی  " } });
    fireEvent.click(screen.getByRole("button", { name: "ارسال نظر" }));

    await waitFor(() => expect(createReview).toHaveBeenCalledTimes(1));
    expect(createReview).toHaveBeenCalledWith({ appointmentId: 12, targetType: 1, rating: 5, comment: "عالی" });
    expect(lastQueriedId).toBe(12);
  });

  it("keeps «ارسال نظر» disabled until a star is chosen", () => {
    render(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Completed} />);

    expect((screen.getByRole("button", { name: "ارسال نظر" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(stars(3));
    expect((screen.getByRole("button", { name: "ارسال نظر" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows the API error when submitting fails", async () => {
    createReview.mockRejectedValue({ response: { data: { errors: [{ field: "review", message: "برای این رزرو قبلاً نظر ثبت شده است." }] } } });
    render(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Completed} />);

    fireEvent.click(stars(4));
    fireEvent.click(screen.getByRole("button", { name: "ارسال نظر" }));

    expect(await screen.findByText(/قبلاً نظر ثبت شده است|ثبت نظر ناموفق بود/)).toBeTruthy();
  });

  it("never offers the form while the server answer is loading, or when it could not be fetched", () => {
    query = { ...query, isLoading: true };
    const { rerender } = render(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Completed} />);
    expect(screen.queryByRole("button", { name: "ارسال نظر" })).toBeNull();

    query = { ...query, isLoading: false, isError: true };
    rerender(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Completed} />);
    expect(screen.queryByRole("button", { name: "ارسال نظر" })).toBeNull();
    fireEvent.click(screen.getByText("تلاش دوباره"));
    expect(query.refetch).toHaveBeenCalled();
  });

  it("an already-submitted review (from the server, on any device) replaces the form: pending", () => {
    query = { ...query, data: review(ReviewModerationStatus.Pending) };
    render(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Completed} />);

    expect(screen.getByText("در انتظار تأیید")).toBeTruthy();
    expect(screen.getByText(/پس از تأیید مدیر پلتفرم نمایش داده می‌شود/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "ارسال نظر" })).toBeNull();
  });

  it("an approved review is shown read-only", () => {
    query = { ...query, data: review(ReviewModerationStatus.Approved) };
    render(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Completed} />);

    expect(screen.getByText("تأیید شده")).toBeTruthy();
    expect(screen.getByText("خوب بود")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /ارسال/ })).toBeNull();
  });

  it("a rejected review is edited and resubmitted (a second POST would be refused as a duplicate)", async () => {
    query = { ...query, data: review(ReviewModerationStatus.Rejected) };
    render(<AppointmentReviewSection appointmentId={12} status={AppointmentStatus.Completed} />);

    expect(screen.getByText(/تأیید نشد/)).toBeTruthy();
    expect((screen.getByPlaceholderText("نظر شما (اختیاری)") as HTMLTextAreaElement).value).toBe("خوب بود");
    fireEvent.click(stars(2));
    fireEvent.click(screen.getByRole("button", { name: "ارسال دوباره" }));

    await waitFor(() => expect(editReview).toHaveBeenCalledTimes(1));
    expect(editReview).toHaveBeenCalledWith({ id: 77, body: { rating: 2, comment: "خوب بود" }, appointmentId: 12 });
    expect(createReview).not.toHaveBeenCalled();
  });
});
