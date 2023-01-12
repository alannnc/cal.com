import { NextRequest, NextResponse, userAgent } from "next/server";

import { CONSOLE_URL, WEBAPP_URL, WEBSITE_URL } from "@calcom/lib/constants";
import { isIpInBanlist } from "@calcom/lib/getIP";

import { MiddlewareFactory } from "./types";

export const defaultMiddleware: MiddlewareFactory = () => {
  return async (request: NextRequest) => {
    const url = request.nextUrl;

    if (["/api/collect-events", "/api/auth"].some((p) => url.pathname.startsWith(p))) {
      const callbackUrl = url.searchParams.get("callbackUrl");
      const { isBot } = userAgent(request);

      if (
        isBot ||
        (callbackUrl && ![CONSOLE_URL, WEBAPP_URL, WEBSITE_URL].some((u) => callbackUrl.startsWith(u))) ||
        isIpInBanlist(request)
      ) {
        // DDOS Prevention: Immediately end request with no response - Avoids a redirect as well initiated by NextAuth on invalid callback
        request.nextUrl.pathname = "/api/nope";
        return NextResponse.redirect(request.nextUrl);
      }
    }

    // Ensure that embed query param is there in when /embed is added.
    // query param is the way in which client side code knows that it is in embed mode.
    if (url.pathname.endsWith("/embed") && typeof url.searchParams.get("embed") !== "string") {
      url.searchParams.set("embed", "");
      return NextResponse.redirect(url);
    }

    // Don't 404 old routing_forms links
    if (url.pathname.startsWith("/apps/routing_forms")) {
      url.pathname = url.pathname.replace("/apps/routing_forms", "/apps/routing-forms");
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  };
};
