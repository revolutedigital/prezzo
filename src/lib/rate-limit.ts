import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Limpa registros antigos a cada 5 minutos
setInterval(
  () => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  },
  5 * 60 * 1000
);

export interface RateLimitOptions {
  interval: number; // em milissegundos
  maxRequests: number;
}

/**
 * Rate limiter simples em memória
 * Para produção, considere usar Redis ou Upstash
 */
export function rateLimit(options: RateLimitOptions) {
  const { interval, maxRequests } = options;

  return function check(identifier: string): {
    success: boolean;
    remaining: number;
    reset: number;
  } {
    const now = Date.now();
    const key = identifier;

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + interval,
      };
      return {
        success: true,
        remaining: maxRequests - 1,
        reset: store[key].resetTime,
      };
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: store[key].resetTime,
      };
    }

    return {
      success: true,
      remaining: maxRequests - store[key].count,
      reset: store[key].resetTime,
    };
  };
}

/**
 * Middleware helper para rate limiting em API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {
    interval: 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requisições por minuto
  }
) {
  const limiter = rateLimit(options);

  return async function (req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const result = limiter(ip);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": options.maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": new Date(result.reset).toISOString(),
          },
        }
      );
    }

    const response = await handler(req);

    // Adiciona headers de rate limit
    response.headers.set("X-RateLimit-Limit", options.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(result.reset).toISOString());

    return response;
  };
}
