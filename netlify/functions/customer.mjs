// Public endpoint used by the customer's location page (share_location.html).
//
//   GET  /api/c/<token>   → that customer's own name, mobile, address, dealer, saved pin
//   POST /api/c/<token>   → save the location they picked { lat, lng, acc, partner }
//
// The token is the secret code in the customer's link. Without it nothing can
// be read or written, and it only ever reveals that one customer. The unique
// customer code (C0001…) is never sent out.

import { customerByToken, savePin, markLinkOpened, json, clean, isPartner, mobileOf } from "../lib/db.mjs";

export default async (req, context) => {
  const token = context.params.token;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token || "")) return json({ error: "This link is not valid." }, 404);
  try {
    const c = await customerByToken(token);
    if (!c) return json({ error: "This link is not valid any more. Please ask your gas agency to send a new one." }, 404);

    if (req.method === "GET") {
      await markLinkOpened(c.no).catch(() => {});
      return json({ name: c.name, mobile: mobileOf(c.no), address: c.address, dealer: c.dealer, location: c.location });
    }

    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
      const lat = Number(body.lat), lng = Number(body.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return json({ error: "That location could not be read. Please try again." }, 400);
      }
      const acc = Number(body.acc);
      const partner = clean(body.partner, 12).replace(/\D/g, "");
      await savePin({
        no: c.no,
        lat: Math.round(lat * 1e6) / 1e6,
        lng: Math.round(lng * 1e6) / 1e6,
        acc: Number.isFinite(acc) ? Math.round(acc) : null,
        partner: isPartner(partner) ? partner : "",
        via: "link",
      });
      return json({ ok: true, at: Date.now() });
    }
    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong. Please try again in a minute." }, 500);
  }
};

export const config = {
  path: "/api/c/:token",
  method: ["GET", "POST"],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
