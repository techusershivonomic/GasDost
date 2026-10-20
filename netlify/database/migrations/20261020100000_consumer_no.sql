-- GasDost: the oil company's consumer number, kept with each customer
-- (and with rows still waiting for a mobile number) for searching.
ALTER TABLE customers ADD COLUMN consumer_no text NOT NULL DEFAULT '';
CREATE INDEX customers_consumer_no_idx ON customers (consumer_no) WHERE consumer_no <> '';
ALTER TABLE missing_mobile ADD COLUMN consumer_no text NOT NULL DEFAULT '';
