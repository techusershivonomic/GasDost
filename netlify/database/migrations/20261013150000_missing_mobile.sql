-- GasDost: customers uploaded with a name but no (valid) mobile number wait
-- here until the office fills the number in.
CREATE TABLE missing_mobile (
  id          bigserial PRIMARY KEY,
  name        text NOT NULL,
  address     text NOT NULL DEFAULT '',
  dealer      text NOT NULL DEFAULT '',
  bad_mobile  text NOT NULL DEFAULT '',          -- whatever was in the mobile cell, if anything
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- The same person uploaded twice stays one row.
CREATE UNIQUE INDEX missing_mobile_one ON missing_mobile (lower(name), lower(address), lower(dealer));
