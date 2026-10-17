-- GasDost: deleting customers is safer.
-- A deleted customer goes to a recycle bin for 30 days (can be restored),
-- and every delete / restore is written to a small history.
ALTER TABLE customers ADD COLUMN deleted_at timestamptz;
ALTER TABLE customers ADD COLUMN deleted_by text;
CREATE INDEX customers_deleted_idx ON customers (deleted_at);

CREATE TABLE delete_log (
  id      bigserial PRIMARY KEY,
  at      timestamptz NOT NULL DEFAULT now(),
  action  text NOT NULL,           -- delete | delete-all | restore | restore-all | purge | pin-changed
  count   integer NOT NULL DEFAULT 0,
  by      text NOT NULL DEFAULT '',
  detail  text NOT NULL DEFAULT ''
);
