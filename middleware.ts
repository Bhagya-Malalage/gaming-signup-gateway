import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)", "/admin-dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // If a user tries to access /dashboard locally, send them to the external site
  if (isDashboardRoute(req)) {
    return NextResponse.redirect("https://www.yolo247.site/login");
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};