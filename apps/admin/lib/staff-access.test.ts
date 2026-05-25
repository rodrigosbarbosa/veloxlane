import { describe, expect, it } from "vitest";

import {
  canViewArea,
  getStaffAccess,
  normalizeRoleInput,
} from "./staff-access";

describe("normalizeRoleInput", () => {
  it("normalizes a single role value", () => {
    expect(normalizeRoleInput(" Risk ")).toBe("risk");
  });

  it("uses the first value for repeated role query params", () => {
    expect(normalizeRoleInput(["escrow", "admin"])).toBe("escrow");
  });

  it("returns null for blank input", () => {
    expect(normalizeRoleInput("   ")).toBeNull();
  });
});

describe("getStaffAccess", () => {
  it("blocks missing role state without exposing console areas", () => {
    expect(getStaffAccess(null)).toMatchObject({
      state: "missing-role",
      allowed: false,
      role: null,
      visibleAreas: [],
    });
  });

  it("denies non-staff roles", () => {
    expect(getStaffAccess("seller")).toMatchObject({
      state: "denied",
      allowed: false,
      role: null,
      visibleAreas: [],
    });
  });

  it("allows staff roles with scoped areas", () => {
    const access = getStaffAccess("risk");

    expect(access).toMatchObject({
      state: "allowed",
      allowed: true,
      role: "risk",
    });
    expect(canViewArea(access, "dealerFlags")).toBe(true);
    expect(canViewArea(access, "escrowMonitoring")).toBe(false);
  });

  it("grants admin visibility across staff console areas", () => {
    const access = getStaffAccess("admin");

    expect(access.allowed).toBe(true);
    expect(access.visibleAreas).toEqual([
      "listingsQueue",
      "usersIdentity",
      "dealerFlags",
      "escrowMonitoring",
      "billOfSaleMonitoring",
      "auditPosture",
    ]);
  });
});
