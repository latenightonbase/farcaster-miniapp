import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Network, paymentMiddleware } from "x402-next";
import { connectToDB } from "./utils/db";
import Meta from '@/utils/schemas/metaschema';
import axios from "axios";
import { facilitator } from "@coinbase/x402";

export async function middleware(request: NextRequest) {
  const isProtectedPaymentRoute =
    request.nextUrl.pathname.startsWith("/api/sponsor");

  if (isProtectedPaymentRoute) {
    console.log(
      "Payment protection middleware triggered for:",
      request.nextUrl.pathname
    );

    const res:any = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/getPrice`);

    console.log("Fetching price from API:", `${process.env.NEXT_PUBLIC_URL}/api/getPrice`);

    const data = await res.json();

    console.log("Fetched price data:", data);

    return await paymentMiddleware(
      "0xC07f465Cb788De0088E33C03814E2c550dBe33db",
      {
        "/api/sponsor": {
          price: `$${data.meta.meta_value}`,
          network: "base" as Network,
          config: {
            description: `Adding your banner on display for 24 hours.`,
          },
        },
      },
      {
        url: "https://facilitator.x402.rs"
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
