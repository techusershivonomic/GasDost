-- GasDost: every cancelled booking, with who cancelled it and why
-- (a delivery man at the door — "customer refused" — or the office).
CREATE TABLE cancellations (
  id       bigserial PRIMARY KEY,
  at       timestamptz NOT NULL DEFAULT now(),
  no       text NOT NULL,
  name     text NOT NULL DEFAULT '',
  address  text NOT NULL DEFAULT '',
  dealer   text NOT NULL DEFAULT '',
  booking  text NOT NULL DEFAULT '',
  by       text NOT NULL DEFAULT '',     -- 91XXXXXXXXXX or 'office'
  reason   text NOT NULL DEFAULT ''
);
CREATE INDEX cancellations_at_idx ON cancellations (at DESC);
