-- GasDost: follow location links per saved customer too (not only per booking).
ALTER TABLE customers ADD COLUMN link_sent_at   timestamptz;
ALTER TABLE customers ADD COLUMN link_sent_by   text;
ALTER TABLE customers ADD COLUMN link_opened_at timestamptz;
ALTER TABLE locations ADD COLUMN via            text;          -- link | phone

-- Carry over what the bookings already know.
UPDATE customers c SET link_sent_at = b.link_sent_at, link_sent_by = b.link_sent_by, link_opened_at = b.link_opened_at
FROM bookings b WHERE b.no = c.no AND (b.link_sent_at IS NOT NULL OR b.link_opened_at IS NOT NULL);
UPDATE locations l SET via = b.pin_via FROM bookings b WHERE b.no = l.no AND b.pin_via IN ('link', 'phone');
