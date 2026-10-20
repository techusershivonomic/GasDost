-- GasDost: 3 old delivery records (12 Oct, before the dealership names were
-- cleaned up) said "DARSHAN GAS". They belong to DARSHAN GAS SERVICE.
UPDATE deliveries SET dealer = 'DARSHAN GAS SERVICE' WHERE lower(trim(dealer)) = 'darshan gas';
UPDATE bookings   SET dealer = 'DARSHAN GAS SERVICE' WHERE lower(trim(dealer)) = 'darshan gas';
