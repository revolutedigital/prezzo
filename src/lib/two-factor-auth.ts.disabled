import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Generates a new 2FA secret for the user
 */
export async function generate2FASecret(userId: string, userName: string) {
  const secret = speakeasy.generateSecret({
    name: `Prezzo (${userName})`,
    issuer: "Prezzo",
  });

  // Save secret to user's configuration
  await prisma.$executeRaw`
    UPDATE User
    SET twoFactorSecret = ${secret.base32}
    WHERE id = ${userId}
  `;

  return secret;
}

/**
 * Generates QR code for 2FA setup
 */
export async function generate2FAQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Verifies a 2FA token
 */
export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 2, // Allow 2 time steps before and after
  });
}

/**
 * Enables 2FA for the user
 */
export async function enable2FA(userId: string, token: string): Promise<boolean> {
  // Get user's secret
  const user = await prisma.$queryRaw<any[]>`
    SELECT twoFactorSecret FROM User WHERE id = ${userId} LIMIT 1
  `;

  if (!user || user.length === 0 || !user[0].twoFactorSecret) {
    throw new Error("2FA secret not found. Please generate a new secret first.");
  }

  // Verify token
  const isValid = verify2FAToken(user[0].twoFactorSecret, token);

  if (!isValid) {
    return false;
  }

  // Enable 2FA in configuration
  await prisma.$executeRaw`
    UPDATE Configuracao
    SET enable2FA = true, updatedAt = ${new Date().toISOString()}
    WHERE userId = ${userId}
  `;

  return true;
}

/**
 * Disables 2FA for the user
 */
export async function disable2FA(userId: string, token: string): Promise<boolean> {
  // Get user's secret
  const user = await prisma.$queryRaw<any[]>`
    SELECT twoFactorSecret FROM User WHERE id = ${userId} LIMIT 1
  `;

  if (!user || user.length === 0 || !user[0].twoFactorSecret) {
    return false;
  }

  // Verify token before disabling
  const isValid = verify2FAToken(user[0].twoFactorSecret, token);

  if (!isValid) {
    return false;
  }

  // Disable 2FA
  await prisma.$executeRaw`
    UPDATE Configuracao
    SET enable2FA = false, updatedAt = ${new Date().toISOString()}
    WHERE userId = ${userId}
  `;

  // Clear secret
  await prisma.$executeRaw`
    UPDATE User
    SET twoFactorSecret = NULL
    WHERE id = ${userId}
  `;

  return true;
}

/**
 * Checks if user has 2FA enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  const config = await prisma.$queryRaw<any[]>`
    SELECT enable2FA FROM Configuracao WHERE userId = ${userId} LIMIT 1
  `;

  return config && config.length > 0 && config[0].enable2FA === true;
}

/**
 * Middleware helper for 2FA-protected routes
 */
export async function require2FA(request: Request): Promise<{ valid: boolean; error?: string }> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { valid: false, error: "Unauthorized" };
  }

  const enabled = await is2FAEnabled(session.user.id);

  if (!enabled) {
    return { valid: true }; // 2FA not required
  }

  // Check if 2FA token is in request headers
  const token = request.headers.get("x-2fa-token");

  if (!token) {
    return { valid: false, error: "2FA token required" };
  }

  // Get user's secret
  const user = await prisma.$queryRaw<any[]>`
    SELECT twoFactorSecret FROM User WHERE id = ${session.user.id} LIMIT 1
  `;

  if (!user || user.length === 0 || !user[0].twoFactorSecret) {
    return { valid: false, error: "2FA not configured properly" };
  }

  // Verify token
  const isValid = verify2FAToken(user[0].twoFactorSecret, token);

  if (!isValid) {
    return { valid: false, error: "Invalid 2FA token" };
  }

  return { valid: true };
}
