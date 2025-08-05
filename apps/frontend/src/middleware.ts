// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { decode } from "jsonwebtoken";

import { PAGE_DASHBOARD_URL } from "./constants/pageUrls";
import { homeByRole, Role, allowByRole } from "./utils/acl";
import { DecodedIdToken } from "./types";
import { PAGE_LOGIN_URL } from "./constants/pageUrls_old";

// Helper function to check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    const decoded = decode(token) as any;
    if (!decoded?.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    // Add 5 minute buffer before expiration
    return decoded.exp < (currentTime + 300);
  } catch {
    return true;
  }
}

// Helper function to get username from idToken
function getUsernameFromToken(idToken: string): string | null {
  try {
    const decoded = decode(idToken) as DecodedIdToken;
    return decoded["cognito:username"] || null;
  } catch {
    return null;
  }
}

// Helper function to refresh tokens
async function refreshUserTokens(refreshToken: string, username: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken, username }),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 0a) Allow public quote approval page ───────────────────────────────
  if (pathname.startsWith("/quotes/approve")) {
    return NextResponse.next();
  }

  // ── 0) Let all /api requests through (no auth) ────────────────────────────
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ── 1) Ignore Next.js internals ───────────────────────────────────────────
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // ── 2) Read tokens from cookies ───────────────────────────────────────────
  const idToken = request.cookies.get("idToken")?.value;
  const token = request.cookies.get("token")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // ── 3) Not logged in → redirect to /login ────────────────────────────────
  if (!idToken || !token) {
    if (pathname !== PAGE_LOGIN_URL) {
      return NextResponse.redirect(new URL(PAGE_LOGIN_URL, request.url));
    }
    return NextResponse.next();
  }

  // ── 4) Check if tokens are expired and attempt refresh ──────────────────
  const isAccessTokenExpired = isTokenExpired(token);
  const isIdTokenExpired = isTokenExpired(idToken);

  if ((isAccessTokenExpired || isIdTokenExpired) && refreshToken) {
    const username = getUsernameFromToken(idToken);
    
    if (username) {
      const refreshResult = await refreshUserTokens(refreshToken, username);
      
      if (refreshResult?.success) {
        // Create response and update cookies
        const response = NextResponse.next();
        
        if (refreshResult.tokens.AccessToken) {
          response.cookies.set("token", refreshResult.tokens.AccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 3600,
            path: "/",
          });
        }
        
        if (refreshResult.tokens.IdToken) {
          response.cookies.set("idToken", refreshResult.tokens.IdToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 3600,
            path: "/",
          });
        }
        
        if (refreshResult.tokens.RefreshToken) {
          response.cookies.set("refreshToken", refreshResult.tokens.RefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 2592000, // 30 days
            path: "/",
          });
        }
        
        // Continue with the refreshed tokens
        return response;
      } else {
        // Refresh failed, redirect to login
        const res = NextResponse.redirect(new URL(PAGE_LOGIN_URL, request.url));
        res.cookies.delete("idToken");
        res.cookies.delete("token");
        res.cookies.delete("refreshToken");
        return res;
      }
    }
  }

  // ── 5) Decode token and extract role ──────────────────────────────────────
  let role: Role | undefined;
  try {
    const decoded = decode(idToken) as DecodedIdToken;
    role = (decoded["cognito:groups"]?.[0] as Role) ?? "employee";
  } catch {
    const res = NextResponse.redirect(new URL(PAGE_LOGIN_URL, request.url));
    res.cookies.delete("idToken");
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }

  if (!role) {
    const res = NextResponse.redirect(new URL(PAGE_LOGIN_URL, request.url));
    res.cookies.delete("idToken");
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }

  // ── 6) Prevent logged-in from seeing /login ───────────────────────────────
  if (pathname === PAGE_LOGIN_URL) {
    return NextResponse.redirect(new URL(homeByRole[role], request.url));
  }

  // ── 7) Redirect /dashboard to role-home ──────────────────────────────────
  if (pathname === PAGE_DASHBOARD_URL) {
    const target = homeByRole[role];
    if (target !== PAGE_DASHBOARD_URL) {
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // ── 8) Block non-admin from /admin/** ────────────────────────────────────
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(homeByRole[role], request.url));
  }

  // ── 9) Role-based ACL for all other pages ────────────────────────────────
  const patterns = allowByRole[role] ?? [];
  const allowed = patterns.some((rx) => rx.test(pathname));

  if (!allowed) {
    const target = homeByRole[role];
    // If they can't access here, send them home (or to login if home is login)
    return NextResponse.redirect(
      new URL(target || PAGE_LOGIN_URL, request.url)
    );
  }

  // ── 10) Everything else is allowed ────────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"], // apply to all paths, but we early-exit /api and /_next above
};
