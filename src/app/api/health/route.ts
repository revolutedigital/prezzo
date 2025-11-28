import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Health Check Endpoint
 *
 * Valida que o sistema está funcionando corretamente:
 * - API está respondendo
 * - Sistema está online
 *
 * @returns JSON com status do sistema
 */
export async function GET() {
  const startTime = Date.now();

  try {
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      service: "Prezzo API",
      environment: process.env.NODE_ENV,
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error.message || "Unknown error",
      },
      { status: 503 } // Service Unavailable
    );
  }
}
