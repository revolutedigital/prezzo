import validator from "validator";

/**
 * Sanitiza HTML removendo scripts e tags perigosas
 */
export function sanitizeHtml(dirty: string): string {
  // Server-side: retorna string escapada
  return dirty
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitiza string removendo caracteres especiais perigosos
 */
export function sanitizeString(str: string): string {
  return validator.escape(str);
}

/**
 * Valida e sanitiza email
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!validator.isEmail(trimmed)) {
    return null;
  }
  return validator.normalizeEmail(trimmed) || trimmed;
}

/**
 * Valida e sanitiza URL
 */
export function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!validator.isURL(trimmed, { require_protocol: true })) {
    return null;
  }
  return trimmed;
}

/**
 * Sanitiza número removendo caracteres não numéricos
 */
export function sanitizeNumber(value: string): number | null {
  const cleaned = value.replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Sanitiza telefone removendo caracteres especiais
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Sanitiza CNPJ/CPF removendo caracteres especiais
 */
export function sanitizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

/**
 * Remove SQL injection patterns
 */
export function preventSQLInjection(str: string): string {
  return str.replace(
    /('|(--)|;|\/\*|\*\/|xp_|sp_|exec|execute|drop|create|alter|insert|update|delete)/gi,
    ""
  );
}
