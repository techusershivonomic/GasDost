// OLD storage (Netlify Blobs), kept only so the one-time move into the
// database can read what was saved before Build 28. Nothing writes here any more.

import { getStore } from "@netlify/blobs";
import { randomBytes, timingSafeEqual } from "node:crypto";

const STORE = "gasdost";
const CUSTOMERS_KEY = "customers";

export function store() {
  return getStore({ name: STORE, consistency: "strong" });
}

/* ---------------- auth ---------------- */

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

function env(name) {
  // Netlify.env in production; process.env when tests run the handler directly.
  return (globalThis.Netlify && globalThis.Netlify.env.get(name)) || process.env[name] || "";
}

// "admin" = the office console (ADMIN_KEY), "staff" = a delivery man's phone
// (STAFF_KEY, put on the phone by scanning the office's setup QR).
export function roleOf(req) {
  const key = req.headers.get("x-gasdost-key") || "";
  if (env("ADMIN_KEY") && safeEqual(key, env("ADMIN_KEY"))) return "admin";
  if (env("STAFF_KEY") && safeEqual(key, env("STAFF_KEY"))) return "staff";
  return null;
}

export function staffKey() {
  return env("STAFF_KEY");
}

/* ---------------- small utils ---------------- */

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const isMobile = (v) => /^[6-9]\d{9}$/.test(String(v || ""));

export function clean(v, max = 200) {
  return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max);
}

export function newToken() {
  return randomBytes(16).toString("base64url"); // 128 bits — not guessable
}

/* ---------------- customers ---------------- */

export async function readCustomers() {
  const s = store();
  const res = await s.getWithMetadata(CUSTOMERS_KEY, { type: "json" });
  if (!res || !res.data) return { doc: { seq: 0, customers: [] }, etag: null };
  const doc = res.data;
  if (!Array.isArray(doc.customers)) doc.customers = [];
  if (typeof doc.seq !== "number") doc.seq = 0;
  return { doc, etag: res.etag };
}

// Apply `change(doc)` and save, retrying if someone else saved in between.
export async function updateCustomers(change) {
  const s = store();
  for (let attempt = 0; attempt < 6; attempt++) {
    const { doc, etag } = await readCustomers();
    const result = change(doc);
    const opts = etag ? { onlyIfMatch: etag } : { onlyIfNew: true };
    const { modified } = await s.setJSON(CUSTOMERS_KEY, doc, opts);
    if (modified) return { doc, result };
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 200));
  }
  throw new Error("The customer list is busy — please try again.");
}

// Next code: C0001, C0002 … never reused, even after a customer is removed.
export function nextCode(doc) {
  let max = doc.seq || 0;
  for (const c of doc.customers) {
    const m = /^C(\d+)$/i.exec(c.code || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  doc.seq = max + 1;
  return "C" + String(doc.seq).padStart(4, "0");
}

/* ---------------- locations ---------------- */

export async function saveLocation(loc) {
  const at = Date.now();
  const rec = { ...loc, at };
  await store().setJSON(`loc/${String(at).padStart(13, "0")}_${loc.no}`, rec);
  return rec;
}

// Newest location per mobile number. Older entries for the same customer are
// tidied away as we go, so the list never grows beyond one per customer.
export async function latestLocations() {
  const s = store();
  const { blobs } = await s.list({ prefix: "loc/" });
  const newest = {};
  const stale = [];
  for (const b of blobs) {
    const m = /^loc\/(\d{13})_(\d{10})$/.exec(b.key);
    if (!m) continue;
    const [, ts, no] = m;
    if (!newest[no] || newest[no].ts < ts) {
      if (newest[no]) stale.push(newest[no].key);
      newest[no] = { ts, key: b.key };
    } else {
      stale.push(b.key);
    }
  }
  const out = await Promise.all(
    Object.values(newest).map((n) => s.get(n.key, { type: "json" }))
  );
  // Clean-up is best effort and must never break the read.
  Promise.all(stale.slice(0, 50).map((k) => s.delete(k))).catch(() => {});
  return out.filter(Boolean);
}

// Everything saved in the old storage, for the one-time move into the database.
export async function readOldEverything() {
  const { doc } = await readCustomers();
  const locations = await latestLocations();
  const s = store();
  const { blobs } = await s.list({ prefix: "team/" });
  const team = (await Promise.all(blobs.map((b) => s.get(b.key, { type: "json" })))).filter(Boolean);
  return { seq: doc.seq || 0, customers: doc.customers || [], locations, team };
}
