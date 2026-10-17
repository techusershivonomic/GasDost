-- GasDost: one mobile number can be a customer of more than one dealership.
-- Each mobile + dealership is its own customer. The first keeps the plain
-- 10-digit number as its key; the others get 9876500001-2, -3 … (the mobile
-- itself is always the first 10 digits).
CREATE INDEX customers_mobile_idx ON customers (left(no, 10));
CREATE INDEX bookings_mobile_idx  ON bookings  (left(no, 10));
