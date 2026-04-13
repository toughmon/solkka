SET search_path TO solkka;

ALTER TABLE post
DROP COLUMN IF EXISTS is_counseling_requested;
