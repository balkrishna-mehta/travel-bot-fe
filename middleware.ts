import { NextResponse, NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/bookings", "/bookings/[id]"];

// Admin routes that require admin role
const ADMIN_ROUTES = [
  "/dashboard",
  "/admin",
  "/users",
  "/budget-bands",
  "/invoices",
  "/travel-requests",
  "/settings",
];

// Ticket issuer routes
const TICKET_ISSUER_ROUTES = ["/tickets", "/ticket-issuer"];

// Helper function to check if path matches any pattern
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route.includes("[id]")) {
      // Handle dynamic routes like /bookings/[id]
      const pattern = route.replace("[id]", "[^/]+");
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

// Helper function to check if user has refresh token (indicating they were authenticated)
function hasRefreshToken(request: NextRequest): boolean {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  return !!refreshToken;
}

// Helper function to get user role from token (for API calls only)
function getUserRoleFromToken(request: NextRequest): string | null {
  // Try to get token from Authorization header (from API calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      // Decode JWT token to get role (without verification since backend handles that)
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch (error) {
      return null;
    }
  }

  // Try to get token from x-access-token header (alternative)
  const accessTokenHeader = request.headers.get("x-access-token");
  if (accessTokenHeader) {
    try {
      const payload = JSON.parse(atob(accessTokenHeader.split(".")[1]));
      return payload.role;
    } catch (error) {
      return null;
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has refresh token (indicating they were authenticated)
  const hasRefresh = hasRefreshToken(request);

  // Get user role from token (for API calls or when we have access token)
  const userRole = getUserRoleFromToken(request);

  // If user is on login page and has refresh token, redirect to appropriate page
  if (pathname === "/login" && hasRefresh) {
    // For page navigation, we can't determine role without access token
    // So we'll redirect to dashboard and let the client-side handle role-based routing
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // If no refresh token found, redirect to login
  if (!hasRefresh) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For protected routes, we allow access if user has refresh token
  // Role-based access control will be handled client-side after token refresh
  // This is because we can't decode access token on server-side without storing it in cookies

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api/auth (auth API routes are handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
