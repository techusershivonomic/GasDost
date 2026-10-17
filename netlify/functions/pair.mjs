// A delivery man's phone connects to the office with a 6-digit code shown on
// the office screen (instead of, or as well as, scanning the setup QR).
//
//   POST /api/p/claim  { code }  → { key }   the phone key, if the code is valid
//
// Codes last 10 minutes. Few tries per minute are allowed, so the code can't
// be guessed in that time.

import { claimPairCode, json } from "../lib/db.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body = {};
  try { body = await req.json(); } catch {}
  const code = String(body.code || "").replace(/\D/g, "");
  if (code.length !== 6) return json({ error: "Enter the 6-digit code from the office screen." }, 400);
  try {
    const key = await claimPairCode(code);
    if (!key) return json({ error: "That code is wrong or has expired. Ask the office for a new one." }, 404);
    return json({ key });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config = {
  path: "/api/p/claim",
  method: ["POST"],
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
