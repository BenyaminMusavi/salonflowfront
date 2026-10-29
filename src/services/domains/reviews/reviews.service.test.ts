import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/services/common/http/axios-instance", () => ({ default: { get: (...a: unknown[]) => get(...a), post: (...a: unknown[]) => post(...a), put: vi.fn(), delete: vi.fn() } }));

import reviewsService from "./reviews.service";

beforeEach(() => {
  vi.clearAllMocks();
  get.mockResolvedValue({});
  post.mockResolvedValue({});
});

describe("reviewsService — contract with the backend", () => {
  it("creates a review with the numeric appointment id at POST /api/reviews", async () => {
    await reviewsService.create({ appointmentId: 12, targetType: 1, rating: 5, comment: "عالی" });

    expect(post).toHaveBeenCalledWith("/api/reviews", { appointmentId: 12, targetType: 1, rating: 5, comment: "عالی" });
  });

  it("reads the caller's own review of an appointment from the server", async () => {
    await reviewsService.getMineForAppointment(12);

    expect(get).toHaveBeenCalledWith("/api/reviews/by-appointment/12");
  });

  it("lists a salon's public reviews by numeric salon id with paging", async () => {
    await reviewsService.listBySalon({ salonId: 42, page: 2, pageSize: 10 });

    expect(get).toHaveBeenCalledWith("/api/reviews", { params: { salonId: 42, page: 2, pageSize: 10 } });
  });

  it("reads the admin queue and moderates by review id", async () => {
    await reviewsService.listPending({ page: 3 });
    await reviewsService.approve(9);
    await reviewsService.reject(9);
    await reviewsService.approveReply(9);
    await reviewsService.rejectReply(9);

    expect(get).toHaveBeenCalledWith("/api/reviews/pending", { params: { page: 3, pageSize: 20 } });
    expect(post.mock.calls.map((c) => c[0])).toEqual([
      "/api/reviews/9/approve",
      "/api/reviews/9/reject",
      "/api/reviews/9/reply/approve",
      "/api/reviews/9/reply/reject",
    ]);
  });
});
