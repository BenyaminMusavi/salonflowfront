import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

// Only the bare `axios.post` (used for the refresh-token call) is stubbed. The
// `axiosInstance` created via the *real* `axios.create()` is left intact so the
// interceptor chain under test runs unmodified end-to-end.
vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return { ...actual, default: { ...actual.default, post: vi.fn() } };
});

import axiosInstance from "./axios-instance";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useFavoriteIdsStore } from "@/services/domains/favorites/store/useFavoriteIdsStore";

type FakeResult = { status: number; data: unknown };

/** Stands in for the network layer: no real HTTP call ever leaves the process. */
function fakeAdapter(handler: (config: AxiosRequestConfig) => Promise<FakeResult>) {
  return async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const { status, data } = await handler(config);
    if (status >= 400) {
      const err = new Error(`Request failed with status ${status}`) as Error & {
        config: AxiosRequestConfig;
        response: unknown;
        isAxiosError: boolean;
      };
      err.config = config;
      err.response = { status, data, config, headers: {} };
      err.isAxiosError = true;
      throw err;
    }
    return { status, statusText: "OK", headers: {}, config, data } as AxiosResponse;
  };
}

beforeEach(() => {
  useTokenStore.getState().clear();
  useSalonContextStore.getState().clearAll();
  useFavoriteIdsStore.getState().clear();
  vi.mocked(axios.post).mockReset();
  // jsdom throws "Not implemented: navigation" on a real assignment; stub it out
  // so forceLogout's `window.location.href = ...` is just an inspectable value.
  Object.defineProperty(window, "location", {
    value: { href: "" },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("axiosInstance — request interceptor", () => {
  it("attaches the bearer token from the auth store when one is present", async () => {
    useTokenStore.getState().setToken({ accessToken: "abc123", refreshToken: "r1" }, true);
    let seenAuth: unknown;
    await axiosInstance.get("/api/anything", {
      adapter: fakeAdapter(async (config) => {
        seenAuth = config.headers?.Authorization;
        return { status: 200, data: { ok: true } };
      }),
    });
    expect(seenAuth).toBe("Bearer abc123");
  });

  it("sends no Authorization header for a logged-out request", async () => {
    let seenAuth: unknown;
    await axiosInstance.get("/api/public", {
      adapter: fakeAdapter(async (config) => {
        seenAuth = config.headers?.Authorization;
        return { status: 200, data: {} };
      }),
    });
    expect(seenAuth).toBeUndefined();
  });
});

describe("axiosInstance — 401 refresh-and-retry flow", () => {
  it("refreshes an expired token exactly once and retries the original request", async () => {
    useTokenStore
      .getState()
      .setToken({ accessToken: "expired", refreshToken: "refresh-1" }, true);
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { data: { accessToken: "fresh-token", refreshToken: "refresh-2" } },
    });

    let attempts = 0;
    const result = await axiosInstance.get<{ auth: unknown }>("/api/protected", {
      adapter: fakeAdapter(async (config) => {
        attempts += 1;
        if (config.headers?.Authorization === "Bearer expired") {
          return { status: 401, data: { message: "expired" } };
        }
        return { status: 200, data: { auth: config.headers?.Authorization } };
      }),
    });

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(attempts).toBe(2); // first call (401) + retried call (200)
    expect((result as unknown as { auth: unknown }).auth).toBe("Bearer fresh-token");
    expect(useTokenStore.getState().token?.accessToken).toBe("fresh-token");
  });

  it("queues concurrent 401s during one refresh and resolves all of them with the new token", async () => {
    useTokenStore
      .getState()
      .setToken({ accessToken: "expired", refreshToken: "refresh-1" }, true);
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { data: { accessToken: "fresh-token", refreshToken: "refresh-2" } },
    });

    const adapter = fakeAdapter(async (config) => {
      if (config.headers?.Authorization === "Bearer expired") {
        return { status: 401, data: {} };
      }
      return { status: 200, data: { auth: config.headers?.Authorization } };
    });

    const [a, b] = await Promise.all([
      axiosInstance.get<{ auth: unknown }>("/api/one", { adapter }),
      axiosInstance.get<{ auth: unknown }>("/api/two", { adapter }),
    ]);

    // The whole point of the queue: two callers hit 401 "at once" but only one
    // refresh round-trip should ever fire.
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect((a as unknown as { auth: unknown }).auth).toBe("Bearer fresh-token");
    expect((b as unknown as { auth: unknown }).auth).toBe("Bearer fresh-token");
  });

  it("logs out and clears every client store when the refresh token itself is rejected", async () => {
    useTokenStore
      .getState()
      .setToken({ accessToken: "expired", refreshToken: "bad-refresh" }, true);
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: { data: { message: "Refresh token expired" } },
    });

    await expect(
      axiosInstance.get("/api/protected", {
        adapter: fakeAdapter(async () => ({ status: 401, data: {} })),
      })
    ).rejects.toBeTruthy();

    expect(useTokenStore.getState().isLoggedIn).toBe(false);
    expect(useTokenStore.getState().token).toBeUndefined();
    expect(window.location.href).toBe("/auth/login");
  });

  it("skips the refresh round-trip entirely when there is no refresh token to use", async () => {
    useTokenStore.getState().setToken({ accessToken: "expired", refreshToken: null }, true);

    await expect(
      axiosInstance.get("/api/protected", {
        adapter: fakeAdapter(async () => ({ status: 401, data: {} })),
      })
    ).rejects.toBeTruthy();

    expect(axios.post).not.toHaveBeenCalled();
    expect(window.location.href).toBe("/auth/login");
  });

  it("never retries a request explicitly flagged skipAuthRetry", async () => {
    useTokenStore
      .getState()
      .setToken({ accessToken: "expired", refreshToken: "refresh-1" }, true);

    await expect(
      axiosInstance.get("/api/profile/change-password", {
        skipAuthRetry: true,
        adapter: fakeAdapter(async () => ({
          status: 401,
          data: { message: "wrong old password" },
        })),
      })
    ).rejects.toBeTruthy();

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("does not attempt a refresh for a 401 on a request that never carried a token", async () => {
    await expect(
      axiosInstance.get("/api/public-but-401", {
        adapter: fakeAdapter(async () => ({ status: 401, data: {} })),
      })
    ).rejects.toBeTruthy();

    expect(axios.post).not.toHaveBeenCalled();
  });
});
