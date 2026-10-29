import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

type TQuery = {
  data?: { data: { items: unknown[]; totalCount: number } };
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
};
let query: TQuery;
let lastParams: { salonId: number | undefined; page?: number; pageSize?: number } | undefined;

vi.mock("@/services/domains/reviews/hooks/useQuerySalonReviews", () => ({
  useQuerySalonReviews: (salonId: number | undefined, params?: { page?: number; pageSize?: number }) => {
    lastParams = { salonId, ...params };
    return query;
  },
}));

import SalonReviewsSection from "./SalonReviewsSection";

const item = (id: number, extra: Record<string, unknown> = {}) => ({
  id,
  rating: 4,
  comment: `نظر ${id}`,
  moderationStatus: 2,
  isVerified: true,
  customerName: "نیلوفر",
  ...extra,
});

beforeEach(() => {
  query = { data: { data: { items: [], totalCount: 0 } }, isLoading: false, isError: false, isFetching: false };
  lastParams = undefined;
});

describe("SalonReviewsSection", () => {
  it("asks for the salon's reviews by its numeric id", () => {
    render(<SalonReviewsSection salonId={42} />);

    expect(lastParams).toMatchObject({ salonId: 42, page: 1, pageSize: 10 });
  });

  it("tells loading, no reviews, an error and missing id apart", () => {
    const { rerender } = render(<SalonReviewsSection salonId={42} />);
    expect(screen.getByText("هنوز نظری ثبت نشده است.")).toBeTruthy();

    query = { ...query, isLoading: true };
    rerender(<SalonReviewsSection salonId={42} />);
    expect(screen.getByText(/در حال بارگذاری نظرات/)).toBeTruthy();

    query = { ...query, isLoading: false, isError: true };
    rerender(<SalonReviewsSection salonId={42} />);
    expect(screen.getByText("خطا در دریافت نظرات")).toBeTruthy();

    rerender(<SalonReviewsSection salonId={undefined} />);
    expect(screen.getByText(/شناسه عددی سالن/)).toBeTruthy();
  });

  it("shows approved reviews with the reply only when the API sent it", () => {
    query = {
      ...query,
      data: { data: { items: [item(1), item(2, { reply: { body: "ممنون از شما", moderationStatus: 2 } })], totalCount: 2 } },
    };
    render(<SalonReviewsSection salonId={42} />);

    expect(screen.getByText("نظر 1")).toBeTruthy();
    expect(screen.getByText("نظر 2")).toBeTruthy();
    expect(screen.getAllByText("نیلوفر")).toHaveLength(2);
    expect(screen.getAllByText("پاسخ سالن")).toHaveLength(1);
    expect(screen.queryByText("نمایش نظرات بیشتر")).toBeNull();
  });

  it("reviews beyond the first 10 are reachable through «نمایش نظرات بیشتر»", () => {
    query = { ...query, data: { data: { items: Array.from({ length: 10 }, (_, i) => item(i + 1)), totalCount: 25 } } };
    render(<SalonReviewsSection salonId={42} />);

    fireEvent.click(screen.getByText("نمایش نظرات بیشتر"));

    expect(lastParams?.pageSize).toBe(20);
  });
});
