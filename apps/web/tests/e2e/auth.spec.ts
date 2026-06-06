import { copy } from "@veloxlane/brand/copy";

import { expect, test } from "./fixtures/auth";

const strongPassword = "VeloxLane1";
const testPhone = "5555550100";
const validOtp = "123456";

async function typeInto(
  page: import("@playwright/test").Page,
  selector: string,
  value: string,
) {
  const field = page.locator(selector);
  await field.waitFor({ state: "visible" });
  await field.click();
  await field.fill(value);
  await field.dispatchEvent("input");
  await field.dispatchEvent("change");
  await field.dispatchEvent("blur");
}

test.describe("auth onboarding", () => {
  test("happy path: signup → verify phone → verify ID → home", async ({
    page,
    authState,
  }) => {
    await page.goto("/signup");

    await typeInto(page, "[name='fullName']", "Test Seller");
    await typeInto(page, "[name='email']", "seller@example.com");
    await typeInto(page, "#password", strongPassword);
    await typeInto(page, "#confirmPassword", strongPassword);
    await page.getByRole("radio", { name: copy.auth.roleSeller }).check();

    await page.getByRole("button", { name: copy.auth.submitSignup }).click();
    await expect(page).toHaveURL(/\/verify-phone/);

    await typeInto(page, "[name='phone']", testPhone);
    await page.getByRole("button", { name: copy.auth.submitPhone }).click();

    await expect(page.getByLabel(copy.auth.otpLabel)).toBeVisible();
    await typeInto(page, "[name='token']", validOtp);
    await page.getByRole("button", { name: copy.auth.submitOtp }).click();

    await expect(page).toHaveURL(/\/verify-id/);
    expect(authState.profile?.phone_verified).toBe(true);

    await page.getByRole("button", { name: copy.auth.submitIdentity }).click();
    await expect(page.getByText(copy.auth.successIdentity)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("sad path: weak password shows specific guidance", async ({ page }) => {
    await page.goto("/signup");

    await typeInto(page, "[name='fullName']", "Test Buyer");
    await typeInto(page, "[name='email']", "buyer@example.com");
    await typeInto(page, "#password", "short");
    await typeInto(page, "#confirmPassword", "short");
    await page.getByRole("button", { name: copy.auth.submitSignup }).click();

    await expect(page.locator("#password-error")).toHaveText(
      "Password must be at least 8 characters.",
    );
    await typeInto(page, "#password", "lowercase1");
    await typeInto(page, "#confirmPassword", "lowercase1");
    await page.getByRole("button", { name: copy.auth.submitSignup }).click();
    await expect(page.locator("#password-error")).toHaveText(
      "Include at least one uppercase letter.",
    );
  });

  test("sad path: OTP wrong 3x shows lockout message", async ({
    page,
    authState,
  }) => {
    authState.profile = {
      id: authState.userId,
      email: "seller@example.com",
      full_name: "Test Seller",
      role: "seller",
      phone: null,
      phone_verified: false,
      id_verified: false,
      onboarding_step: "phone",
      identity_attempts: 0,
      identity_manual_review: false,
    };

    await page.goto("/verify-phone");
    await typeInto(page, "[name='phone']", testPhone);
    await page.getByRole("button", { name: copy.auth.submitPhone }).click();

    const otpField = page.getByLabel(copy.auth.otpLabel);
    await expect(otpField).toBeVisible();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await typeInto(page, "[name='token']", "000000");
      await page.getByRole("button", { name: copy.auth.submitOtp }).click();
    }

    await expect(page.getByText(copy.auth.errorRateLimited)).toBeVisible();
  });

  test("sad path: Stripe Identity API failure shows retry CTA", async ({
    page,
    authState,
  }) => {
    await page.goto("/signup");
    await typeInto(page, "[name='fullName']", "Test Seller");
    await typeInto(page, "[name='email']", "seller@example.com");
    await typeInto(page, "#password", strongPassword);
    await typeInto(page, "#confirmPassword", strongPassword);
    await page.getByRole("radio", { name: copy.auth.roleSeller }).check();
    await page.getByRole("button", { name: copy.auth.submitSignup }).click();
    await expect(page).toHaveURL(/\/verify-phone/);

    await typeInto(page, "[name='phone']", testPhone);
    await page.getByRole("button", { name: copy.auth.submitPhone }).click();
    await expect(page.getByLabel(copy.auth.otpLabel)).toBeVisible();
    await typeInto(page, "[name='token']", validOtp);
    await page.getByRole("button", { name: copy.auth.submitOtp }).click();
    await expect(page).toHaveURL(/\/verify-id/);

    authState.stripeShouldFail = true;
    await page.getByRole("button", { name: copy.auth.submitIdentity }).click();

    await expect(page.getByText(copy.auth.errorGeneric)).toBeVisible();
    await expect(
      page.getByRole("button", { name: copy.auth.submitIdentity }),
    ).toBeVisible();
  });

  test("idempotency: refresh mid-OTP preserves OTP step", async ({
    page,
    authState,
  }) => {
    authState.profile = {
      id: authState.userId,
      email: "seller@example.com",
      full_name: "Test Seller",
      role: "seller",
      phone: null,
      phone_verified: false,
      id_verified: false,
      onboarding_step: "phone",
      identity_attempts: 0,
      identity_manual_review: false,
    };

    await page.goto("/verify-phone");
    await typeInto(page, "[name='phone']", testPhone);
    await page.getByRole("button", { name: copy.auth.submitPhone }).click();
    await expect(page.getByLabel(copy.auth.otpLabel)).toBeVisible();

    await page.reload();
    await expect(page.getByLabel(copy.auth.otpLabel)).toBeVisible();
  });

  test("accessibility: signup form is keyboard navigable", async ({ page }) => {
    await page.goto("/signup");

    await page.keyboard.press("Tab");
    await expect(page.getByLabel(copy.auth.fullNameLabel)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByLabel(copy.auth.emailLabel)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#password")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("#confirmPassword")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("radio", { name: copy.auth.roleBuyer }),
    ).toBeFocused();
  });

  test("accessibility: login form is keyboard navigable", async ({ page }) => {
    await page.goto("/login");

    await page.keyboard.press("Tab");
    await expect(page.getByLabel(copy.auth.emailLabel)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByLabel(copy.auth.passwordLabel)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: copy.auth.submitLogin }),
    ).toBeFocused();
  });
});
