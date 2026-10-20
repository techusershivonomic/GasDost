// Private endpoints for the office console and the delivery men's phones.
// Every call carries the x-gasdost-key header:
//   ADMIN_KEY → the office (everything)
//   STAFF_KEY → a delivery man's phone (his bookings, links, team check-in)
//
//   GET    /api/whoami                         which key is this?
//   POST   /api/pair-code                      6-digit phone setup code (10 minutes)     (admin)
//   GET    /api/staff-key                      key for the phone setup QR                 (admin)
//   POST   /api/import-old                     one-time move from the old storage         (admin)
//
//   GET    /api/customers?q=&offset=&limit=    search / page through customers            (admin)
//   POST   /api/customers                      add / update up to 2,000 customers         (admin)
//   DELETE /api/customers/<no>  {pin}          to the recycle bin (30 days)               (admin)
//   DELETE /api/customers  {pin, confirm}      everyone to the recycle bin                (admin)
//   GET    /api/customers/bin                  the recycle bin                            (admin)
//   POST   /api/customers/restore              bring back {nos} or {all:true}             (admin)
//   GET    /api/customers/log                  delete / restore history                   (admin)
//   POST   /api/customers/pin                  change the Delete PIN                      (admin)
//   GET    /api/missing?q=&offset=             customers still without a mobile number    (admin, phone)
//   POST   /api/missing                        add up to 2,000 of them                    (admin)
//   POST   /api/missing/<id>/fix               give one a mobile number                   (admin, phone: no replacing)
//   GET    /api/missing/filled                 who filled which number                    (admin)
//   DELETE /api/missing/<id>                   remove one                                 (admin)
//   POST   /api/lookup                         details for given mobiles                  (admin, staff)
//   POST   /api/links                          secret link codes (+details) for mobiles   (admin, staff)
//
//   POST   /api/bookings                       new bookings                               (admin, staff)
//   POST   /api/ops                            delivered / pin / edit / cancel / assign    (admin, staff)
//   GET    /api/sync?since=&me=                a phone's bookings changed since           (staff, admin)
//   GET    /api/bookings?filter=pending|all    office lists                               (admin)
//   GET    /api/bookings?view=&who=            bookings behind a Delivery status number   (admin)
//   GET    /api/history?from=&to=&who=         deliveries between two dates               (admin)
//   GET    /api/history?customer=              a customer's last two deliveries           (admin)
//   GET    /api/tracker?from=&to=              location links: sent / opened / pinned     (admin)
//   GET    /api/tracker?list=&dealer=&from=&to= the bookings behind one tracker number   (admin)
//   GET    /api/status                         open + delivered-today per delivery man    (admin)
//
//   POST   /api/team                           "I'm active" from a phone                  (admin, staff)
//   GET    /api/team                           delivery men (+ last seen for the office)  (admin, staff)
//   POST   /api/team/<phone>/logout            sign that phone out                         (admin)
//   POST   /api/team/<phone>/remove            sign out + open bookings to the office     (admin)
//   POST   /api/team/<phone>/bye               the phone signed itself out                (admin, staff)
//   POST   /api/nc                             punch a new connection (Aadhaar photos)    (staff)
//   GET    /api/nc/mine?me=                    my fiber stock + my new connections        (staff)
//   GET    /api/nc · /api/nc/stock             list · stock per delivery man              (admin)
//   POST   /api/nc/stock                       give (+) / take back (−) stock             (admin)
//   GET    /api/nc/<id>/photo?side=            Aadhaar photo                              (admin)
//   POST   /api/nc/<id>/status · /cash         done / rejected · cash received            (admin)

import {
  roleOf, staffKey, json, isPartner, normKey,
  searchCustomers, upsertCustomers, deleteCustomer, restoreCustomers, listBin, deleteLog, checkPin, changePin, addMissing, listMissing, fixMissing, missingFilled, deleteMissing, clearMissing, deleteAllCustomers, lookupCustomers, ensureTokens,
  newBookings, applyOps, syncForPhone, listBookings, statusSummary, bookingsBehind, deliveryHistory, customerDeliveries, listDealers, dealerSummary, linkTracker, trackerList,
  ncStock, ncStockFor, ncMoveStock, ncStockLog, ncCreate, ncList, ncPhoto, ncSetStatus, ncCash,
  pingTeam, newPairCode, listTeam, deleteTeam, logoutTeam, removeTeam, teamNames, logoutAtFor, getMeta, setMeta, importOld,
} from "../lib/db.mjs";

export default async (req) => {
  const role = roleOf(req);
  if (!role) return json({ error: "Wrong or missing password" }, 401);

  const url = new URL(req.url);
  const [what, id, parts2] = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const m = req.method;
  const p = url.searchParams;
  const body = m === "POST" || m === "DELETE" ? await req.json().catch(() => ({})) : {};
  const adminOnly = () => json({ error: "Only the office can do that" }, 403);
  const isAdmin = role === "admin";

  try {
    if (what === "whoami" && m === "GET") return json({ role });
    if (what === "dealers" && m === "GET") return json({ dealers: await listDealers() });

    if (what === "pair-code" && m === "POST") {
      if (!isAdmin) return adminOnly();
      return json(await newPairCode());
    }

    if (what === "staff-key" && m === "GET") {
      if (!isAdmin) return adminOnly();
      return json({ key: staffKey() });
    }

    if (what === "import-old" && m === "POST") {
      if (!isAdmin) return adminOnly();
      if (await getMeta("old_storage_imported")) return json({ already: true });
      let old = { customers: [], locations: [], team: [] };
      try {
        const { readOldEverything } = await import("../lib/legacy-blobs.mjs");
        old = await readOldEverything();
      } catch (e) { console.error("old storage not readable", e); }
      const res = await importOld(old);
      await setMeta("old_storage_imported", new Date().toISOString());
      return json(res);
    }

    if (what === "customers") {
      if (!isAdmin) return adminOnly();
      const by = String(body.by || p.get("by") || "").slice(0, 60);
      // Recycle bin
      if (id === "bin" && m === "GET") {
        return json(await listBin({ text: p.get("q") || "", offset: +p.get("offset") || 0, limit: +p.get("limit") || 100 }));
      }
      if (id === "restore" && m === "POST") {
        return json({ restored: await restoreCustomers({ nos: Array.isArray(body.nos) ? body.nos : [], all: body.all === true }, by) });
      }
      if (id === "log" && m === "GET") return json({ log: await deleteLog() });
      if (id === "pin" && m === "POST") return json(await changePin(body.oldPin, body.newPin, by));
      if (id === "pin-check" && m === "POST") {
        const c = await checkPin(body.pin);
        return c.ok ? json({ ok: true }) : json({ error: c.locked ? `Too many wrong PINs. Deleting is locked for ${c.locked} minute(s).`
          : `Wrong Delete PIN.${c.left ? ` ${c.left} tries left.` : ""}`, pinError: true }, 403);
      }
      if (m === "GET") {
        return json(await searchCustomers({ text: p.get("q") || "", offset: +p.get("offset") || 0, limit: +p.get("limit") || 100, dealer: p.get("dealer") || "" }));
      }
      if (m === "POST") {
        const list = Array.isArray(body.customers) ? body.customers : [];
        if (list.length > 2000) return json({ error: "Send at most 2,000 customers at a time" }, 400);
        return json(await upsertCustomers(list));
      }
      if (m === "DELETE") {
        // Every delete needs the Delete PIN.
        const pin = await checkPin(body.pin);
        if (!pin.ok) return json({ error: pin.locked ? `Too many wrong PINs. Deleting is locked for ${pin.locked} minute(s).`
          : pin.notSet ? "No Delete PIN is set up yet." : `Wrong Delete PIN.${pin.left ? ` ${pin.left} tries left.` : ""}`, pinError: true }, 403);
        if (id) return json({ ok: true, deleted: await deleteCustomer(normKey(decodeURIComponent(id)), by) });
        if (body.confirm !== "DELETE ALL") return json({ error: "Not confirmed" }, 400);
        return json({ ok: true, deleted: await deleteAllCustomers(by) });
      }
    }

    // New connections (fiber cylinders). Phones punch them; the office gives
    // stock, checks Aadhaar photos and marks them done.
    if (what === "nc") {
      const nid = /^\d+$/.test(id || "") ? id : null;
      if (!isAdmin) {
        const me = isPartner(body.me || p.get("me")) ? (body.me || p.get("me")) : null;
        if (!me) return json({ error: "Log in on this phone first." }, 400);
        if (m === "GET" && id === "mine") {
          const list = await ncList({ phone: me, limit: 30 });
          return json({ stock: await ncStockFor(me), dealers: await listDealers(), list: list.map(({ aadhaar, hasPhotos, photos, ...r }) => r) });
        }
        if (m === "POST" && !id) return json(await ncCreate(body, me));
        return adminOnly();
      }
      if (m === "GET" && id === "stock") return json({ stock: await ncStock(), log: await ncStockLog() });
      if (m === "POST" && id === "stock") return json(await ncMoveStock(body.phone, body.qty, body.note));
      if (m === "GET" && !id) return json({ list: await ncList({ status: p.get("status") || "", phone: p.get("phone") || "",
        text: p.get("q") || "", dealer: p.get("dealer") || "", limit: +p.get("limit") || 300, from: p.get("from") || null, to: p.get("to") || null }) });
      if (m === "GET" && nid && parts2 === "photo") {
        const side = ["front", "back", "live", "photo"].includes(p.get("side")) ? p.get("side") : "front";
        const ph = await ncPhoto(nid, side);
        if (!ph) return json({ error: "No photo" }, 404);
        return new Response(ph.data, { headers: { "content-type": ph.mime, "cache-control": "no-store, private" } });
      }
      if (m === "POST" && nid && parts2 === "status") return json(await ncSetStatus(nid, body.status, body.note));
      if (m === "POST" && nid && parts2 === "cash") return json(await ncCash(nid, !!body.received));
    }

    if (what === "missing") {
      const mid = /^\d+$/.test(id || "") ? id : null;
      // A delivery man's phone may look at the list and fill a number —
      // but never replace a customer the office already has.
      if (!isAdmin) {
        if (m === "GET" && !id) return json(await listMissing({ text: p.get("q") || "", offset: +p.get("offset") || 0, limit: Math.min(50, +p.get("limit") || 30),
          dealer: p.has("dealer") ? p.get("dealer") : null }));
        if (m === "POST" && mid && parts2 === "fix") {
          if (!isPartner(body.me)) return json({ error: "Log in on this phone first." }, 400);
          const who = String(body.name || "").replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 40);
          return json(await fixMissing(mid, body.no, false, (who ? who + " · " : "") + "+" + body.me));
        }
        return adminOnly();
      }
      if (m === "GET" && id === "filled") return json({ filled: await missingFilled(+p.get("limit") || 100) });
      if (m === "GET") return json(await listMissing({ text: p.get("q") || "", offset: +p.get("offset") || 0, limit: +p.get("limit") || 100,
        dealer: p.has("dealer") ? p.get("dealer") : null }));
      if (m === "POST" && mid && parts2 === "fix") return json(await fixMissing(mid, body.no, body.force === true));
      if (m === "POST") return json(await addMissing(Array.isArray(body.rows) ? body.rows : []));
      if (m === "DELETE" && mid) { await deleteMissing(mid); return json({ ok: true }); }
      if (m === "DELETE" && body.confirm === "CLEAR") { await clearMissing(); return json({ ok: true }); }
    }

    if (what === "lookup" && m === "POST") {
      return json({ customers: await lookupCustomers(Array.isArray(body.nos) ? body.nos.map(String) : []) });
    }

    if (what === "links" && m === "POST") {
      const found = await ensureTokens(Array.isArray(body.items) ? body.items : []);
      const tokens = {};
      Object.values(found).forEach((c) => { tokens[c.no] = c.token; });
      return json({ tokens, customers: Object.values(found) });
    }

    if (what === "bookings") {
      if (m === "POST") {
        const list = Array.isArray(body.bookings) ? body.bookings : [];
        if (list.length > 2000) return json({ error: "Send at most 2,000 bookings at a time" }, 400);
        // A phone's own new bookings are his unless the office says otherwise.
        const me = isPartner(body.me) ? body.me : "";
        const n = await newBookings(list, { assignedTo: isAdmin ? body.assignTo : me, source: isAdmin ? "office" : "phone" });
        return json({ added: n });
      }
      if (m === "GET") {
        if (!isAdmin) return adminOnly();
        if (p.get("view")) {
          const view = ["pending", "waiting", "delivered", "all"].includes(p.get("view")) ? p.get("view") : "all";
          return json({ bookings: await bookingsBehind({ view, who: p.get("who") || "", dealer: p.has("dealer") ? p.get("dealer") : null }) });
        }
        return json({ bookings: await listBookings({ filter: p.get("filter") || "pending", limit: +p.get("limit") || 1000 }) });
      }
    }

    if (what === "ops" && m === "POST") {
      const me = isPartner(body.me) ? body.me : null;
      return json({ done: await applyOps(Array.isArray(body.ops) ? body.ops : [], me) });
    }

    if (what === "sync" && m === "GET") {
      const me = p.get("me") || "";
      if (!isPartner(me)) return json({ error: "Bad phone" }, 400);
      return json({ ...(await syncForPhone(me, +p.get("since") || 0)), logoutAt: await logoutAtFor(me) });
    }

    if (what === "history" && m === "GET") {
      if (!isAdmin) return adminOnly();
      if (p.get("customer")) return json(await customerDeliveries(p.get("customer")));
      if (p.get("dealers")) return json({ dealers: await listDealers() });
      return json(await deliveryHistory({ from: p.get("from"), to: p.get("to"), who: p.get("who") || "", dealer: p.get("dealer") || "" }));
    }

    if (what === "tracker" && m === "GET") {
      if (!isAdmin) return adminOnly();
      if (p.get("list")) {
        return json({ bookings: await trackerList({ key: p.get("list"), dealer: p.has("dealer") ? p.get("dealer") : null, from: p.get("from"), to: p.get("to"), scope: p.get("scope") }) });
      }
      return json(await linkTracker({ from: p.get("from"), to: p.get("to"), scope: p.get("scope") }));
    }

    if (what === "status" && m === "GET") {
      if (!isAdmin) return adminOnly();
      const [rows, team, dealers, names] = await Promise.all([statusSummary(p.get("dealer") || ""), listTeam(), dealerSummary(), teamNames()]);
      return json({ rows, team, dealers, names });
    }

    if (what === "team") {
      // A phone signing itself out.
      if (m === "POST" && id && parts2 === "bye") {
        await logoutTeam(id.replace(/\D/g, ""));
        return json({ ok: true });
      }
      if (m === "POST" && id && parts2 === "remove") {
        if (!isAdmin) return adminOnly();
        return json({ ok: true, moved: await removeTeam(id.replace(/\D/g, "")) });
      }
      if (m === "POST" && id && parts2 === "logout") {
        if (!isAdmin) return adminOnly();
        await logoutTeam(id.replace(/\D/g, ""));
        return json({ ok: true });
      }
      if (m === "POST") {
        const phone = String(body.phone || "").replace(/\D/g, "");
        if (!isPartner(phone)) return json({ error: "Bad phone" }, 400);
        return json({ ok: true, ...(await pingTeam(phone, body.name, body.loginAt, typeof body.dealer === "string" ? body.dealer : null)) });
      }
      // Phones may see their colleagues' names (to pass a booking on).
      if (m === "GET") return json({ team: (await listTeam()).map((t) => isAdmin ? t : { phone: t.phone, name: t.name }) });
      if (!isAdmin) return adminOnly();
      if (m === "DELETE" && id) { await deleteTeam(id.replace(/\D/g, "")); return json({ ok: true }); }
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: String(e.message || e) }, 500);
  }
};

export const config = {
  path: "/api/*",
  excludedPath: ["/api/c/*", "/api/p/*"],
  // 100 phones on one office Wi-Fi share an internet address; this leaves
  // plenty of room for them and still stops anyone guessing passwords.
  rateLimit: { windowLimit: 1500, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
