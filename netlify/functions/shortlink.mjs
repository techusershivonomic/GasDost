// Short link for WhatsApp / SMS templates:
//   /l/<secret code>            → the customer's location page
//   /l/<secret code>/<phone>    → same, and shows that delivery man's number
// Nothing is looked up here — the page itself checks the code.
export default async (req) => {
  const parts = new URL(req.url).pathname.split("/").filter(Boolean); // ["l", code, phone?]
  const code = parts[1] || "";
  const phone = (parts[2] || "").replace(/\D/g, "");
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(code)) {
    return new Response("This link is not complete. Please ask your gas agency to send it again.", {
      status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  const to = "/share_location.html#t=" + code + (/^\d{10,13}$/.test(phone) ? "&d=" + phone : "");
  return new Response(null, { status: 302, headers: { location: to, "cache-control": "no-store", "referrer-policy": "no-referrer" } });
};

export const config = { path: ["/l/:code", "/l/:code/:phone"] };
