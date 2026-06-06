import { copy } from "@veloxlane/brand/copy";

import { expect, test } from "./fixtures/auth";

const strongPassword = "VeloxLane1";
const testPhone = "5555550100";
const validOtp = "123456";

test.describe("auth onboarding", () => {
  test("happy path: signup → verify phone → verify ID → home", async ({
    page,
    authState,
  }) => {
    await page.goto("/signup");

    await page.getByLabel(copy.auth.fullNameLabel).fill("Test Seller");
    await page.getByLabel(copy.auth.emailLabel).fill("seller@example.com");
    await page.locator("#password").fill(strongPassword);
    await page.locator("#confirmPassword").fill(strongPassword);
    await page.getByRole("radio", { name: copy.auth.roleSeller }).check();

    await page.getByRole("button", { name: copy.auth.submitSignup }).click();
    await expect(page).toHaveURL(/\/verify-phone/);

    await page.getByLabel(copy.auth.phoneLabel).fill(testPhone);
    await page.getByRole("button", { name: copy.auth.submitPhone }).click();

    await expect(page.getByLabel(copy.auth.otpLabel)).toBeVisible();
    await page.getByLabel(copy.auth.otpLabel).fill(validOtp);
    await page.getByRole("button", { name: copy.auth.submitOtp }).click();

    await expect(page).toHaveURL(/\/verify-id/);
    expect(authState.profile?.phone_verified).toBe(true);

    await page.route("https://api.stripe.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "vs_test_mock", status: "verified" }),
      });
    });

    await page.getByRole("button", { name: copy.auth.submitIdentity }).click();
    await expect(page.getByText(copy.auth.successIdentity)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("sad path: weak password shows specific guidance", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel(copy.auth.fullNameLabel).fill("Test Buyer");
    await page.getByLabel(copy.auth.emailLabel).fill("buyer@example.com");
    await page.locator("#password").fill("short");
    await page.locator("#confirmPassword").fill("short");
    await page.getByRole("button", { name: copy.auth.submitSignup }).click();

    await expect(
      page.getByText("Password must be at least 8 characters."),
    ).toBeVisible();
    await page.locator("#password").fill("lowercase1");
    await page.locator("#confirmPassword").fill("lowercase1");
    await page.getByRole("button", { name: copy.auth.submitSignup }).click();
    await expect(
      page.getByText("Include at least one uppercase letter."),
    ).toBeVisible();
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
    await page.getByLabel(copy.auth.phoneLabel).fill(testPhone);
    await page.getByRole("button", { name: copy.auth.submitPhone }).click();

    const otpField = page.getByLabel(copy.auth.otpLabel);
    await expect(otpField).toBeVisible();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await otpField.fill("000000");
      await page.getByRole("button", { name: copy.auth.submitOtp }).click();
    }

    await expect(page.getByText(copy.auth.errorRateLimited)).toBeVisible();
  });

  test("sad path: Stripe Identity API failure shows retry CTA", async ({
    page,
    authState,
  }) => {
    await page.goto("/signup");
    await page.getByLabel(copy.auth.fullNameLabel).fill("Test Seller");
    await page.getByLabel(copy.auth.emailLabel).fill("seller@example.com");
    await page.locator("#password").fill(strongPassword);
    await page.locator("#confirmPassword").fill(strongPassword);
    await page.getByRole("radio", { name: copy.auth.roleSeller }).check();
    await page.getByRole("button", { name: copy.auth.submitSignup }).click();
    await expect(page).toHaveURL(/\/verify-phone/);

    await page.getByLabel(copy.auth.phoneLabel).fill(testPhone);
    await page.getByRole("button", { name: copy.auth.submitPhone }).click();
    await expect(page.getByLabel(copy.auth.otpLabel)).toBeVisible();
    await page.getByLabel(copy.auth.otpLabel).fill(validOtp);
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
    await page.getByLabel(copy.auth.phoneLabel).fill(testPhone);
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
