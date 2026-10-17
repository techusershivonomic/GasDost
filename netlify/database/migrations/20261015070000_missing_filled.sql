-- GasDost: delivery men can fill a missing mobile number from their phone.
-- Every number filled (by a phone or the office) is noted here.
CREATE TABLE missing_filled (
  id      bigserial PRIMARY KEY,
  at      timestamptz NOT NULL DEFAULT now(),
  no      text NOT NULL,
  name    text NOT NULL DEFAULT '',
  dealer  text NOT NULL DEFAULT '',
  by      text NOT NULL DEFAULT ''
);
CREATE INDEX missing_filled_at_idx ON missing_filled (at DESC);
