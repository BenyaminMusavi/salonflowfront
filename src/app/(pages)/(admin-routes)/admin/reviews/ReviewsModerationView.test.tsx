import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

type TQuery = {
  data?: { data: { items: { id: number }[]; page: number; totalPages: number; hasNext: boolean; hasPrevious: boolean } };
  isLoading: boolean;
  isError: boolean;
};
let query: TQuery;
let lastParams: { page?: number; pageSize?: number } | undefined;

vi.mock("@/services/domains/reviews/hooks/useQueryAdminPendingReviews", () => ({
  useQueryAdminPendingReviews: (params: { page?: number; pageSize?: number }) => {
    lastParams = params;
    return query;
  },
}));
vi.mock("./components/ReviewModerationCard", () => ({
  ReviewModerationCard: ({ review }: { review: { id: number } }) => <div data-testid="card">{review.id}</div>,
}));
vi.mock("../_components/AdminPagination", () => ({
  AdminPagination: ({ onPageChange }: { onPageChange: (p: number) => void }) => <button onClick={() => onPageChange(2)}>page-2</button>,
}));

import ReviewsModerationView from "./ReviewsModerationView";

const page = (items: number[], extra: Record<string, unknown> = {}) => ({
  data: { items: items.map((id) => ({ id })), page: 1, totalPages: 1, hasNext: false, hasPrevious: false, ...extra },
});

beforeEach(() => {
  query = { data: page([]), isLoading: false, isError: false };
  lastParams = undefined;
});

describe("ReviewsModerationView", () => {
  it("requests the pending queue, 20 per page", () => {
    render(<ReviewsModerationView />);

    expect(lastParams).toEqual({ page: 1, pageSize: 20 });
  });

  it("an empty queue and a failed request are different messages", () => {
    const { rerender } = render(<ReviewsModerationView />);
    expect(screen.getByText("نظر در انتظار تأییدی وجود ندارد")).toBeTruthy();

    query = { ...query, isError: true };
    rerender(<ReviewsModerationView />);
    expect(screen.getByText("دریافت لیست نظرات با خطا مواجه شد.")).toBeTruthy();
  });

  it("lists every item of the queue, and pages through it", () => {
    query = { ...query, data: page([5, 6, 7], { totalPages: 2, hasNext: true }) };
    render(<ReviewsModerationView />);

    expect(screen.getAllByTestId("card").map((c) => c.textContent)).toEqual(["5", "6", "7"]);
    fireEvent.click(screen.getByText("page-2"));
    expect(lastParams).toEqual({ page: 2, pageSize: 20 });
  });

  it("shows placeholders, not the empty message, while loading", () => {
    query = { data: undefined, isLoading: true, isError: false };
    render(<ReviewsModerationView />);

    expect(screen.queryByText("نظر در انتظار تأییدی وجود ندارد")).toBeNull();
  });
});
