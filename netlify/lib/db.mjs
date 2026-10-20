// GasDost server helpers — Netlify Database (Postgres).
//
// Tables (see netlify/database/migrations):
//   customers  office's master list, one row per mobile, with code + secret link token
//   locations  newest doorstep pin per mobile (from the customer's link or a delivery man)
//   bookings   current booking per mobile, shared by the office and every phone
//   team       delivery men and when their phone last checked in
//   deliveries permanent record of every delivery (for the history page)
//   meta       small settings

import { getDatabase } from "@netlify/database";
import { randomBytes, timingSafeEqual, createHash } from "node:crypto";

let _db = null;
export function db() {
  if (!_db) {
    // TEST_DB_URL is only set by the local test server.
    _db = process.env.TEST_DB_URL ? getDatabase({ connectionString: process.env.TEST_DB_URL }) : getDatabase();
  }
  return _db;
}
const q = (...a) => db().sql(...a);

/* ---------------- auth ---------------- */

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}
function env(name) {
  return (globalThis.Netlify && globalThis.Netlify.env.get(name)) || process.env[name] || "";
}
// "admin" = office console (ADMIN_KEY); "staff" = a delivery man's phone (STAFF_KEY).
export function roleOf(req) {
  const key = (req.headers.get("x-gasdost-key") || "").trim();
  if (env("ADMIN_KEY") && safeEqual(key, env("ADMIN_KEY"))) return "admin";
  if (env("STAFF_KEY") && safeEqual(key, env("STAFF_KEY"))) return "staff";
  return null;
}
export const staffKey = () => env("STAFF_KEY");

/* ---------------- small utils ---------------- */

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
export const isMobile = (v) => /^[6-9]\d{9}$/.test(String(v || ""));
export const isPartner = (v) => /^91[6-9]\d{9}$/.test(String(v || ""));
// A customer key: the 10-digit mobile, or mobile-2, mobile-3 … when the same
// mobile is a customer of more than one dealership.
export const isKey = (v) => /^[6-9]\d{9}(?:-\d{1,2})?$/.test(String(v || ""));
export function normKey(v) {
  const s = String(v == null ? "" : v).trim();
  const m = /^(?:\+?91[\s-]?)?(\d[\d\s]{8,}\d)(?:-(\d{1,2}))?$/.exec(s);
  if (!m) return "";
  const mob = m[1].replace(/\s/g, "");
  return mob.length === 10 ? mob + (m[2] ? "-" + m[2] : "") : "";
}
export const mobileOf = (k) => String(k || "").slice(0, 10);
const dkey = (d) => clean(d, 80).toLowerCase();
export function clean(v, max = 200) {
  return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max);
}
export const newToken = () => randomBytes(16).toString("base64url"); // 128 bits
const ms = (d) => (d ? new Date(d).getTime() : null);

function customerOut(r) {
  return {
    no: r.no, mobile: mobileOf(r.no), name: r.name, address: r.address, dealer: r.dealer, code: r.code, token: r.token,
    updated: ms(r.updated_at),
    location: r.lat != null ? { lat: r.lat, lng: r.lng, at: ms(r.loc_at) } : null,
  };
}
function bookingOut(r) {
  return {
    no: r.no, name: r.name, address: r.address, dealer: r.dealer, booking: r.booking, status: r.status,
    lat: r.lat, lng: r.lng, updated: ms(r.loc_at),
    assignedTo: r.assigned_to || null, deliveredBy: r.delivered_by || null, deliveredAt: ms(r.delivered_at),
    source: r.source, deleted: r.deleted, changedAt: ms(r.changed_at),
    linkSentAt: ms(r.link_sent_at),
  };
}

/* ---------------- customers ---------------- */

// Search / page through customers. Digits search the mobile number; anything
// else searches name, address, dealer and code.
export async function searchCustomers({ text = "", offset = 0, limit = 100, dealer = "" }) {
  const dl = dkey(dealer);
  const t = clean(text, 80);
  const digits = /^\d+$/.test(t) ? t : "";
  const like = "%" + t.replace(/[%_\\]/g, (m) => "\\" + m) + "%";
  limit = Math.max(1, Math.min(5000, limit | 0 || 100)); // up to 5,000 for Excel export
  offset = Math.max(0, offset | 0);
  const where = { t, digits, like };
  const [{ n }] = await q`
    SELECT count(*)::int AS n FROM customers c
    WHERE c.deleted_at IS NULL AND (${where.t} = '' OR (${where.digits} <> '' AND c.no LIKE ${where.digits + "%"})
       OR c.name ILIKE ${where.like} OR c.address ILIKE ${where.like}
       OR c.dealer ILIKE ${where.like} OR c.code ILIKE ${where.like})
      AND (${dl} = '' OR lower(trim(c.dealer)) = ${dl})`;
  const rows = await q`
    SELECT c.*, l.lat, l.lng, l.at AS loc_at FROM customers c
    LEFT JOIN locations l ON l.no = c.no
    WHERE c.deleted_at IS NULL AND (${where.t} = '' OR (${where.digits} <> '' AND c.no LIKE ${where.digits + "%"})
       OR c.name ILIKE ${where.like} OR c.address ILIKE ${where.like}
       OR c.dealer ILIKE ${where.like} OR c.code ILIKE ${where.like})
      AND (${dl} = '' OR lower(trim(c.dealer)) = ${dl})
    ORDER BY length(c.code) NULLS LAST, c.code, c.no  -- C9999 before C10000
    OFFSET ${offset} LIMIT ${limit}`;
  return { total: n, customers: rows.map(customerOut) };
}

// Keys come back as they are; a plain 10-digit mobile brings every
// dealership that mobile is a customer of.
export async function lookupCustomers(nos) {
  const list = [...new Set(nos.map(normKey).filter(isKey))].slice(0, 2000);
  if (!list.length) return [];
  const mobiles = list.filter((k) => k.length === 10);
  const rows = await q`
    SELECT c.*, l.lat, l.lng, l.at AS loc_at FROM customers c
    LEFT JOIN locations l ON l.no = c.no
    WHERE c.deleted_at IS NULL AND (c.no = ANY(${list}) OR left(c.no, 10) = ANY(${mobiles}))
    ORDER BY c.no`;
  return rows.map(customerOut);
}

// Which key a mobile + dealership is (or will be). taken = keys already used.
function keyFor(mobile, dealer, existing, taken) {
  const mine = existing.filter((e) => mobileOf(e.no) === mobile);
  const d = dkey(dealer);
  const same = mine.find((e) => dkey(e.dealer) === d) || (mine.length === 1 && (!d || !dkey(mine[0].dealer)) ? mine[0] : null);
  if (same) return { no: same.no, exists: true };
  for (let i = 1; i < 100; i++) {
    const k = i === 1 ? mobile : mobile + "-" + i;
    if (!taken.has(k)) return { no: k, exists: false };
  }
  return { no: "", exists: false };
}

// Add / update customers. New ones get the next code in file order; existing
// ones keep their code and link. Never burns a code on an existing customer.
export async function upsertCustomers(incoming) {
  // Same mobile + same dealership = the same customer (last row wins);
  // same mobile with another dealership = another customer.
  const seen = new Map();
  const fromMissing = []; // rows that came from the downloaded missing-mobile list
  let invalid = 0;
  for (const raw of incoming) {
    const key = normKey(raw.no);
    const name = clean(raw.name, 80);
    if (!isKey(key) || !name) { invalid++; continue; }
    const rec = { mobile: mobileOf(key), key, name, address: clean(raw.address, 300), dealer: clean(raw.dealer, 80) };
    if (/^\d{1,15}$/.test(String(raw.missingId || ""))) fromMissing.push(String(raw.missingId));
    // A full key (…-2) given back by the app updates exactly that customer.
    seen.set(key.length > 10 ? "k:" + key : rec.mobile + "|" + dkey(rec.dealer), rec);
  }
  const incomingRows = [...seen.values()];
  if (!incomingRows.length) return { added: 0, updated: 0, invalid };
  const mobiles = [...new Set(incomingRows.map((r) => r.mobile))];
  const existingRows = await q`SELECT no, dealer FROM customers WHERE left(no, 10) = ANY(${mobiles})`;
  const taken = new Set(existingRows.map((r) => r.no));
  const live = existingRows.slice();
  const upd = [], add = [];
  for (const r of incomingRows) {
    if (r.key.length > 10) {
      if (taken.has(r.key)) upd.push({ ...r, no: r.key });
      else invalid++;
      continue;
    }
    const k = keyFor(r.mobile, r.dealer, live, taken);
    if (!k.no) { invalid++; continue; }
    if (k.exists) upd.push({ ...r, no: k.no });
    else { add.push({ ...r, no: k.no }); taken.add(k.no); live.push({ no: k.no, dealer: r.dealer }); }
  }
  const rows = upd.concat(add);
  if (upd.length) {
    await q`
      UPDATE customers c SET name = u.name, address = u.address, dealer = u.dealer, updated_at = now(),
        deleted_at = NULL, deleted_by = NULL
      FROM unnest(${upd.map((r) => r.no)}::text[], ${upd.map((r) => r.name)}::text[],
                  ${upd.map((r) => r.address)}::text[], ${upd.map((r) => r.dealer)}::text[])
           AS u(no, name, address, dealer)
      WHERE c.no = u.no`;
  }
  if (add.length) {
    await q`
      INSERT INTO customers (no, name, address, dealer, token, code)
      SELECT s.no, s.name, s.address, s.dealer, s.token,
             'C' || lpad(s.n::text, GREATEST(4, length(s.n::text)), '0')   -- C0001 … C9999, C10000 …
      FROM (SELECT u.*, nextval('customer_code_seq') AS n
            FROM unnest(${add.map((r) => r.no)}::text[], ${add.map((r) => r.name)}::text[],
                        ${add.map((r) => r.address)}::text[], ${add.map((r) => r.dealer)}::text[],
                        ${add.map(() => newToken())}::text[]) WITH ORDINALITY AS u(no, name, address, dealer, token, ord)
            ORDER BY u.ord) s
      ON CONFLICT (no) DO NOTHING`;
  }
  // Anyone waiting in the missing-mobile list who now has a number leaves it.
  if (fromMissing.length) await q`DELETE FROM missing_mobile WHERE id = ANY(${fromMissing.map(Number)}::bigint[])`;
  await q`
    DELETE FROM missing_mobile m
    USING unnest(${rows.map((r) => r.name.toLowerCase())}::text[], ${rows.map((r) => r.address.toLowerCase())}::text[],
                 ${rows.map((r) => r.dealer.toLowerCase())}::text[]) AS u(name, address, dealer)
    WHERE lower(m.name) = u.name AND lower(m.address) = u.address AND lower(m.dealer) = u.dealer`;
  return { added: add.length, updated: upd.length, invalid };
}

/* ---------------- customers without a mobile number ---------------- */

export async function addMissing(list) {
  const rows = [];
  let corrected = 0;
  for (const r of list.slice(0, 2000)) {
    const name = clean(r.name, 80);
    if (!name) continue;
    const rec = { name, address: clean(r.address, 300), dealer: clean(r.dealer, 80), bad: clean(r.badMobile, 30) };
    // A row from the downloaded list (it has its ID): correct that row in place.
    if (/^\d{1,15}$/.test(String(r.id || ""))) {
      try {
        const u = await q`UPDATE missing_mobile SET name = ${rec.name}, address = ${rec.address}, dealer = ${rec.dealer}, bad_mobile = ${rec.bad}
                          WHERE id = ${Number(r.id)} RETURNING id`;
        if (u.length) { corrected++; continue; }
      } catch (e) {
        // The corrected row now matches another one exactly: keep just that one.
        await q`DELETE FROM missing_mobile WHERE id = ${Number(r.id)}`;
        corrected++; continue;
      }
    }
    rows.push(rec);
  }
  if (!rows.length) return { added: 0, corrected };
  const res = await q`
    INSERT INTO missing_mobile (name, address, dealer, bad_mobile)
    SELECT * FROM unnest(${rows.map((r) => r.name)}::text[], ${rows.map((r) => r.address)}::text[],
                         ${rows.map((r) => r.dealer)}::text[], ${rows.map((r) => r.bad)}::text[])
    ON CONFLICT DO NOTHING RETURNING id`;
  return { added: res.length, already: rows.length - res.length, corrected };
}
export async function clearMissing() { await q`DELETE FROM missing_mobile`; }
export async function listMissing({ text = "", offset = 0, limit = 100, dealer = null }) {
  limit = Math.max(1, Math.min(5000, limit | 0 || 100));
  offset = Math.max(0, offset | 0);
  const like = "%" + clean(text, 60).toLowerCase() + "%";
  const anyDealer = dealer == null ? 1 : 0;
  const dl = clean(dealer || "", 80).toLowerCase();
  const rows = await q`
    SELECT * FROM missing_mobile
    WHERE (lower(name) LIKE ${like} OR lower(address) LIKE ${like} OR lower(dealer) LIKE ${like})
      AND (${anyDealer} = 1 OR lower(trim(dealer)) = ${dl})
    ORDER BY dealer, name, id OFFSET ${offset} LIMIT ${limit}`;
  const [{ n }] = await q`
    SELECT count(*)::int AS n FROM missing_mobile
    WHERE (lower(name) LIKE ${like} OR lower(address) LIKE ${like} OR lower(dealer) LIKE ${like})
      AND (${anyDealer} = 1 OR lower(trim(dealer)) = ${dl})`;
  const [{ all }] = await q`SELECT count(*)::int AS all FROM missing_mobile`;
  // Each dealership in the list, with how many are waiting.
  const dealers = await q`
    SELECT min(trim(dealer)) AS dealer, count(*)::int AS n FROM missing_mobile
    GROUP BY lower(trim(dealer)) ORDER BY 2 DESC LIMIT 300`;
  return {
    total: n, all, dealers: dealers.map((d) => ({ dealer: d.dealer || "", n: d.n })),
    rows: rows.map((r) => ({ id: String(r.id), name: r.name, address: r.address, dealer: r.dealer, badMobile: r.bad_mobile })),
  };
}
// The office typed the number: the person becomes a normal customer. If that
// number already belongs to someone, nothing changes and that person is named.
export async function fixMissing(id, rawNo, force = false, by = "Office") {
  let no = String(rawNo || "").replace(/\D/g, "");
  if (no.length === 12 && no.startsWith("91")) no = no.slice(2);
  if (no.length === 11 && no.startsWith("0")) no = no.slice(1);
  if (!isMobile(no)) return { error: "Enter a valid 10-digit mobile number." };
  const [m] = await q`SELECT * FROM missing_mobile WHERE id = ${id}`;
  if (!m) return { error: "Already done — refresh the list." };
  // Only the same mobile at the same dealership is a clash; another
  // dealership with this mobile is simply another customer.
  const same = (await q`SELECT no, name, address, dealer FROM customers WHERE left(no, 10) = ${no} AND deleted_at IS NULL`)
    .find((c) => dkey(c.dealer) === dkey(m.dealer));
  if (same && !force) return { taken: { no: mobileOf(same.no), name: same.name, address: same.address, dealer: same.dealer } };
  const r = await upsertCustomers([{ no, name: m.name, address: m.address, dealer: m.dealer }]);
  await q`DELETE FROM missing_mobile WHERE id = ${id}`;
  await q`INSERT INTO missing_filled (no, name, dealer, by) VALUES (${no}, ${m.name}, ${m.dealer}, ${clean(by, 80)})`;
  await q`DELETE FROM missing_filled WHERE at < now() - interval '180 days'`;
  return { ok: true, no, ...r };
}
// Who filled which number, newest first.
export async function missingFilled(limit = 100) {
  const rows = await q`SELECT * FROM missing_filled ORDER BY at DESC LIMIT ${Math.max(1, Math.min(500, limit | 0 || 100))}`;
  return rows.map((r) => ({ at: ms(r.at), no: r.no, name: r.name, dealer: r.dealer, by: r.by }));
}
export async function deleteMissing(id) { await q`DELETE FROM missing_mobile WHERE id = ${id}`; }

// A name/address typed on a phone fills in a customer's blank details —
// it never overwrites what the office already has.
async function fillBlankCustomerDetails(rows) {
  const r = rows.filter((x) => isKey(x.no) && (x.name || x.address));
  if (!r.length) return;
  await q`
    UPDATE customers c SET
      name = CASE WHEN c.name = '' AND u.name <> '' THEN u.name ELSE c.name END,
      address = CASE WHEN c.address = '' AND u.address <> '' THEN u.address ELSE c.address END,
      updated_at = now()
    FROM unnest(${r.map((x) => x.no)}::text[], ${r.map((x) => x.name || "")}::text[], ${r.map((x) => x.address || "")}::text[])
         AS u(no, name, address)
    WHERE c.no = u.no AND ((c.name = '' AND u.name <> '') OR (c.address = '' AND u.address <> ''))`;
}

// Deleting puts customers in the recycle bin for 30 days.
export async function deleteCustomer(no, by = "") {
  const r = await q`UPDATE customers SET deleted_at = now(), deleted_by = ${by} WHERE no = ${no} AND deleted_at IS NULL RETURNING name`;
  if (r.length) await logDelete("delete", 1, by, (r[0].name || "") + " · " + mobileOf(no));
  await purgeBin();
  return r.length;
}
export async function deleteAllCustomers(by = "") {
  const r = await q`UPDATE customers SET deleted_at = now(), deleted_by = ${by} WHERE deleted_at IS NULL RETURNING no`;
  await logDelete("delete-all", r.length, by, "");
  return r.length;
}
export async function restoreCustomers({ nos = [], all = false }, by = "") {
  const keys = nos.map(normKey).filter(isKey);
  const r = all
    ? await q`UPDATE customers SET deleted_at = NULL, deleted_by = NULL WHERE deleted_at IS NOT NULL RETURNING no`
    : await q`UPDATE customers SET deleted_at = NULL, deleted_by = NULL WHERE deleted_at IS NOT NULL AND no = ANY(${keys}) RETURNING no`;
  await logDelete(all ? "restore-all" : "restore", r.length, by, all ? "" : keys.slice(0, 5).map(mobileOf).join(", "));
  return r.length;
}
export async function listBin({ text = "", offset = 0, limit = 100 }) {
  limit = Math.max(1, Math.min(5000, limit | 0 || 100));
  offset = Math.max(0, offset | 0);
  const like = "%" + clean(text, 60) + "%";
  const rows = await q`
    SELECT no, name, address, dealer, code, deleted_at, deleted_by FROM customers
    WHERE deleted_at IS NOT NULL AND (name ILIKE ${like} OR no LIKE ${like} OR dealer ILIKE ${like} OR code ILIKE ${like})
    ORDER BY deleted_at DESC, code OFFSET ${offset} LIMIT ${limit}`;
  const [{ n }] = await q`SELECT count(*)::int AS n FROM customers
    WHERE deleted_at IS NOT NULL AND (name ILIKE ${like} OR no LIKE ${like} OR dealer ILIKE ${like} OR code ILIKE ${like})`;
  const [{ all }] = await q`SELECT count(*)::int AS all FROM customers WHERE deleted_at IS NOT NULL`;
  return { total: n, all, rows: rows.map((r) => ({ no: r.no, mobile: mobileOf(r.no), name: r.name, address: r.address, dealer: r.dealer,
    code: r.code, deletedAt: ms(r.deleted_at), deletedBy: r.deleted_by || "" })) };
}
// After 30 days in the bin a customer is removed for good.
async function purgeBin() {
  const r = await q`DELETE FROM customers WHERE deleted_at < now() - interval '30 days' RETURNING no`;
  if (r.length) await logDelete("purge", r.length, "auto", "30 days in the recycle bin");
}
async function logDelete(action, count, by, detail) {
  await q`INSERT INTO delete_log (action, count, by, detail) VALUES (${action}, ${count}, ${clean(by, 60)}, ${clean(detail, 200)})`;
}
export async function deleteLog() {
  const rows = await q`SELECT * FROM delete_log ORDER BY at DESC LIMIT 50`;
  return rows.map((r) => ({ at: ms(r.at), action: r.action, count: r.count, by: r.by, detail: r.detail }));
}

/* Delete PIN: needed for every customer delete. Starts from the DELETE_PIN
   setting; once changed in the console it is kept (hashed) in the database.
   5 wrong tries lock deleting for 15 minutes. */
const pinHash = (pin) => createHash("sha256").update("gasdost-pin:" + String(pin)).digest("hex");
export async function checkPin(pin) {
  const lock = Number(await getMeta("pin_locked_until")) || 0;
  if (lock > Date.now()) return { ok: false, locked: Math.ceil((lock - Date.now()) / 60000) };
  const saved = await getMeta("delete_pin_hash");
  const want = saved || (env("DELETE_PIN") ? pinHash(env("DELETE_PIN")) : "");
  if (!want) return { ok: false, notSet: true };
  if (/^\d{4,8}$/.test(String(pin || "")) && safeEqual(pinHash(pin), want)) {
    await setMeta("pin_fails", "0");
    return { ok: true };
  }
  const fails = (Number(await getMeta("pin_fails")) || 0) + 1;
  await setMeta("pin_fails", String(fails));
  if (fails >= 5) { await setMeta("pin_locked_until", String(Date.now() + 15 * 60000)); await setMeta("pin_fails", "0"); }
  return { ok: false, left: Math.max(0, 5 - fails) };
}
export async function changePin(oldPin, newPin, by = "") {
  const c = await checkPin(oldPin);
  if (!c.ok) return c;
  if (!/^\d{4,8}$/.test(String(newPin || ""))) return { ok: false, error: "The new PIN must be 4 to 8 digits." };
  await setMeta("delete_pin_hash", pinHash(newPin));
  await logDelete("pin-changed", 0, by, "");
  return { ok: true };
}

// Secret link codes. Anyone a link is sent to becomes a customer if they
// weren't one, so the location they send back always has somewhere to land.
export async function ensureTokens(items) {
  const byNo = new Map();
  for (const it of items) {
    const no = normKey(it.no);
    if (isKey(no) && !byNo.has(no)) byNo.set(no, it);
  }
  const nos = [...byNo.keys()].slice(0, 2000);
  if (!nos.length) return {};
  await q`UPDATE customers SET deleted_at = NULL, deleted_by = NULL WHERE no = ANY(${nos}) AND deleted_at IS NOT NULL`;
  const have = await q`SELECT no FROM customers WHERE no = ANY(${nos})`;
  const known = new Set(have.map((r) => r.no));
  // Only a plain mobile can be made into a new customer here.
  const missing = nos.filter((n) => !known.has(n) && n.length === 10);
  if (missing.length) {
    const it = (n) => byNo.get(n);
    await q`
      INSERT INTO customers (no, name, address, dealer, token, code)
      SELECT s.no, s.name, s.address, s.dealer, s.token, 'C' || lpad(s.n::text, GREATEST(4, length(s.n::text)), '0')
      FROM (SELECT u.*, nextval('customer_code_seq') AS n FROM unnest(${missing}::text[],
                  ${missing.map((n) => { const v = clean(it(n).name, 80); return v === "New Customer" ? "" : v; })}::text[],
                  ${missing.map((n) => { const v = clean(it(n).address, 300); return v === "Address pending" ? "" : v; })}::text[],
                  ${missing.map((n) => clean(it(n).dealer, 80))}::text[],
                  ${missing.map(() => newToken())}::text[]) WITH ORDINALITY AS u(no, name, address, dealer, token, ord)
      ORDER BY u.ord) s
      ON CONFLICT (no) DO NOTHING`;
  }
  await fillBlankCustomerDetails(nos.filter((n) => known.has(n)).map((n) => {
    const it = byNo.get(n);
    const name = clean(it.name, 80), address = clean(it.address, 300);
    return { no: n, name: name === "New Customer" ? "" : name, address: address === "Address pending" ? "" : address };
  }));
  const rows = await lookupCustomers(nos);
  const out = {};
  rows.forEach((r) => { out[r.no] = r; });
  return out;
}

export async function customerByToken(token) {
  const rows = await q`
    SELECT c.*, l.lat, l.lng, l.at AS loc_at FROM customers c
    LEFT JOIN locations l ON l.no = c.no WHERE c.token = ${token} AND c.deleted_at IS NULL`;
  return rows[0] ? customerOut(rows[0]) : null;
}

/* ---------------- locations ---------------- */

// A doorstep pin — from the customer's link page, or set by a delivery man.
// The customer's booking (if any) moves to the pin straight away; if there is
// no booking yet and we know which delivery man sent the link, one is made
// for him so the pin lands on his map.
export async function savePin({ no, lat, lng, acc = null, partner = "", via = "phone" }) {
  await q`
    INSERT INTO locations (no, lat, lng, acc, partner, at, via) VALUES (${no}, ${lat}, ${lng}, ${acc}, ${partner}, now(), ${via})
    ON CONFLICT (no) DO UPDATE SET lat = EXCLUDED.lat, lng = EXCLUDED.lng, acc = EXCLUDED.acc,
      partner = EXCLUDED.partner, at = EXCLUDED.at, via = EXCLUDED.via`;
  if (via === "link") await q`UPDATE customers SET link_opened_at = COALESCE(link_opened_at, now()) WHERE no = ${no}`;
  const upd = await q`
    UPDATE bookings SET lat = ${lat}, lng = ${lng}, loc_at = now(), pin_via = ${via},
      link_opened_at = CASE WHEN ${via} = 'link' THEN COALESCE(link_opened_at, now()) ELSE link_opened_at END,
      status = CASE WHEN status = 'delivered' THEN status ELSE 'shared' END, changed_at = now()
    WHERE no = ${no} AND NOT deleted RETURNING no`;
  if (!upd.length && isPartner(partner)) {
    await q`
      INSERT INTO bookings (no, name, address, dealer, booking, status, lat, lng, loc_at, assigned_to, source, pin_via)
      SELECT ${no}, COALESCE(c.name, ''), COALESCE(c.address, ''), COALESCE(c.dealer, ''), ${"BK-" + no},
             'shared', ${lat}, ${lng}, now(), ${partner}, 'link', ${via}
      FROM (SELECT 1) one LEFT JOIN customers c ON c.no = ${no}
      ON CONFLICT (no) DO UPDATE SET lat = EXCLUDED.lat, lng = EXCLUDED.lng, loc_at = EXCLUDED.loc_at, pin_via = EXCLUDED.pin_via,
        status = 'shared', deleted = false, assigned_to = EXCLUDED.assigned_to,
        delivered_by = NULL, delivered_at = NULL, changed_at = now()`;
  }
}

/* ---------------- bookings ---------------- */

// New bookings (office upload, phone add/import). A customer's booking is
// replaced by the new one; name/address/dealer come from the customer list
// when not given; a saved doorstep pin is used straight away.
export async function newBookings(list, defaults = {}) {
  const seen = new Map();
  for (const b of list) {
    const no = normKey(b.no);
    if (!isKey(no)) continue;
    seen.set(no, {
      no,
      name: (b.name && b.name !== "New Customer") ? clean(b.name, 80) : "",
      address: (b.address && b.address !== "Address pending") ? clean(b.address, 300) : "",
      dealer: clean(b.dealer, 80),
      booking: clean(b.booking, 40) || "BK-" + no,
      assigned: isPartner(b.assignedTo) ? b.assignedTo : (isPartner(defaults.assignedTo) ? defaults.assignedTo : ""),
      source: clean(b.source || defaults.source || "", 20),
    });
  }
  const rows = [...seen.values()];
  if (!rows.length) return 0;
  const col = (k) => rows.map((r) => r[k]);
  await q`
    INSERT INTO bookings (no, name, address, dealer, booking, status, lat, lng, loc_at, assigned_to, source,
                          deleted, delivered_by, delivered_at, created_at, changed_at,
                          pin_via, link_sent_at, link_sent_by, link_opened_at)
    SELECT u.no,
           COALESCE(NULLIF(u.name, ''), c.name, ''), COALESCE(NULLIF(u.address, ''), c.address, ''),
           COALESCE(NULLIF(u.dealer, ''), c.dealer, ''), u.booking,
           CASE WHEN l.no IS NULL THEN 'waiting' ELSE 'shared' END, l.lat, l.lng, l.at,
           NULLIF(u.assigned, ''), u.source, false, NULL, NULL, now(), now(),
           CASE WHEN l.no IS NULL THEN NULL ELSE 'saved' END, NULL, NULL, NULL
    FROM unnest(${col("no")}::text[], ${col("name")}::text[], ${col("address")}::text[], ${col("dealer")}::text[],
                ${col("booking")}::text[], ${col("assigned")}::text[], ${col("source")}::text[])
         AS u(no, name, address, dealer, booking, assigned, source)
    LEFT JOIN customers c ON c.no = u.no
    LEFT JOIN locations l ON l.no = u.no
    ON CONFLICT (no) DO UPDATE SET
      name = EXCLUDED.name, address = EXCLUDED.address, dealer = EXCLUDED.dealer, booking = EXCLUDED.booking,
      status = EXCLUDED.status, lat = EXCLUDED.lat, lng = EXCLUDED.lng, loc_at = EXCLUDED.loc_at,
      assigned_to = EXCLUDED.assigned_to, source = EXCLUDED.source, deleted = false,
      delivered_by = NULL, delivered_at = NULL, created_at = now(), changed_at = now(),
      pin_via = EXCLUDED.pin_via, link_sent_at = NULL, link_sent_by = NULL, link_opened_at = NULL`;
  await fillBlankCustomerDetails(rows);
  return rows.length;
}

// Small changes from a phone: delivered / undelivered / pin / edit / delete.
export async function applyOps(ops, actor) {
  let done = 0;
  for (const o of ops.slice(0, 500)) {
    const no = normKey(o.no);
    if (!isKey(no)) continue;
    if (o.op === "delivered") {
      await q`UPDATE bookings SET status = 'delivered', delivered_by = ${actor || null},
              delivered_at = COALESCE(to_timestamp(${(Number(o.at) || Date.now()) / 1000}), now()), changed_at = now()
              WHERE no = ${no}`;
      await q`
        INSERT INTO deliveries (no, name, address, dealer, booking, booking_created, assigned_to, delivered_by, delivered_at)
        SELECT no, name, address, dealer, booking, created_at, assigned_to, delivered_by, delivered_at
        FROM bookings WHERE no = ${no} AND status = 'delivered'
        ON CONFLICT (no, booking_created) DO UPDATE SET delivered_by = EXCLUDED.delivered_by,
          delivered_at = EXCLUDED.delivered_at, name = EXCLUDED.name, address = EXCLUDED.address`;
    } else if (o.op === "undelivered") {
      await q`DELETE FROM deliveries d USING bookings b
              WHERE b.no = ${no} AND d.no = b.no AND d.booking_created = b.created_at`;
      await q`UPDATE bookings SET status = CASE WHEN lat IS NULL THEN 'waiting' ELSE 'shared' END,
              delivered_by = NULL, delivered_at = NULL, changed_at = now() WHERE no = ${no}`;
    } else if (o.op === "pin") {
      const lat = Number(o.lat), lng = Number(o.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
      await savePin({ no, lat, lng, partner: actor || "" });
    } else if (o.op === "edit") {
      await q`UPDATE bookings SET
              name = COALESCE(NULLIF(${clean(o.name, 80)}, ''), name),
              address = COALESCE(NULLIF(${o.address === "Address pending" ? "" : clean(o.address, 300)}, ''), address),
              changed_at = now() WHERE no = ${no}`;
      await fillBlankCustomerDetails([{ no, name: clean(o.name, 80), address: o.address === "Address pending" ? "" : clean(o.address, 300) }]);
    } else if (o.op === "delete" || o.op === "cancel") {
      await q`UPDATE bookings SET deleted = true, changed_at = now() WHERE no = ${no}`;
    } else if (o.op === "linksent") {
      // WhatsApp was opened with this customer's location link.
      const at = new Date(Number(o.at) || Date.now());
      await q`UPDATE bookings SET link_sent_at = ${at}, link_sent_by = ${actor || "office"} WHERE no = ${no} AND NOT deleted`;
      await q`UPDATE customers SET link_sent_at = ${at}, link_sent_by = ${actor || "office"} WHERE no = ${no}`;
    } else if (o.op === "assign") {
      // to: a delivery man's 91XXXXXXXXXX, "office" (held at the office), or "" (any delivery man)
      const to = isPartner(o.to) ? o.to : (o.to === "office" ? "office" : null);
      await q`UPDATE bookings SET assigned_to = ${to}, changed_at = now() WHERE no = ${no} AND status <> 'delivered'`;
    } else continue;
    done++;
  }
  return done;
}

// What a phone needs. First time: its open bookings plus today's delivered.
// After that: whatever changed since its last check (including removals).
export async function syncForPhone(me, sinceMs) {
  const [{ now }] = await q`SELECT now() AS now`;
  let rows;
  if (sinceMs) {
    const since = new Date(Number(sinceMs) - 5000); // small overlap so nothing slips between checks
    rows = await q`
      SELECT * FROM bookings
      WHERE changed_at > ${since}
        AND (assigned_to = ${me} OR assigned_to IS NULL OR delivered_by = ${me})
      ORDER BY changed_at LIMIT 5000`;
  } else {
    rows = await q`
      SELECT * FROM bookings
      WHERE NOT deleted
        AND (assigned_to = ${me} OR assigned_to IS NULL OR delivered_by = ${me})
        AND (status <> 'delivered' OR delivered_at > date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')
      ORDER BY changed_at LIMIT 5000`;
  }
  // Everything this phone should be holding right now — anything else on the
  // phone (moved to someone else, cancelled) is removed there.
  const mine = await q`
    SELECT no FROM bookings
    WHERE NOT deleted
      AND (assigned_to = ${me} OR assigned_to IS NULL OR delivered_by = ${me})
      AND (status <> 'delivered' OR delivered_at > date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')`;
  return { now: ms(now), bookings: rows.map(bookingOut), mine: mine.map((r) => r.no) };
}

// Office lists (send links etc.): open bookings, or all current ones.
export async function listBookings({ filter = "pending", limit = 1000 }) {
  limit = Math.max(1, Math.min(5000, limit | 0 || 1000));
  const rows = filter === "pending"
    ? await q`SELECT * FROM bookings WHERE NOT deleted AND status = 'waiting' ORDER BY created_at DESC LIMIT ${limit}`
    : await q`SELECT * FROM bookings WHERE NOT deleted
              AND (status <> 'delivered' OR delivered_at > date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')
              ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(bookingOut);
}

// The bookings behind a number on the office's Delivery status screen.
// view: pending | delivered (today) | all (both);  who: a phone, "unassigned", or "" for everyone.
export async function bookingsBehind({ view = "all", who = "", dealer = null }) {
  const w = who === "unassigned" ? "" : who;
  const anyone = who === "" ? 1 : 0;
  const anyDealer = dealer == null ? 1 : 0;
  const dl = clean(dealer || "", 80).toLowerCase();
  const rows = await q`
    SELECT b.*, COALESCE(NULLIF(b.dealer, ''), c.dealer, '') AS dealer_name,
           t.name AS assigned_name, d.name AS delivered_name FROM bookings b
    LEFT JOIN customers c ON c.no = b.no
    LEFT JOIN team t ON t.phone = b.assigned_to
    LEFT JOIN team d ON d.phone = b.delivered_by
    WHERE NOT b.deleted
      AND (${anyDealer} = 1 OR lower(trim(COALESCE(NULLIF(b.dealer, ''), c.dealer, ''))) = ${dl})
      AND ( (b.status = 'waiting' AND ${view} = 'waiting')
         OR (b.status <> 'delivered' AND ${view} IN ('pending', 'all'))
         OR (b.status = 'delivered' AND ${view} IN ('delivered', 'all')
             AND b.delivered_at > date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata') )
      AND ( ${anyone} = 1 OR
            COALESCE(CASE WHEN b.status = 'delivered' THEN COALESCE(b.delivered_by, b.assigned_to) ELSE b.assigned_to END, '') = ${w} )
    ORDER BY b.status = 'delivered', b.created_at DESC
    LIMIT 2000`;
  return rows.map((r) => ({ ...bookingOut(r), dealer: r.dealer_name, assignedName: r.assigned_name || "", deliveredName: r.delivered_name || "" }));
}

// Delivery history (office): every delivery between two dates (IST, inclusive),
// for one delivery man or everyone.
export async function deliveryHistory({ from, to, who = "", dealer = "" }) {
  const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? v : null);
  const f = day(from), t = day(to) || f;
  if (!f) return { rows: [], capped: false };
  const anyone = who ? 0 : 1;
  const dl = clean(dealer, 80);
  const anyDealer = dl ? 0 : 1;
  const rows = await q`
    SELECT d.*, COALESCE(NULLIF(d.dealer, ''), c.dealer, '') AS dealer_name,
           COALESCE(NULLIF(d.name, ''), c.name, '') AS cust_name,
           a.name AS assigned_name, m.name AS delivered_name FROM deliveries d
    LEFT JOIN customers c ON c.no = d.no
    LEFT JOIN team a ON a.phone = d.assigned_to
    LEFT JOIN team m ON m.phone = d.delivered_by
    WHERE d.delivered_at >= (${f}::date)::timestamp AT TIME ZONE 'Asia/Kolkata'
      AND d.delivered_at <  ((${t}::date) + 1)::timestamp AT TIME ZONE 'Asia/Kolkata'
      AND (${anyone} = 1 OR COALESCE(d.delivered_by, d.assigned_to, '') = ${who})
      AND (${anyDealer} = 1 OR lower(COALESCE(NULLIF(d.dealer, ''), c.dealer, '')) = lower(${dl}))
    ORDER BY d.delivered_at
    LIMIT 20001`;
  return {
    capped: rows.length > 20000,
    rows: rows.slice(0, 20000).map((r) => ({
      no: r.no, name: r.cust_name, address: r.address, dealer: r.dealer_name, booking: r.booking,
      deliveredAt: ms(r.delivered_at), deliveredBy: r.delivered_by || r.assigned_to || "",
      deliveredName: r.delivered_name || r.assigned_name || "",
    })),
  };
}

// One customer's last two deliveries (search by mobile digits or name).
export async function customerDeliveries(text) {
  const t = clean(text, 60);
  const digits = t.replace(/\D/g, "");
  if (digits.length < 4 && t.length < 3) return { rows: [] };
  const like = "%" + t.toLowerCase() + "%";
  const rows = await q`
    SELECT * FROM (
      SELECT d.*, COALESCE(NULLIF(d.dealer, ''), c.dealer, '') AS dealer_name,
             COALESCE(NULLIF(d.name, ''), c.name, '') AS cust_name,
             m.name AS delivered_name, a.name AS assigned_name,
             row_number() OVER (PARTITION BY d.no ORDER BY d.delivered_at DESC) AS rn
      FROM deliveries d
      LEFT JOIN team m ON m.phone = d.delivered_by
      LEFT JOIN team a ON a.phone = d.assigned_to
      LEFT JOIN customers c ON c.no = d.no
      WHERE (${digits.length >= 4 ? 1 : 0} = 1 AND d.no LIKE ${"%" + digits + "%"})
         OR (${digits.length >= 4 ? 0 : 1} = 1 AND (lower(d.name) LIKE ${like} OR lower(COALESCE(c.name, '')) LIKE ${like}))
    ) x WHERE rn <= 2
    ORDER BY no, delivered_at DESC
    LIMIT 100`;
  return {
    rows: rows.map((r) => ({
      no: r.no, name: r.cust_name, address: r.address, dealer: r.dealer_name, booking: r.booking,
      deliveredAt: ms(r.delivered_at), deliveredBy: r.delivered_by || r.assigned_to || "",
      deliveredName: r.delivered_name || r.assigned_name || "",
    })),
  };
}

// Every dealership name in use (for the history filter).
export async function listDealers() {
  const rows = await q`
    SELECT DISTINCT trim(dealer) AS dealer FROM customers WHERE trim(dealer) <> '' AND deleted_at IS NULL
    UNION SELECT DISTINCT trim(dealer) FROM deliveries WHERE trim(dealer) <> ''
    UNION SELECT DISTINCT trim(dealer) FROM bookings WHERE trim(dealer) <> '' AND NOT deleted
    ORDER BY 1 LIMIT 500`;
  // Same name typed in different case counts once.
  const seen = new Map();
  rows.forEach((r) => { const k = r.dealer.toLowerCase(); if (!seen.has(k)) seen.set(k, r.dealer); });
  return [...seen.values()];
}

/* ---------------- location tracker ---------------- */

// The customer opened their link page.
export async function markLinkOpened(no) {
  await q`UPDATE bookings SET link_opened_at = COALESCE(link_opened_at, now()) WHERE no = ${no} AND NOT deleted`;
  await q`UPDATE customers SET link_opened_at = COALESCE(link_opened_at, now()) WHERE no = ${no}`;
}

// The same counts over every saved customer (not bookings), per dealership.
async function customerTracker() {
  const rows = await q`
    SELECT lower(trim(c.dealer)) AS key, min(trim(c.dealer)) AS dealer, count(*)::int AS total,
           count(*) FILTER (WHERE c.link_sent_at IS NOT NULL)::int AS sent,
           count(*) FILTER (WHERE c.link_opened_at IS NOT NULL)::int AS opened,
           count(l.no)::int AS pinned,
           count(l.no) FILTER (WHERE l.via = 'link')::int AS pinned_link,
           count(l.no) FILTER (WHERE COALESCE(l.via, '') <> 'link')::int AS pinned_other,
           count(*) FILTER (WHERE c.link_sent_at IS NOT NULL AND l.no IS NULL)::int AS sent_not_pinned,
           count(*) FILTER (WHERE c.link_sent_at IS NULL AND l.no IS NULL)::int AS not_sent
    FROM customers c LEFT JOIN locations l ON l.no = c.no WHERE c.deleted_at IS NULL GROUP BY 1`;
  return rows.map((r) => ({ ...r, key: r.key || "", dealer: r.dealer || "" }));
}
async function customerTrackerList({ key, dealer }) {
  const anyDealer = dealer == null ? 1 : 0;
  const dl = clean(dealer || "", 80).toLowerCase();
  const rows = await q`
    SELECT c.no, c.name, c.address, c.dealer, c.link_sent_at, c.link_sent_by, c.link_opened_at,
           l.no IS NOT NULL AS pinned, l.via, sb.name AS sent_name
    FROM customers c LEFT JOIN locations l ON l.no = c.no LEFT JOIN team sb ON sb.phone = c.link_sent_by
    WHERE c.deleted_at IS NULL AND (${anyDealer} = 1 OR lower(trim(c.dealer)) = ${dl})
      AND CASE ${key}
        WHEN 'sent' THEN c.link_sent_at IS NOT NULL
        WHEN 'opened' THEN c.link_opened_at IS NOT NULL
        WHEN 'pinned' THEN l.no IS NOT NULL
        WHEN 'pinned_link' THEN l.no IS NOT NULL AND l.via = 'link'
        WHEN 'pinned_other' THEN l.no IS NOT NULL AND COALESCE(l.via, '') <> 'link'
        WHEN 'sent_not_pinned' THEN c.link_sent_at IS NOT NULL AND l.no IS NULL
        WHEN 'not_sent' THEN c.link_sent_at IS NULL AND l.no IS NULL
        ELSE true END
    ORDER BY c.link_sent_at DESC NULLS LAST, c.name
    LIMIT 5000`;
  return rows.map((r) => ({
    no: r.no, name: r.name, address: r.address, dealer: r.dealer, booking: "", assignedTo: null, assignedName: "",
    linkSentAt: ms(r.link_sent_at), linkSentBy: r.link_sent_by || "", linkSentName: r.link_sent_by === "office" ? "Office" : (r.sent_name || ""),
    linkOpenedAt: ms(r.link_opened_at), pinVia: r.pinned ? (r.via || "saved") : "", customer: true,
  }));
}

// Which bookings the tracker looks at: current ones (open + delivered today),
// or those booked between two dates (IST).
function trackerRange(from, to) {
  const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? v : null);
  const f = day(from), t = day(to) || f;
  return { f, t, all: f ? 0 : 1 };
}

// Counts per dealership: sent / opened / pinned via link / pinned other ways /
// sent but not pinned / not sent, plus doorsteps saved across all customers.
export async function linkTracker({ from, to, scope }) {
  if (scope === "customers") {
    const rows = await customerTracker();
    return { rows, saved: rows.map((r) => ({ key: r.key, dealer: r.dealer, customers: r.total, saved: r.pinned })) };
  }
  const { f, t, all } = trackerRange(from, to);
  const rows = await q`
    WITH s AS (
      SELECT lower(trim(COALESCE(NULLIF(b.dealer, ''), c.dealer, ''))) AS key,
             trim(COALESCE(NULLIF(b.dealer, ''), c.dealer, '')) AS dealer,
             (b.lat IS NOT NULL) AS pinned, b.pin_via, b.link_sent_at IS NOT NULL AS sent, b.link_opened_at IS NOT NULL AS opened
      FROM bookings b LEFT JOIN customers c ON c.no = b.no
      WHERE NOT b.deleted AND (
        (${all} = 1 AND (b.status <> 'delivered' OR b.delivered_at > date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'))
        OR (${all} = 0 AND b.created_at >= (${f}::date)::timestamp AT TIME ZONE 'Asia/Kolkata'
                       AND b.created_at <  ((${t}::date) + 1)::timestamp AT TIME ZONE 'Asia/Kolkata')))
    SELECT key, min(dealer) AS dealer, count(*)::int AS total,
           count(*) FILTER (WHERE sent)::int AS sent,
           count(*) FILTER (WHERE opened)::int AS opened,
           count(*) FILTER (WHERE pinned)::int AS pinned,
           count(*) FILTER (WHERE pinned AND pin_via = 'link')::int AS pinned_link,
           count(*) FILTER (WHERE pinned AND COALESCE(pin_via, '') <> 'link')::int AS pinned_other,
           count(*) FILTER (WHERE sent AND NOT pinned)::int AS sent_not_pinned,
           count(*) FILTER (WHERE NOT sent AND NOT pinned)::int AS not_sent
    FROM s GROUP BY key`;
  const saved = await q`
    SELECT lower(trim(c.dealer)) AS key, min(trim(c.dealer)) AS dealer, count(*)::int AS customers,
           count(l.no)::int AS saved
    FROM customers c LEFT JOIN locations l ON l.no = c.no WHERE c.deleted_at IS NULL GROUP BY 1`;
  return {
    rows: rows.map((r) => ({ ...r, dealer: r.dealer || "" })),
    saved: saved.map((r) => ({ key: r.key || "", dealer: r.dealer || "", customers: r.customers, saved: r.saved })),
  };
}

// The bookings behind one tracker number.
export async function trackerList({ key, dealer = null, from, to, scope }) {
  const k = ["total", "sent", "opened", "pinned", "pinned_link", "pinned_other", "sent_not_pinned", "not_sent"].includes(key) ? key : "total";
  if (scope === "customers") return customerTrackerList({ key: k, dealer });
  const { f, t, all } = trackerRange(from, to);
  const anyDealer = dealer == null ? 1 : 0;
  const dl = clean(dealer || "", 80).toLowerCase();
  const rows = await q`
    SELECT b.*, COALESCE(NULLIF(b.dealer, ''), c.dealer, '') AS dealer_name, t.name AS assigned_name, sb.name AS sent_name
    FROM bookings b LEFT JOIN customers c ON c.no = b.no
    LEFT JOIN team t ON t.phone = b.assigned_to
    LEFT JOIN team sb ON sb.phone = b.link_sent_by
    WHERE NOT b.deleted AND (
        (${all} = 1 AND (b.status <> 'delivered' OR b.delivered_at > date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'))
        OR (${all} = 0 AND b.created_at >= (${f}::date)::timestamp AT TIME ZONE 'Asia/Kolkata'
                       AND b.created_at <  ((${t}::date) + 1)::timestamp AT TIME ZONE 'Asia/Kolkata'))
      AND (${anyDealer} = 1 OR lower(trim(COALESCE(NULLIF(b.dealer, ''), c.dealer, ''))) = ${dl})
      AND CASE ${k}
        WHEN 'sent' THEN b.link_sent_at IS NOT NULL
        WHEN 'opened' THEN b.link_opened_at IS NOT NULL
        WHEN 'pinned' THEN b.lat IS NOT NULL
        WHEN 'pinned_link' THEN b.lat IS NOT NULL AND b.pin_via = 'link'
        WHEN 'pinned_other' THEN b.lat IS NOT NULL AND COALESCE(b.pin_via, '') <> 'link'
        WHEN 'sent_not_pinned' THEN b.link_sent_at IS NOT NULL AND b.lat IS NULL
        WHEN 'not_sent' THEN b.link_sent_at IS NULL AND b.lat IS NULL
        ELSE true END
    ORDER BY b.link_sent_at NULLS LAST, b.created_at DESC
    LIMIT 5000`;
  return rows.map((r) => ({
    ...bookingOut(r), dealer: r.dealer_name, assignedName: r.assigned_name || "",
    linkSentAt: ms(r.link_sent_at), linkSentBy: r.link_sent_by || "", linkSentName: r.link_sent_by === "office" ? "Office" : (r.sent_name || ""),
    linkOpenedAt: ms(r.link_opened_at), pinVia: r.lat != null ? (r.pin_via || "saved") : "",
  }));
}

// Same counts per dealership (from the booking, or the customer list).
export async function dealerSummary() {
  const rows = await q`
    SELECT lower(trim(COALESCE(NULLIF(b.dealer, ''), c.dealer, ''))) AS key,
           min(trim(COALESCE(NULLIF(b.dealer, ''), c.dealer, ''))) AS dealer,
           count(*) FILTER (WHERE b.status <> 'delivered')::int AS pending,
           count(*) FILTER (WHERE b.status = 'waiting')::int AS waiting,
           count(*) FILTER (WHERE b.status = 'delivered')::int AS delivered
    FROM bookings b LEFT JOIN customers c ON c.no = b.no
    WHERE NOT b.deleted AND (b.status <> 'delivered' OR b.delivered_at > date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')
    GROUP BY 1`;
  return rows.map((r) => ({ dealer: r.dealer || "", pending: r.pending, waiting: r.waiting, delivered: r.delivered }));
}

// Delivery status for the office: open bookings and today's deliveries per man.
export async function statusSummary(dealer = "") {
  const dl = dkey(dealer);
  const rows = await q`
    SELECT COALESCE(CASE WHEN b.status = 'delivered' THEN COALESCE(b.delivered_by, b.assigned_to) ELSE b.assigned_to END, '') AS who,
           count(*) FILTER (WHERE b.status <> 'delivered')::int AS pending,
           count(*) FILTER (WHERE b.status = 'waiting')::int AS waiting,
           count(*) FILTER (WHERE b.status = 'delivered')::int AS delivered
    FROM bookings b LEFT JOIN customers c ON c.no = b.no
    WHERE NOT b.deleted AND (b.status <> 'delivered' OR b.delivered_at > date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')
      AND (${dl} = '' OR lower(trim(COALESCE(NULLIF(b.dealer, ''), c.dealer, ''))) = ${dl})
    GROUP BY 1`;
  return rows;
}

/* ---------------- team ---------------- */

// A phone checking in. Returns when the office last logged this phone out
// (the phone compares it with when it logged in).
export async function pingTeam(phone, name, loginAt, dealer) {
  const dl = dealer == null ? null : clean(dealer, 80);
  const rows = await q`SELECT logout_at FROM team WHERE phone = ${phone}`;
  const logoutAt = rows[0] ? ms(rows[0].logout_at) : null;
  if (logoutAt && (!loginAt || Number(loginAt) < logoutAt)) return { logoutAt }; // logged out: don't mark active
  await q`INSERT INTO team (phone, name, last_active, dealer) VALUES (${phone}, ${clean(name, 60)}, now(), ${dl})
          ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, last_active = now(),
            dealer = COALESCE(EXCLUDED.dealer, team.dealer)`;
  return { logoutAt };
}
export async function logoutAtFor(phone) {
  const rows = await q`SELECT logout_at FROM team WHERE phone = ${phone}`;
  return rows[0] ? ms(rows[0].logout_at) : null;
}
// Delivery men currently logged in (anyone logged out by the office is left
// off until he logs in again).
// Also left off: anyone not seen for 3 days who has nothing pending.
export async function listTeam() {
  const rows = await q`
    SELECT * FROM team t
    WHERE (t.logout_at IS NULL OR t.last_active > t.logout_at)
      AND (t.last_active > now() - interval '3 days'
           OR EXISTS (SELECT 1 FROM bookings b WHERE b.assigned_to = t.phone AND NOT b.deleted AND b.status <> 'delivered'))
    ORDER BY name`;
  return rows.map((r) => ({ phone: r.phone, name: r.name, lastActive: ms(r.last_active), dealer: r.dealer }));
}
export async function logoutTeam(phone) {
  await q`UPDATE team SET logout_at = now() WHERE phone = ${phone}`;
}
// Every name ever seen, so logged-out men still show by name.
export async function teamNames() {
  const rows = await q`SELECT phone, name FROM team`;
  const out = {};
  rows.forEach((r) => { out[r.phone] = r.name; });
  return out;
}
// Office removes a delivery man: his phone is signed out and his open
// bookings wait at the office for someone else.
export async function removeTeam(phone) {
  await logoutTeam(phone);
  const moved = await q`UPDATE bookings SET assigned_to = 'office', changed_at = now()
                        WHERE assigned_to = ${phone} AND NOT deleted AND status <> 'delivered' RETURNING no`;
  return moved.length;
}
export async function deleteTeam(phone) { await q`DELETE FROM team WHERE phone = ${phone}`; }

/* ---------------- one-time move from the old storage ---------------- */

/* ---------------- phone setup codes ---------------- */

// A 6-digit code the office shows; a phone typing it gets the phone key.
export async function newPairCode() {
  await q`DELETE FROM meta WHERE key LIKE 'pair:%' AND (CASE WHEN value ~ '^[0-9]+$' THEN value::bigint ELSE 0 END) < ${Date.now()}`;
  let code;
  for (let i = 0; i < 20; i++) {
    code = String(randomBytes(4).readUInt32BE(0) % 1000000).padStart(6, "0");
    const taken = await q`SELECT 1 FROM meta WHERE key = ${"pair:" + code}`;
    if (!taken.length) break;
  }
  const expiresAt = Date.now() + 10 * 60 * 1000;
  await q`INSERT INTO meta (key, value) VALUES (${"pair:" + code}, ${String(expiresAt)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  return { code, expiresAt };
}
export async function claimPairCode(code) {
  const [row] = await q`SELECT value FROM meta WHERE key = ${"pair:" + code}`;
  if (!row || Number(row.value) < Date.now()) return null;
  return staffKey() || null;
}

export async function getMeta(key) {
  const r = await q`SELECT value FROM meta WHERE key = ${key}`;
  return r[0] ? r[0].value : null;
}
export async function setMeta(key, value) {
  await q`INSERT INTO meta (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

// Customers (with their codes and already-sent links), locations and team
// saved before Build 28 are copied in once. Safe to run again: nothing is
// overwritten.
export async function importOld(old) {
  let customers = 0, locations = 0, team = 0;
  for (const c of old.customers || []) {
    if (!isMobile(c.no) || !c.token) continue;
    const r = await q`
      INSERT INTO customers (no, name, address, dealer, code, token)
      VALUES (${c.no}, ${clean(c.name, 80)}, ${clean(c.address, 300)}, ${clean(c.dealer, 80)}, ${c.code || null}, ${c.token})
      ON CONFLICT DO NOTHING RETURNING no`;
    customers += r.length;
  }
  await q`SELECT setval('customer_code_seq', GREATEST(
            (SELECT COALESCE(max(substring(code from 2)::int), 0) FROM customers WHERE code ~ '^C[0-9]+$'),
            ${old.seq || 0}::int, 1))`;
  for (const l of old.locations || []) {
    if (!isMobile(l.no)) continue;
    const r = await q`
      INSERT INTO locations (no, lat, lng, acc, partner, at)
      VALUES (${l.no}, ${l.lat}, ${l.lng}, ${l.acc ?? null}, ${l.partner || ""}, to_timestamp(${(l.at || Date.now()) / 1000}))
      ON CONFLICT (no) DO NOTHING RETURNING no`;
    locations += r.length;
  }
  for (const m of old.team || []) {
    if (!isPartner(m.phone)) continue;
    const r = await q`
      INSERT INTO team (phone, name, last_active) VALUES (${m.phone}, ${clean(m.name, 60)}, to_timestamp(${(m.lastActive || Date.now()) / 1000}))
      ON CONFLICT (phone) DO NOTHING RETURNING phone`;
    team += r.length;
  }
  return { customers, locations, team };
}

/* ---------------- new connections (fiber cylinders) ---------------- */

const NC_PHOTO_DAYS = 90;
function ncOut(r, names = {}) {
  return {
    id: String(r.id), at: ms(r.at), phone: r.phone, man: r.man_name || names[r.phone] || "", name: r.name, mobile: r.mobile,
    address: r.address, dealer: r.dealer, lat: r.lat, lng: r.lng, serial: r.serial, amount: Number(r.amount) || 0,
    payMode: r.pay_mode, cashReceivedAt: ms(r.cash_received_at), aadhaar: r.aadhaar_last4 ? "XXXX XXXX " + r.aadhaar_last4 : "",
    status: r.status, statusAt: ms(r.status_at), statusNote: r.status_note,
    hasPhotos: !r.photos_deleted_at && Number(r.photo_count || 0) > 0,
    photos: !r.photos_deleted_at && r.photo_sides ? String(r.photo_sides).split(",") : [],
  };
}
// Stock with each delivery man: given − returned − used (pending + done).
export async function ncStock() {
  const given = await q`SELECT phone, COALESCE(sum(qty) FILTER (WHERE qty > 0), 0)::int AS given,
                               COALESCE(-sum(qty) FILTER (WHERE qty < 0), 0)::int AS returned FROM nc_stock GROUP BY phone`;
  const used = await q`SELECT phone, count(*)::int AS used FROM new_connections WHERE status <> 'rejected' GROUP BY phone`;
  const names = await teamNames();
  const map = {};
  given.forEach((g) => { map[g.phone] = { phone: g.phone, given: g.given, returned: g.returned, used: 0 }; });
  used.forEach((u) => { (map[u.phone] = map[u.phone] || { phone: u.phone, given: 0, returned: 0, used: 0 }).used = u.used; });
  return Object.values(map).map((m) => ({ ...m, name: names[m.phone] || "", left: m.given - m.returned - m.used }))
    .sort((a, b) => (a.name || a.phone).localeCompare(b.name || b.phone));
}
export async function ncStockFor(phone) {
  return (await ncStock()).find((s) => s.phone === phone) || { phone, given: 0, returned: 0, used: 0, left: 0 };
}
export async function ncMoveStock(phone, qty, note = "") {
  qty = Math.trunc(Number(qty) || 0);
  if (!isPartner(phone) || !qty || Math.abs(qty) > 1000) return { error: "Choose a delivery man and a quantity." };
  if (qty < 0 && (await ncStockFor(phone)).left + qty < 0) return { error: "He doesn't have that many cylinders left." };
  await q`INSERT INTO nc_stock (phone, qty, note) VALUES (${phone}, ${qty}, ${clean(note, 120)})`;
  return { ok: true, stock: await ncStockFor(phone) };
}
export async function ncStockLog(limit = 100) {
  const rows = await q`SELECT * FROM nc_stock ORDER BY at DESC LIMIT ${limit}`;
  const names = await teamNames();
  return rows.map((r) => ({ at: ms(r.at), phone: r.phone, name: names[r.phone] || "", qty: r.qty, note: r.note }));
}
function photoBytes(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ""));
  if (!m) return null;
  const buf = Buffer.from(m[2], "base64");
  return buf.length > 50 && buf.length <= 1500000 ? { mime: m[1], buf } : null;
}
export async function ncCreate(b, phone) {
  const name = clean(b.name, 80), mobile = String(b.mobile || "").replace(/\D/g, "").slice(-10);
  if (!name) return { error: "Enter the customer's name." };
  if (!isMobile(mobile)) return { error: "Enter a valid 10-digit mobile number." };
  const aad = String(b.aadhaarLast4 || "").replace(/\D/g, "");
  if (aad && aad.length !== 4) return { error: "Aadhaar: type only the last 4 digits." };
  const front = photoBytes(b.front), back = photoBytes(b.back);
  if (!front) return { error: "Take a photo of the Aadhaar card (front)." };
  if (!back) return { error: "Take a photo of the Aadhaar card (back)." };
  const live = photoBytes(b.live), photo = photoBytes(b.photo);
  if ((await ncStockFor(phone)).left <= 0) return { error: "You have no fiber cylinders left. Ask the office for stock." };
  const lat = Number(b.lat), lng = Number(b.lng);
  const okLoc = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat || lng);
  const amount = Math.max(0, Math.min(100000, Math.round((Number(b.amount) || 0) * 100) / 100));
  const mode = ["cash", "upi", "none"].includes(b.payMode) ? b.payMode : (amount ? "cash" : "none");
  const [r] = await q`
    INSERT INTO new_connections (phone, man_name, name, mobile, address, dealer, lat, lng, serial, amount, pay_mode, aadhaar_last4)
    VALUES (${phone}, ${clean(b.manName, 40)}, ${name}, ${mobile}, ${clean(b.address, 300)}, ${clean(b.dealer, 80)},
            ${okLoc ? lat : null}, ${okLoc ? lng : null}, ${clean(b.serial, 40)}, ${amount}, ${mode}, ${aad})
    RETURNING id`;
  await q`INSERT INTO nc_photos (conn_id, side, mime, data) VALUES (${r.id}, 'front', ${front.mime}, ${front.buf})`;
  await q`INSERT INTO nc_photos (conn_id, side, mime, data) VALUES (${r.id}, 'back', ${back.mime}, ${back.buf})`;
  if (live) await q`INSERT INTO nc_photos (conn_id, side, mime, data) VALUES (${r.id}, 'live', ${live.mime}, ${live.buf})`;
  if (photo) await q`INSERT INTO nc_photos (conn_id, side, mime, data) VALUES (${r.id}, 'photo', ${photo.mime}, ${photo.buf})`;
  return { ok: true, id: String(r.id), stock: await ncStockFor(phone) };
}
export async function ncList({ status = "", phone = "", text = "", dealer = "", limit = 300, from = null, to = null } = {}) {
  const dl = dkey(dealer);
  await ncPurgePhotos();
  const like = "%" + clean(text, 60).toLowerCase() + "%";
  const rows = await q`
    SELECT n.*, (SELECT count(*) FROM nc_photos p WHERE p.conn_id = n.id) AS photo_count,
           (SELECT string_agg(side, ',') FROM nc_photos p WHERE p.conn_id = n.id) AS photo_sides
    FROM new_connections n
    WHERE (${status} = '' OR n.status = ${status}) AND (${phone} = '' OR n.phone = ${phone})
      AND (${dl} = '' OR lower(trim(n.dealer)) = ${dl})
      AND (lower(n.name) LIKE ${like} OR n.mobile LIKE ${like} OR lower(n.address) LIKE ${like} OR lower(n.serial) LIKE ${like})
      AND (${from}::timestamptz IS NULL OR n.at >= ${from}::timestamptz) AND (${to}::timestamptz IS NULL OR n.at < ${to}::timestamptz)
    ORDER BY n.at DESC LIMIT ${Math.max(1, Math.min(5000, limit | 0 || 300))}`;
  const names = await teamNames();
  return rows.map((r) => ncOut(r, names));
}
export async function ncPhoto(id, side) {
  const [p] = await q`SELECT mime, data FROM nc_photos WHERE conn_id = ${id} AND side = ${side}`;
  return p || null;
}
export async function ncSetStatus(id, status, note = "") {
  if (!["pending", "done", "rejected"].includes(status)) return { error: "Bad status" };
  const [n] = await q`UPDATE new_connections SET status = ${status}, status_at = now(), status_note = ${clean(note, 200)}
                      WHERE id = ${id} RETURNING *`;
  if (!n) return { error: "Not found" };
  if (status === "done") {
    // Becomes a normal saved customer, with the doorstep already pinned.
    await upsertCustomers([{ no: n.mobile, name: n.name, address: n.address, dealer: n.dealer }]);
    const [c] = (await q`SELECT no, dealer FROM customers WHERE left(no, 10) = ${n.mobile} AND deleted_at IS NULL`)
      .filter((x) => dkey(x.dealer) === dkey(n.dealer)).concat([null]);
    if (c && n.lat != null) await savePin({ no: c.no, lat: n.lat, lng: n.lng, via: "phone" });
  }
  return { ok: true };
}
export async function ncCash(id, received) {
  await q`UPDATE new_connections SET cash_received_at = ${received ? new Date() : null} WHERE id = ${id}`;
  return { ok: true };
}
// Aadhaar photos are removed 90 days after a connection is Done (or Rejected).
export async function ncPurgePhotos() {
  const old = await q`SELECT id FROM new_connections WHERE status IN ('done','rejected') AND photos_deleted_at IS NULL
                      AND status_at < now() - make_interval(days => ${NC_PHOTO_DAYS})`;
  for (const o of old) {
    await q`DELETE FROM nc_photos WHERE conn_id = ${o.id}`;
    await q`UPDATE new_connections SET photos_deleted_at = now() WHERE id = ${o.id}`;
  }
}
