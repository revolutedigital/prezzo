import {
  sanitizeEmail,
  sanitizeNumber,
  sanitizePhone,
  sanitizeCNPJ,
  preventSQLInjection,
} from "../sanitize";

describe("Sanitize Utils", () => {
  describe("sanitizeEmail", () => {
    it("should normalize valid email", () => {
      const result = sanitizeEmail("  Test@Example.COM  ");
      expect(result).toBe("test@example.com");
    });

    it("should return null for invalid email", () => {
      const result = sanitizeEmail("not-an-email");
      expect(result).toBeNull();
    });

    it("should handle empty string", () => {
      const result = sanitizeEmail("");
      expect(result).toBeNull();
    });
  });

  describe("sanitizeNumber", () => {
    it("should extract number from string", () => {
      const result = sanitizeNumber("R$ 1.234,56");
      expect(result).toBe(1234.56);
    });

    it("should handle negative numbers", () => {
      const result = sanitizeNumber("-123.45");
      expect(result).toBe(-123.45);
    });

    it("should return null for non-numeric string", () => {
      const result = sanitizeNumber("abc");
      expect(result).toBeNull();
    });

    it("should handle empty string", () => {
      const result = sanitizeNumber("");
      expect(result).toBeNull();
    });
  });

  describe("sanitizePhone", () => {
    it("should remove non-digit characters", () => {
      const result = sanitizePhone("(11) 98765-4321");
      expect(result).toBe("11987654321");
    });

    it("should handle phone with +55", () => {
      const result = sanitizePhone("+55 11 98765-4321");
      expect(result).toBe("5511987654321");
    });

    it("should handle empty string", () => {
      const result = sanitizePhone("");
      expect(result).toBe("");
    });
  });

  describe("sanitizeCNPJ", () => {
    it("should remove formatting characters", () => {
      const result = sanitizeCNPJ("12.345.678/0001-90");
      expect(result).toBe("12345678000190");
    });

    it("should handle unformatted CNPJ", () => {
      const result = sanitizeCNPJ("12345678000190");
      expect(result).toBe("12345678000190");
    });

    it("should handle empty string", () => {
      const result = sanitizeCNPJ("");
      expect(result).toBe("");
    });
  });

  describe("preventSQLInjection", () => {
    it("should remove SQL keywords", () => {
      const result = preventSQLInjection("SELECT * FROM users; DROP TABLE users;");
      expect(result).not.toContain("DROP");
      expect(result).not.toContain("SELECT");
    });

    it("should remove SQL comments", () => {
      const result = preventSQLInjection("admin' --");
      expect(result).not.toContain("--");
    });

    it("should remove dangerous procedures", () => {
      const result = preventSQLInjection("EXEC xp_cmdshell");
      expect(result).not.toContain("EXEC");
      expect(result).not.toContain("xp_");
    });

    it("should handle clean strings", () => {
      const result = preventSQLInjection("Clean user input");
      expect(result).toBe("Clean user input");
    });
  });
});
