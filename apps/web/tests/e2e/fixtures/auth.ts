import { copy } from "@veloxlane/brand/copy";
import { test as base, type Page, type Route } from "@playwright/test";
import { setupServer } from "msw/node";

import { createAuthHandlers, createDefaultAuthState } from "../mocks/handlers";
import {
  createMockAuthState,
  type MockAuthState,
} from "../mocks/supabase-state";

type AuthFixtures = {
  authState: MockAuthState;
  mockAuth: void;
};

async function installStripeMock(page: Page, state: MockAuthState) {
  await page.addInitScript((shouldFail) => {
    const win = window as Window & {
      __stripeIdentityShouldFail?: boolean;
    };
    win.__stripeIdentityShouldFail = shouldFail;
  }, state.stripeShouldFail);
}

async function handlePhoneRoute(route: Route, authState: MockAuthState) {
  const body = route.request().postDataJSON() as {
    action: string;
    phone: string;
    token?: string;
  };
  const digits = body.phone.replace(/\D/g, "");
  const e164 = digits.startsWith("1") ? `+${digits}` : `+1${digits}`;

  if (body.action === "send" || body.action === "resend") {
    await route.fulfill({ json: { ok: true } });
    return;
  }

  if (body.token !== "123456") {
    const limit = authState.otpLimits.get(e164) ?? {
      verify_attempts: 0,
      resend_attempts: 0,
      window_started_at: new Date().toISOString(),
      cooldown_until: null,
    };
    limit.verify_attempts += 1;
    authState.otpLimits.set(e164, limit);

    if (limit.verify_attempts >= 3) {
      limit.cooldown_until = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();
      await route.fulfill({
        status: 429,
        json: { message: copy.auth.errorRateLimited },
      });
      return;
    }

    await route.fulfill({
      status: 400,
      json: { message: "Invalid code. Try again." },
    });
    return;
  }

  if (authState.profile) {
    authState.profile.phone = e164;
    authState.profile.phone_verified = true;
    authState.profile.onboarding_step =
      authState.profile.role === "seller" ? "identity" : "complete";
  }

  await route.fulfill({
    json: {
      ok: true,
      next: authState.profile?.role === "seller" ? "/verify-id" : "/",
    },
  });
}

export const test = base.extend<AuthFixtures>({
  authState: async ({}, use) => {
    const state = createMockAuthState();
    await use(state);
  },

  mockAuth: [
    async ({ page, context, authState }, use) => {
      const server = setupServer(...createAuthHandlers(() => authState));
      server.listen({ onUnhandledRequest: "bypass" });

      await installStripeMock(page, authState);

      const supabaseOrigin = (
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321"
      ).replace(/\/$/, "");

      await context.route(`${supabaseOrigin}/**`, async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname;

        if (request.method() === "POST" && path === "/auth/v1/signup") {
          const body = request.postDataJSON() as {
            email?: string;
            data?: { full_name?: string };
          };
          authState.profile = {
            id: authState.userId,
            email: body.email ?? "seller@example.com",
            full_name: body.data?.full_name ?? "Test Seller",
            role: "seller",
            phone: null,
            phone_verified: false,
            id_verified: false,
            onboarding_step: "phone",
            identity_attempts: 0,
            identity_manual_review: false,
          };
          await route.fulfill({
            json: {
              user: { id: authState.userId, email: authState.profile.email },
              session: {
                access_token: authState.accessToken,
                refresh_token: "mock-refresh",
                expires_in: 3600,
                token_type: "bearer",
              },
            },
          });
          return;
        }

        if (request.method() === "GET" && path === "/auth/v1/user") {
          if (!authState.profile) {
            await route.fulfill({ status: 401, json: { error: "no_user" } });
            return;
          }
          await route.fulfill({
            json: {
              id: authState.userId,
              email: authState.profile.email,
              user_metadata: { full_name: authState.profile.full_name },
            },
          });
          return;
        }

        if (request.method() === "PATCH" && path === "/auth/v1/user") {
          await route.fulfill({ json: { user: { id: authState.userId } } });
          return;
        }

        if (
          request.method() === "GET" &&
          path.startsWith("/rest/v1/profiles")
        ) {
          const select = url.searchParams.get("select") ?? "";
          if (!authState.profile) {
            await route.fulfill({ json: [] });
            return;
          }
          if (select.includes("identity_attempts")) {
            await route.fulfill({
              json: [
                {
                  identity_attempts: authState.profile.identity_attempts,
                  identity_manual_review:
                    authState.profile.identity_manual_review,
                  id_verified: authState.profile.id_verified,
                },
              ],
            });
            return;
          }
          await route.fulfill({
            json: [
              {
                role: authState.profile.role,
                phone_verified: authState.profile.phone_verified,
                id_verified: authState.profile.id_verified,
                onboarding_step: authState.profile.onboarding_step,
              },
            ],
          });
          return;
        }

        if (request.method() === "PATCH" && path === "/rest/v1/profiles") {
          const body = request.postDataJSON() as Record<string, unknown>;
          if (authState.profile) {
            authState.profile = {
              ...authState.profile,
              ...(body as Partial<typeof authState.profile>),
            };
          }
          await route.fulfill({ json: [authState.profile] });
          return;
        }

        await route.continue();
      });

      await context.route(/\/api\/auth\/phone$/, async (route) => {
        if (route.request().method() === "POST") {
          await handlePhoneRoute(route, authState);
          return;
        }
        await route.continue();
      });

      await context.route(/\/api\/auth\/welcome$/, async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({ json: { ok: true } });
          return;
        }
        await route.continue();
      });

      await context.route(/\/api\/auth\/next-step$/, async (route) => {
        const next =
          authState.profile?.onboarding_step === "identity"
            ? "/verify-id"
            : "/";
        await route.fulfill({ body: next });
      });

      await context.route(/\/api\/auth\/identity\/session$/, async (route) => {
        if (authState.stripeShouldFail) {
          await route.fulfill({
            status: 503,
            json: { message: copy.auth.errorGeneric },
          });
          return;
        }
        await route.fulfill({ json: { clientSecret: "vs_test_mock" } });
      });

      await use();

      server.close();
    },
    { auto: true },
  ],
});

export async function seedAuthenticatedSeller(page: Page) {
  const state = createDefaultAuthState();
  await page.addInitScript(
    ({ accessToken, userId }) => {
      localStorage.setItem(
        "sb-127-auth-token",
        JSON.stringify({
          access_token: accessToken,
          refresh_token: "mock-refresh",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: { id: userId },
        }),
      );
    },
    { accessToken: state.accessToken, userId: state.userId },
  );
  return state;
}

export { expect } from "@playwright/test";
