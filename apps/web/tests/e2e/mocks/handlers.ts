import { copy } from "@veloxlane/brand/copy";
import { http, HttpResponse } from "msw";

import {
  createMockAuthState,
  getOrCreateOtpLimit,
  type MockAuthState,
} from "./supabase-state";

export function createAuthHandlers(getState: () => MockAuthState) {
  const supabaseOrigin = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321"
  ).replace(/\/$/, "");

  return [
    http.post(`${supabaseOrigin}/auth/v1/signup`, async ({ request }) => {
      const body = (await request.json()) as {
        email?: string;
        password?: string;
        data?: { full_name?: string };
      };
      const state = getState();

      state.profile = {
        id: state.userId,
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

      return HttpResponse.json({
        user: {
          id: state.userId,
          email: state.profile.email,
          app_metadata: {},
          user_metadata: { full_name: state.profile.full_name },
        },
        session: {
          access_token: state.accessToken,
          refresh_token: "mock-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: { id: state.userId, email: state.profile.email },
        },
      });
    }),

    http.get(`${supabaseOrigin}/auth/v1/user`, () => {
      const state = getState();
      if (!state.profile) {
        return HttpResponse.json(
          { error: "not_authenticated" },
          { status: 401 },
        );
      }

      return HttpResponse.json({
        id: state.userId,
        email: state.profile.email,
        app_metadata: {},
        user_metadata: { full_name: state.profile.full_name },
      });
    }),

    http.patch(`${supabaseOrigin}/auth/v1/user`, async ({ request }) => {
      const body = (await request.json()) as { phone?: string };
      const state = getState();
      if (body.phone && state.profile) {
        state.profile.phone = body.phone;
      }
      return HttpResponse.json({ user: { id: state.userId } });
    }),

    http.post(`${supabaseOrigin}/auth/v1/verify`, async ({ request }) => {
      const body = (await request.json()) as {
        phone?: string;
        token?: string;
        type?: string;
      };
      const state = getState();
      const phone = body.phone ?? "";
      const limit = getOrCreateOtpLimit(state, phone);

      if (body.token !== "123456") {
        limit.verify_attempts += 1;
        if (limit.verify_attempts >= 3) {
          limit.cooldown_until = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString();
          return HttpResponse.json(
            { error_description: "rate_limited" },
            { status: 400 },
          );
        }
        return HttpResponse.json(
          { error_description: "invalid_otp" },
          { status: 400 },
        );
      }

      if (state.profile) {
        state.profile.phone_verified = true;
        state.profile.onboarding_step =
          state.profile.role === "seller" ? "identity" : "complete";
      }

      return HttpResponse.json({ user: { id: state.userId } });
    }),

    http.patch(`${supabaseOrigin}/rest/v1/profiles`, async ({ request }) => {
      const state = getState();
      const body = (await request.json()) as Partial<MockAuthState["profile"]>;
      if (state.profile) {
        state.profile = { ...state.profile, ...body };
      }
      return HttpResponse.json(state.profile ? [state.profile] : []);
    }),

    http.get(`${supabaseOrigin}/rest/v1/profiles`, ({ request }) => {
      const state = getState();
      const url = new URL(request.url);
      const select = url.searchParams.get("select") ?? "";

      if (!state.profile) {
        return HttpResponse.json([]);
      }

      if (select.includes("identity_attempts")) {
        return HttpResponse.json([
          {
            identity_attempts: state.profile.identity_attempts,
            identity_manual_review: state.profile.identity_manual_review,
            id_verified: state.profile.id_verified,
          },
        ]);
      }

      return HttpResponse.json([
        {
          id: state.profile.id,
          email: state.profile.email,
          full_name: state.profile.full_name,
          phone: state.profile.phone,
          role: state.profile.role,
          phone_verified: state.profile.phone_verified,
          id_verified: state.profile.id_verified,
          onboarding_step: state.profile.onboarding_step,
          identity_manual_review: state.profile.identity_manual_review,
        },
      ]);
    }),

    http.post("**/api/auth/welcome", () => HttpResponse.json({ ok: true })),

    http.post("**/api/auth/phone", async ({ request }) => {
      const state = getState();
      const body = (await request.json()) as {
        action: "send" | "resend" | "verify";
        phone: string;
        token?: string;
      };

      const phone = body.phone.replace(/\D/g, "");
      const e164 = phone.startsWith("1") ? `+${phone}` : `+1${phone}`;
      const limit = getOrCreateOtpLimit(state, e164);

      if (body.action === "send" || body.action === "resend") {
        if (limit.cooldown_until) {
          return HttpResponse.json(
            { message: copy.auth.errorRateLimited },
            { status: 429 },
          );
        }
        limit.resend_attempts += 1;
        return HttpResponse.json({ ok: true });
      }

      if (limit.cooldown_until) {
        return HttpResponse.json(
          { message: copy.auth.errorRateLimited },
          { status: 429 },
        );
      }

      if (body.token !== "123456") {
        limit.verify_attempts += 1;
        if (limit.verify_attempts >= 3) {
          limit.cooldown_until = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString();
          return HttpResponse.json(
            { message: copy.auth.errorRateLimited },
            { status: 429 },
          );
        }
        return HttpResponse.json(
          { message: "Invalid code. Try again." },
          { status: 400 },
        );
      }

      if (state.profile) {
        state.profile.phone = e164;
        state.profile.phone_verified = true;
        state.profile.onboarding_step =
          state.profile.role === "seller" ? "identity" : "complete";
      }

      const next = state.profile?.role === "seller" ? "/verify-id" : "/";
      return HttpResponse.json({ ok: true, next });
    }),

    http.get("**/api/auth/next-step", () => {
      const state = getState();
      if (!state.profile) {
        return HttpResponse.text("/login");
      }
      if (state.profile.onboarding_step === "identity") {
        return HttpResponse.text("/verify-id");
      }
      return HttpResponse.text("/");
    }),

    http.post("**/api/auth/identity/session", () => {
      const state = getState();
      if (state.stripeShouldFail) {
        return HttpResponse.json(
          { message: copy.auth.errorGeneric },
          { status: 503 },
        );
      }
      return HttpResponse.json({ clientSecret: "vs_test_mock_secret" });
    }),
  ];
}

export function createDefaultAuthState(): MockAuthState {
  const state = createMockAuthState();
  state.profile = {
    id: state.userId,
    email: "seller@example.com",
    full_name: "Test Seller",
    role: "seller",
    phone: "+15555550100",
    phone_verified: true,
    id_verified: false,
    onboarding_step: "identity",
    identity_attempts: 0,
    identity_manual_review: false,
  };
  return state;
}
