// The field manager's /code page asks for a fresh 6-digit phone setup code.
//
//   POST /api/m/code   header x-gasdost-manager: <manager password>  → { code, expiresAt }
//
// The manager password can only do this one thing. Few tries per minute are
// allowed, so it can't be guessed.

import { managerOk, newPairCode, roleOf, json } from "../lib/db.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const k = String(req.headers.get("x-gasdost-manager") || "").trim();
    // The office password works here too.
    const isOffice = [k, k.toUpperCase()].some((x) => roleOf({ headers: { get: () => x } }) === "admin");
    if (!isOffice && !(await managerOk(k))) {
      return json({ error: "Wrong manager password. Ask the office for the right one." }, 401);
    }
    return json(await newPairCode());
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config = {
  path: "/api/m/code",
  method: ["POST"],
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
