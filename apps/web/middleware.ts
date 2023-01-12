import { defaultMiddleware } from "middlewares/defaultMiddleware";
import { stackMiddlewares } from "middlewares/stackMiddlewares";
import { withAuth } from "middlewares/withAuth";
import { collectEvents } from "next-collect/server";

import { extendEventData, nextCollectBasicSettings } from "@calcom/lib/telemetry";

export const config = {
  matcher: [
    "/api/collect-events/:path*",
    "/api/auth/:path*",
    "/apps/routing_forms/:path*",
    "/:path*/embed",
    "/settings/:path*",
  ],
};

export default collectEvents({
  middleware: stackMiddlewares([withAuth, defaultMiddleware]),
  ...nextCollectBasicSettings,
  cookieName: "__clnds",
  extend: extendEventData,
});
