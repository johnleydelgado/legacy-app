// src/lib/emailAssets.ts
import { readFileSync } from "fs";
import path from "path";

/**
 * Assumes you placed the PNG in apps/frontend/public/email/
 * and you call this code from that same package.
 *
 * process.cwd() = workspace root, so we must walk into apps/frontend
 */

// cwd = /…/legacy-app/apps/frontend  ← that’s already your app root
const logoPath = path.join(
  process.cwd(), // apps/frontend
  "public",
  "email",
  "LegacyLogo.png"
);

export const legacyLogoB64 = readFileSync(logoPath).toString("base64");
