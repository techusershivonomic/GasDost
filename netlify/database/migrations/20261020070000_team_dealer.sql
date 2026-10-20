-- GasDost: the dealership each delivery man chose on his phone.
-- NULL = not told yet (older app), '' = works for both / any dealership.
ALTER TABLE team ADD COLUMN dealer text;
