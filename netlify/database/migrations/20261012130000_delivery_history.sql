-- GasDost: a permanent record of every delivery (the bookings table keeps
-- only each customer's current booking, so it is overwritten on rebooking).
CREATE TABLE deliveries (
  id               bigserial PRIMARY KEY,
  no               text NOT NULL,
  name             text NOT NULL DEFAULT '',
  address          text NOT NULL DEFAULT '',
  dealer           text NOT NULL DEFAULT '',
  booking          text NOT NULL DEFAULT '',
  booking_created  timestamptz NOT NULL,          -- which booking of this customer
  assigned_to      text,
  delivered_by     text,
  delivered_at     timestamptz NOT NULL
);
CREATE UNIQUE INDEX deliveries_one_per_booking ON deliveries (no, booking_created);
CREATE INDEX deliveries_at_idx ON deliveries (delivered_at);

-- What has already been delivered goes in straight away.
INSERT INTO deliveries (no, name, address, dealer, booking, booking_created, assigned_to, delivered_by, delivered_at)
SELECT no, name, address, dealer, booking, created_at, assigned_to, delivered_by, COALESCE(delivered_at, changed_at)
FROM bookings WHERE status = 'delivered' AND NOT deleted;
