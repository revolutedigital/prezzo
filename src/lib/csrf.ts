import { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Gera um token CSRF
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Valida token CSRF
 */
export function validateCsrfToken(request: NextRequest, expectedToken: string): boolean {
  const token = request.headers.get("x-csrf-token");
  if (!token) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

/**
 * Middleware helper para validação CSRF
 */
export function withCsrfProtection(handler: (req: NextRequest) => Promise<Response>) {
  return async function (req: NextRequest) {
    // Skip CSRF para GET, HEAD, OPTIONS
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return handler(req);
    }

    const csrfToken = req.cookies.get("csrf-token")?.value;
    if (!csrfToken) {
      return new Response("CSRF token missing", { status: 403 });
    }

    const requestToken = req.headers.get("x-csrf-token");
    if (!requestToken || requestToken !== csrfToken) {
      return new Response("Invalid CSRF token", { status: 403 });
    }

    return handler(req);
  };
}
