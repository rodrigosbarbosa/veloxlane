export const staffRoles = [
  "support",
  "identity",
  "risk",
  "escrow",
  "compliance",
  "admin",
] as const;

export type StaffRole = (typeof staffRoles)[number];

export type ConsoleArea =
  | "listingsQueue"
  | "usersIdentity"
  | "dealerFlags"
  | "escrowMonitoring"
  | "billOfSaleMonitoring"
  | "auditPosture";

export type StaffAccess =
  | {
      state: "missing-role";
      allowed: false;
      role: null;
      visibleAreas: [];
      heading: string;
      detail: string;
    }
  | {
      state: "denied";
      allowed: false;
      role: null;
      visibleAreas: [];
      heading: string;
      detail: string;
    }
  | {
      state: "allowed";
      allowed: true;
      role: StaffRole;
      visibleAreas: ConsoleArea[];
      heading: string;
      detail: string;
    };

const roleAreaAccess = {
  support: ["listingsQueue", "usersIdentity"],
  identity: ["usersIdentity", "dealerFlags", "auditPosture"],
  risk: ["listingsQueue", "dealerFlags", "auditPosture"],
  escrow: ["escrowMonitoring", "billOfSaleMonitoring", "auditPosture"],
  compliance: [
    "usersIdentity",
    "dealerFlags",
    "escrowMonitoring",
    "billOfSaleMonitoring",
    "auditPosture",
  ],
  admin: [
    "listingsQueue",
    "usersIdentity",
    "dealerFlags",
    "escrowMonitoring",
    "billOfSaleMonitoring",
    "auditPosture",
  ],
} satisfies Record<StaffRole, ConsoleArea[]>;

export const isStaffRole = (
  value: string | null | undefined,
): value is StaffRole => staffRoles.includes(value as StaffRole);

export const normalizeRoleInput = (
  value: string | string[] | null | undefined,
): string | null => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue?.trim().toLowerCase();

  return normalizedValue ? normalizedValue : null;
};

export const getStaffAccess = (
  roleInput: string | string[] | null | undefined,
): StaffAccess => {
  const normalizedRole = normalizeRoleInput(roleInput);

  if (!normalizedRole) {
    return {
      state: "missing-role",
      allowed: false,
      role: null,
      visibleAreas: [],
      heading: "Staff access required",
      detail:
        "This scaffold is intentionally closed until Firebase Auth role claims are integrated.",
    };
  }

  if (!isStaffRole(normalizedRole)) {
    return {
      state: "denied",
      allowed: false,
      role: null,
      visibleAreas: [],
      heading: "Role not authorized",
      detail:
        "Only VeloxLane staff roles can view console scope, queues, and posture signals.",
    };
  }

  return {
    state: "allowed",
    allowed: true,
    role: normalizedRole,
    visibleAreas: roleAreaAccess[normalizedRole],
    heading: "Staff console scaffold",
    detail:
      "Role-gated preview state only. Real access will come from verified auth claims.",
  };
};

export const canViewArea = (access: StaffAccess, area: ConsoleArea): boolean =>
  access.allowed && access.visibleAreas.includes(area);
