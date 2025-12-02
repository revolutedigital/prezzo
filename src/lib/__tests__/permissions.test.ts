import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  Permission,
  ROLE_PERMISSIONS,
} from "../permissions";

describe("Permission System", () => {
  describe("hasPermission", () => {
    it("should allow admin to have all permissions", () => {
      expect(hasPermission("admin", Permission.PRODUTO_DELETE)).toBe(true);
      expect(hasPermission("admin", Permission.ADMIN_USERS)).toBe(true);
      expect(hasPermission("admin", Permission.ORCAMENTO_APPROVE)).toBe(true);
    });

    it("should allow user to have standard permissions", () => {
      expect(hasPermission("user", Permission.PRODUTO_VIEW)).toBe(true);
      expect(hasPermission("user", Permission.PRODUTO_CREATE)).toBe(true);
      expect(hasPermission("user", Permission.ORCAMENTO_SEND)).toBe(true);
    });

    it("should deny user admin permissions", () => {
      expect(hasPermission("user", Permission.ADMIN_USERS)).toBe(false);
      expect(hasPermission("user", Permission.ADMIN_SETTINGS)).toBe(false);
    });

    it("should allow viewer only read permissions", () => {
      expect(hasPermission("viewer", Permission.PRODUTO_VIEW)).toBe(true);
      expect(hasPermission("viewer", Permission.ORCAMENTO_VIEW)).toBe(true);
    });

    it("should deny viewer write permissions", () => {
      expect(hasPermission("viewer", Permission.PRODUTO_CREATE)).toBe(false);
      expect(hasPermission("viewer", Permission.PRODUTO_DELETE)).toBe(false);
      expect(hasPermission("viewer", Permission.ORCAMENTO_SEND)).toBe(false);
    });

    it("should handle unknown role", () => {
      expect(hasPermission("unknown", Permission.PRODUTO_VIEW)).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("should return true when user has all permissions", () => {
      const result = hasAllPermissions("user", [
        Permission.PRODUTO_VIEW,
        Permission.PRODUTO_CREATE,
      ]);
      expect(result).toBe(true);
    });

    it("should return false when user lacks one permission", () => {
      const result = hasAllPermissions("viewer", [
        Permission.PRODUTO_VIEW,
        Permission.PRODUTO_DELETE,
      ]);
      expect(result).toBe(false);
    });

    it("should handle empty permissions array", () => {
      const result = hasAllPermissions("user", []);
      expect(result).toBe(true);
    });
  });

  describe("hasAnyPermission", () => {
    it("should return true when user has at least one permission", () => {
      const result = hasAnyPermission("viewer", [
        Permission.PRODUTO_VIEW,
        Permission.PRODUTO_DELETE,
      ]);
      expect(result).toBe(true);
    });

    it("should return false when user has no permissions", () => {
      const result = hasAnyPermission("viewer", [
        Permission.PRODUTO_DELETE,
        Permission.ADMIN_USERS,
      ]);
      expect(result).toBe(false);
    });

    it("should handle empty permissions array", () => {
      const result = hasAnyPermission("user", []);
      expect(result).toBe(false);
    });
  });

  describe("ROLE_PERMISSIONS", () => {
    it("should have admin role with all permissions", () => {
      const adminPermissions = ROLE_PERMISSIONS["admin"];
      expect(adminPermissions.length).toBe(Object.values(Permission).length);
    });

    it("should have user role with standard permissions", () => {
      const userPermissions = ROLE_PERMISSIONS["user"];
      expect(userPermissions.length).toBeGreaterThan(0);
      expect(userPermissions).toContain(Permission.PRODUTO_VIEW);
      expect(userPermissions).not.toContain(Permission.ADMIN_USERS);
    });

    it("should have viewer role with read-only permissions", () => {
      const viewerPermissions = ROLE_PERMISSIONS["viewer"];
      expect(viewerPermissions.every((p) => p.includes(":view"))).toBe(true);
    });
  });
});
