-- GasDost: first version of the database.

-- Customer master list (uploaded by the office). One row per mobile number.
CREATE TABLE customers (
  no          text PRIMARY KEY,              -- 10-digit mobile
  name        text NOT NULL DEFAULT '',
  address     text NOT NULL DEFAULT '',
  dealer      text NOT NULL DEFAULT '',
  code        text UNIQUE,                   -- C0001, C0002 … never reused
  token       text UNIQUE NOT NULL,          -- secret code in the customer's link
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE SEQUENCE customer_code_seq START 1;

-- Newest location each customer confirmed on their link page.
CREATE TABLE locations (
  no       text PRIMARY KEY,
  lat      double precision NOT NULL,
  lng      double precision NOT NULL,
  acc      integer,
  partner  text NOT NULL DEFAULT '',
  at       timestamptz NOT NULL DEFAULT now()
);

-- Current booking per customer mobile, shared by the office and every phone.
CREATE TABLE bookings (
  no            text PRIMARY KEY,
  name          text NOT NULL DEFAULT '',
  address       text NOT NULL DEFAULT '',
  dealer        text NOT NULL DEFAULT '',
  booking       text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'waiting',   -- waiting | shared | delivered
  lat           double precision,
  lng           double precision,
  loc_at        timestamptz,
  assigned_to   text,                               -- 91XXXXXXXXXX of the delivery man, or NULL = anyone
  delivered_by  text,
  delivered_at  timestamptz,
  source        text NOT NULL DEFAULT '',
  deleted       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  changed_at    timestamptz NOT NULL DEFAULT now()  -- phones download whatever changed since their last check
);
CREATE INDEX bookings_changed_idx  ON bookings (changed_at);
CREATE INDEX bookings_assigned_idx ON bookings (assigned_to);

-- Delivery men and when their phone last checked in.
CREATE TABLE team (
  phone        text PRIMARY KEY,
  name         text NOT NULL DEFAULT '',
  last_active  timestamptz NOT NULL DEFAULT now(),
  logout_at    timestamptz                         -- office pressed "Log out" for this phone
);

-- Small settings, e.g. whether the old storage has been moved across.
CREATE TABLE meta (
  key    text PRIMARY KEY,
  value  text
);
