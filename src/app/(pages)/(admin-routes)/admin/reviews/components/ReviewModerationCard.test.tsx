import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReviewModerationStatus } from "@/services/common/enums/domain-enums";
import type { IAdminPendingReview } from "@/services/domains/reviews/types/reviews.type";

const approveReview = vi.fn();
const rejectReview = vi.fn();
const approveReply = vi.fn();
const rejectReply = vi.fn();

vi.mock("@/services/domains/reviews/hooks/useMutateAdminReviewModeration", () => ({
  useMutateApproveReview: () => ({ mutateAsync: approveReview, isPending: false }),
  useMutateRejectReview: () => ({ mutateAsync: rejectReview, isPending: false }),
  useMutateApproveReviewReply: () => ({ mutateAsync: approveReply, isPending: false }),
  useMutateRejectReviewReply: () => ({ mutateAsync: rejectReply, isPending: false }),
}));

import { ReviewModerationCard } from "./ReviewModerationCard";

const make = (overrides: Partial<IAdminPendingReview> = {}): IAdminPendingReview => ({
  id: 9,
  moderationStatus: ReviewModerationStatus.Pending,
  rating: 5,
  comment: "عالی",
  customerId: 3,
  customerName: "مشتری",
  salonId: 1,
  salonName: "سالن رز",
  reply: null,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  [approveReview, rejectReview, approveReply, rejectReply].forEach((m) => m.mockResolvedValue({}));
});

describe("ReviewModerationCard", () => {
  it("a pending review can be approved", async () => {
    render(<ReviewModerationCard review={make()} />);

    fireEvent.click(screen.getByText("تأیید نظر"));

    await waitFor(() => expect(approveReview).toHaveBeenCalledWith(9));
  });

  it("rejecting asks for a confirmation first", async () => {
    render(<ReviewModerationCard review={make()} />);

    fireEvent.click(screen.getByText("رد نظر"));
    expect(rejectReview).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("مطمئنم، رد کن"));

    await waitFor(() => expect(rejectReview).toHaveBeenCalledWith(9));
  });

  it("shows the API error instead of failing silently", async () => {
    approveReview.mockRejectedValue({ response: { data: { errors: [{ field: "review", message: "این نظر قبلاً تایید شده است." }] } } });
    render(<ReviewModerationCard review={make()} />);

    fireEvent.click(screen.getByText("تأیید نظر"));

    expect((await screen.findByRole("alert")).textContent).toMatch(/تایید شده است|ناموفق/);
  });

  it("an approved review waiting only for its reply offers no review actions — just the reply's", async () => {
    render(
      <ReviewModerationCard
        review={make({ moderationStatus: ReviewModerationStatus.Approved, reply: { body: "ممنون از شما", moderationStatus: ReviewModerationStatus.Pending } })}
      />
    );

    expect(screen.queryByText("تأیید نظر")).toBeNull();
    expect(screen.queryByText("رد نظر")).toBeNull();
    expect(screen.getByText(/فقط پاسخ سالن در انتظار بررسی است/)).toBeTruthy();

    fireEvent.click(screen.getByText("تأیید پاسخ"));
    await waitFor(() => expect(approveReply).toHaveBeenCalledWith(9));
    expect(approveReview).not.toHaveBeenCalled();
  });

  it("a pending reply can be rejected after confirming", async () => {
    render(<ReviewModerationCard review={make({ reply: { body: "پاسخ", moderationStatus: ReviewModerationStatus.Pending } })} />);

    fireEvent.click(screen.getByText("رد پاسخ"));
    fireEvent.click(screen.getByText("مطمئنم، رد کن"));

    await waitFor(() => expect(rejectReply).toHaveBeenCalledWith(9));
  });

  it("an already decided reply shows its status, not buttons", () => {
    render(<ReviewModerationCard review={make({ reply: { body: "پاسخ", moderationStatus: ReviewModerationStatus.Approved } })} />);

    expect(screen.getByText("پاسخ تأیید شده است.")).toBeTruthy();
    expect(screen.queryByText("تأیید پاسخ")).toBeNull();
  });
});
