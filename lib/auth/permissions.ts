import { Role } from "@prisma/client";

// ─── Permission Types ─────────────────────────────────────────────────────────

export type Permission =
  | "job:create"
  | "job:edit"
  | "job:delete"
  | "job:view"
  | "candidate:create"
  | "candidate:edit"
  | "candidate:delete"
  | "candidate:view"
  | "application:move-stage"
  | "interview:schedule"
  | "interview:cancel"
  | "scorecard:submit"
  | "report:view"
  | "member:manage"
  | "settings:edit";

// ─── Permission Map ───────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "job:create",
    "job:edit",
    "job:delete",
    "job:view",
    "candidate:create",
    "candidate:edit",
    "candidate:delete",
    "candidate:view",
    "application:move-stage",
    "interview:schedule",
    "interview:cancel",
    "scorecard:submit",
    "report:view",
    "member:manage",
    "settings:edit",
  ],
  RECRUITER: [
    "job:create",
    "job:edit",
    "job:view",
    "candidate:create",
    "candidate:edit",
    "candidate:view",
    "application:move-stage",
    "interview:schedule",
    "interview:cancel",
    "scorecard:submit",
    "report:view",
  ],
  INTERVIEWER: [
    "job:view",
    "candidate:view",
    "scorecard:submit",
  ],
};

// ─── Permission Checker ───────────────────────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
