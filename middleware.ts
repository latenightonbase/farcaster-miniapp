import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Network, paymentMiddleware } from "x402-next";

export async function middleware(request: NextRequest) {
  const isProtectedPaymentRoute =
    request.nextUrl.pathname.startsWith("/api/sponsor");

  if (isProtectedPaymentRoute) {
    console.log(
      "Payment protection middleware triggered for:",
      request.nextUrl.pathname
    );

    return await paymentMiddleware(
      "0xC07f465Cb788De0088E33C03814E2c550dBe33db",
      {
        "/api/sponsor": {
          price: `$20`,
          network: "base" as Network,
          config: {
            description: `Adding your banner on display for 24 hours.`,
          },
        },
      },
      {
        url: "https://x402.org/facilitator",
      }
    )(request);
  }
  // Example: Add custom headers
  const response = NextResponse.next();
  response.headers.set("X-Custom-Header", "MyCustomHeaderValue");
  return response;
}

export const config = {
  // Match all routes
  matcher: "/:path*",
};
