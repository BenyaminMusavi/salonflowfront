import { describe, expect, it, vi } from "vitest";
import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import salonService from "./salon.service";

// Regression coverage for the booking-wizard "step 6/7" bug: the customer booking wizard's
// time-slot step used to call GET /api/salons/available-slots, an endpoint the backend
// removed (SF-QA-022) because its logic duplicated the [AllowAnonymous] GET /api/booking/slots
// behind the same AvailabilityEngine. Calling the removed endpoint errored for every visitor
// (not only unauthenticated ones), which showed up as "دریافت ساعت‌های خالی ناموفق بود" blocking
// the wizard. This asserts the service now hits the endpoint that actually exists, sends the
// offeringPublicIds that endpoint requires (not the old serviceTypePublicIds), and maps its
// flat UTC start/end response back into the { slots: [{ time, endTime }] } shape the wizard UI
// (BookSlotsStep / resolveSlotStaff) already expects.
describe("salonService.getAvailableSlots", () => {
  it("calls the live anonymous booking/slots endpoint (not the removed salons/available-slots one) and maps the response", async () => {
    const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: [
        {
          start: "2026-09-05T05:30:00.000Z",
          end: "2026-09-05T06:00:00.000Z",
          staffPublicId: "staff-1",
          isAvailable: true,
        },
      ],
    });

    const result = await salonService.getAvailableSlots({
      salonPublicId: "salon-1",
      branchPublicId: "branch-1",
      date: "2026-09-05",
      offeringPublicIds: ["offering-1"],
      staffProfilePublicId: null,
    });

    expect(getSpy).toHaveBeenCalledTimes(1);
    const [url, config] = getSpy.mock.calls[0];
    expect(url).toBe(API_ADDRESS.BOOKING.SLOTS);
    expect(url).not.toBe("/api/salons/available-slots");
    expect(config?.params).toMatchObject({
      salonPublicId: "salon-1",
      branchPublicId: "branch-1",
      offeringPublicIds: ["offering-1"],
      date: "2026-09-05",
    });
    // The backend's [AllowAnonymous] slots endpoint has no serviceTypePublicIds param at all.
    expect(config?.params).not.toHaveProperty("serviceTypePublicIds");

    expect(result.data.slots).toHaveLength(1);
    expect(result.data.slots[0].staffPublicId).toBe("staff-1");
    expect(result.data.slots[0].time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(result.data.slots[0].endTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);

    getSpy.mockRestore();
  });
});

// Regression coverage for a category-filter bug: GET /api/salons used to expect its category
// filter as `serviceTypeId` typed as a raw internal numeric id, unlike every other endpoint in
// the API which uses `serviceTypePublicId` (a Guid). The backend was fixed to accept
// `serviceTypePublicId` (SalonFilter.ServiceTypePublicId), but the frontend was still sending
// the old `serviceTypeId` param name — which ASP.NET Core silently ignored (no binding error),
// so clicking a category on /search returned unfiltered results with a 200 instead of erroring.
// This asserts the service now sends the Guid under the `serviceTypePublicId` query key.
describe("salonService.getApproved", () => {
  it("sends the category filter as serviceTypePublicId (Guid), not the old serviceTypeId", async () => {
    const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: { items: [], total: 0 },
    });

    await salonService.getApproved({
      page: 1,
      pageSize: 20,
      serviceTypePublicId: "a1111111-1111-1111-1111-111111111111",
    });

    expect(getSpy).toHaveBeenCalledTimes(1);
    const [url, config] = getSpy.mock.calls[0];
    expect(url).toBe(API_ADDRESS.SALON.APPROVED);
    expect(config?.params).toMatchObject({
      serviceTypePublicId: "a1111111-1111-1111-1111-111111111111",
    });
    expect(config?.params).not.toHaveProperty("serviceTypeId");

    getSpy.mockRestore();
  });

  // The «نزدیک من» point must never be in the URL (IIS / CDN access logs record the full URL, not custom headers).
  it("sends the GPS point only in the X-Search-Location header, never in the query string", async () => {
    const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({ data: { items: [] } });

    await salonService.getApproved({ lat: 35.712, lng: 51.399, radiusKm: 20, cityPublicId: undefined });
    await salonService.getMapPins({ north: 36, south: 35, east: 52, west: 51, lat: 35.712, lng: 51.399 });

    for (const [, config] of getSpy.mock.calls) {
      expect(config?.headers).toEqual({ "X-Search-Location": "35.712,51.399" });
      expect(config?.params).not.toHaveProperty("lat");
      expect(config?.params).not.toHaveProperty("lng");
    }
    getSpy.mockRestore();
  });

  it("sends no location header without a point, and the manual area as query params", async () => {
    const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({ data: { items: [] } });

    await salonService.getApproved({ cityPublicId: "c-1", districtPublicId: "d-1" });

    const [, config] = getSpy.mock.calls[0];
    expect(config?.headers).toBeUndefined();
    expect(config?.params).toMatchObject({ cityPublicId: "c-1", districtPublicId: "d-1" });
    getSpy.mockRestore();
  });

  // ASP.NET binds a list from repeated keys (`amenities=a&amenities=b`); axios' default `amenities[]=` would be ignored.
  it("sends the amenity filter as repeated `amenities` keys on the list and the map", async () => {
    const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({ data: { items: [] } });

    await salonService.getApproved({ amenities: ["parking", "free_wifi"] });
    await salonService.getMapPins({ north: 36, south: 35, east: 52, west: 51, amenities: ["parking"] });
    await salonService.getApproved({ amenities: [] });

    const urls = getSpy.mock.calls.map(([url, config]) => decodeURIComponent(axiosInstance.getUri({ url, ...config })));
    expect(urls[0]).toContain("amenities=parking&amenities=free_wifi");
    expect(urls[1]).toContain("amenities=parking");
    expect(urls[0]).not.toContain("amenities[]");
    expect(urls[2]).not.toContain("amenities");
    getSpy.mockRestore();
  });
});
