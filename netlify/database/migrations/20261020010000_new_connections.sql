-- GasDost: new connections (fiber cylinders) punched by delivery men.
-- Stock given by the office to each delivery man.
CREATE TABLE nc_stock (
  id     bigserial PRIMARY KEY,
  at     timestamptz NOT NULL DEFAULT now(),
  phone  text NOT NULL,               -- delivery man (91XXXXXXXXXX)
  qty    integer NOT NULL,            -- + given, - returned
  note   text NOT NULL DEFAULT ''
);
CREATE INDEX nc_stock_phone_idx ON nc_stock (phone);

CREATE TABLE new_connections (
  id            bigserial PRIMARY KEY,
  at            timestamptz NOT NULL DEFAULT now(),
  phone         text NOT NULL,        -- delivery man who punched it
  man_name      text NOT NULL DEFAULT '',
  name          text NOT NULL,
  mobile        text NOT NULL,
  address       text NOT NULL DEFAULT '',
  dealer        text NOT NULL DEFAULT '',
  lat           double precision,
  lng           double precision,
  serial        text NOT NULL DEFAULT '',
  amount        numeric(10,2) NOT NULL DEFAULT 0,
  pay_mode      text NOT NULL DEFAULT '',
  cash_received_at timestamptz,
  aadhaar_last4 text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'pending',   -- pending | done | rejected
  status_at     timestamptz,
  status_note   text NOT NULL DEFAULT '',
  photos_deleted_at timestamptz
);
CREATE INDEX new_connections_at_idx ON new_connections (at DESC);
CREATE INDEX new_connections_phone_idx ON new_connections (phone);

-- Aadhaar photos, kept apart so lists never load them. Removed 90 days after Done.
CREATE TABLE nc_photos (
  conn_id  bigint NOT NULL REFERENCES new_connections(id) ON DELETE CASCADE,
  side     text NOT NULL,            -- front | back
  mime     text NOT NULL DEFAULT 'image/jpeg',
  data     bytea NOT NULL,
  PRIMARY KEY (conn_id, side)
);
