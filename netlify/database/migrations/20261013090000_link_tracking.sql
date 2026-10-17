-- GasDost: follow each booking's location link — sent, opened, pinned.
ALTER TABLE bookings ADD COLUMN link_sent_at   timestamptz;   -- WhatsApp opened with the link
ALTER TABLE bookings ADD COLUMN link_sent_by   text;          -- 91XXXXXXXXXX of the delivery man, or 'office'
ALTER TABLE bookings ADD COLUMN link_opened_at timestamptz;   -- the customer opened the link page
ALTER TABLE bookings ADD COLUMN pin_via        text;          -- link | phone | saved

-- Bookings that already have a location: say where it came from as best we can.
UPDATE bookings SET pin_via = CASE WHEN source = 'link' THEN 'link' ELSE 'saved' END
WHERE lat IS NOT NULL AND pin_via IS NULL;
