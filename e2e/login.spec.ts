import { expect, test } from "@playwright/test";

const PHONE_LABEL = "شماره موبایل";
const PASSWORD_LABEL = "رمز عبور";
const SUBMIT_NAME = /ورود به حساب کاربری/;
const LOGIN_ENDPOINT = "**/api/auth/login-password";

test.describe("Login", () => {
  test("blocks submission and shows inline errors when both fields are empty", async ({
    page,
  }) => {
    let calls = 0;
    await page.route(LOGIN_ENDPOINT, (route) => {
      calls += 1;
      return route.continue();
    });

    await page.goto("/auth/login");
    await page.getByRole("button", { name: SUBMIT_NAME }).click();

    // Empty phone fails the /^09\d{9}$/ regex check before it ever reaches min-length,
    // so this is the format message, not the old "please enter" required-field message.
    await expect(
      page.getByText("شماره موبایل معتبر نیست (مثال: 09123456789)")
    ).toBeVisible();
    await expect(page.getByText("لطفا رمز عبور را وارد نمایید")).toBeVisible();
    expect(calls).toBe(0);
  });

  test("logs in successfully and leaves the login page", async ({ page }) => {
    await page.route(LOGIN_ENDPOINT, (route) =>
      route.fulfill({
        status: 200,
        json: { data: { accessToken: "e2e-access", refreshToken: "e2e-refresh" } },
      })
    );

    await page.goto("/auth/login");
    await page.getByLabel(PHONE_LABEL).fill("09123456789");
    await page.getByLabel(PASSWORD_LABEL).fill("CorrectHorseBattery1");
    await page.getByRole("button", { name: SUBMIT_NAME }).click();

    await page.waitForURL((url) => !url.pathname.startsWith("/auth/login"));

    const stored = await page.evaluate(() =>
      window.localStorage.getItem("salon_flow_token_state")
    );
    expect(stored).toContain("e2e-access");
  });

  test("shows a general error banner on invalid credentials and stays on the page", async ({
    page,
  }) => {
    await page.route(LOGIN_ENDPOINT, (route) =>
      route.fulfill({
        status: 401,
        json: { message: "شماره موبایل یا رمز عبور اشتباه است" },
      })
    );

    await page.goto("/auth/login");
    await page.getByLabel(PHONE_LABEL).fill("09123456789");
    await page.getByLabel(PASSWORD_LABEL).fill("WrongPassword1");
    await page.getByRole("button", { name: SUBMIT_NAME }).click();

    await expect(page.getByText("شماره موبایل یا رمز عبور اشتباه است")).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/auth/login");
  });

  test("disables the submit button immediately so a rapid double click cannot fire two requests", async ({
    page,
  }) => {
    let calls = 0;
    await page.route(LOGIN_ENDPOINT, async (route) => {
      calls += 1;
      // Simulate a slow backend so the window where a second click could land stays open.
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        json: { data: { accessToken: "e2e-access", refreshToken: "e2e-refresh" } },
      });
    });

    await page.goto("/auth/login");
    await page.getByLabel(PHONE_LABEL).fill("09123456789");
    await page.getByLabel(PASSWORD_LABEL).fill("CorrectHorseBattery1");

    // A tag-based locator, not getByRole: the password field's show/hide toggle is
    // a `<div role="button">`, so role-based queries match two elements here. And
    // once isLoading flips, Button.tsx replaces the label text with a bare spinner
    // icon, so a name-based locator would stop resolving right when we re-query below.
    const submitButton = page.locator("form button");
    await submitButton.click();
    await expect(submitButton).toBeDisabled();

    // A second tap while disabled must be a no-op at the DOM level.
    await submitButton.click({ force: true }).catch(() => {});

    await page.waitForURL((url) => !url.pathname.startsWith("/auth/login"));
    expect(calls).toBe(1);
  });

  test("masks the password field and rejects a non-Iranian-mobile phone format client-side", async ({
    page,
  }) => {
    let calls = 0;
    await page.route(LOGIN_ENDPOINT, (route) => {
      calls += 1;
      return route.continue();
    });

    await page.goto("/auth/login");
    await expect(page.getByLabel(PASSWORD_LABEL)).toHaveAttribute("type", "password");

    // Whitespace and non-09-prefixed numbers now fail the phone regex before any request fires.
    await page.getByLabel(PHONE_LABEL).fill("   ");
    await page.getByLabel(PASSWORD_LABEL).fill("SomePassword1");
    await page.getByRole("button", { name: SUBMIT_NAME }).click();

    await expect(
      page.getByText("شماره موبایل معتبر نیست (مثال: 09123456789)")
    ).toBeVisible();
    expect(calls).toBe(0);
  });
});
